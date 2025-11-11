import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { Localize } from '@deriv-com/translations';
import {
    handleGetCategories,
    handleGetMessages,
    handleCreateMessage,
    handleRegisterUser,
    handleUpdateUserStatus,
    handleGetUserStats,
    handleToggleReaction,
} from '../../api/community.api';
import './community.scss';

interface Message {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    timestamp: Date;
    replyTo?: {
        id: string;
        userName: string;
        content: string;
    };
    attachments?: {
        type: 'image' | 'video';
        url: string;
    }[];
    reactions?: {
        emoji: string;
        userIds: string[];
    }[];
}

interface User {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
    bio: string;
    joinedDate: string;
    messagesCount: number;
}

interface Category {
    id: string;
    name: string;
    description: string;
    icon: string;
    messageCount: number;
}

const Community: React.FC = observer(() => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
    const [usernameInput, setUsernameInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isInitialLoadRef = useRef(true);

    // Common emojis
    const emojis = ['😀', '😊', '👍', '🎉', '💰', '📈', '📉', '🚀', '💪', '🔥', '❤️', '👏', '🤔', '😎', '🙏'];

    // Get loginId helper
    const getLoginId = (): string => {
        const accountsList = localStorage.getItem('accountsList');
        if (accountsList) {
            try {
                const accounts = JSON.parse(accountsList);
                const accountKeys = Object.keys(accounts);
                if (accountKeys.length > 0) {
                    return accountKeys[0];
                }
            } catch (e) {
                console.error('Error parsing accountsList:', e);
            }
        }
        return localStorage.getItem('active_loginid') || 'guest_' + Date.now();
    };

    // Initialize user and load data from database
    useEffect(() => {
        const initializeCommunity = async () => {
            try {
                const loginId = getLoginId();
                
                // Check if user exists in database first
                const statsResult = await handleGetUserStats(loginId);
                
                if (statsResult.success && statsResult.data) {
                    // User exists in database
                    setCurrentUser({
                        id: statsResult.data.id,
                        name: statsResult.data.fullName,
                        avatar: statsResult.data.avatar || '👤',
                        status: statsResult.data.status as 'online' | 'offline' | 'away',
                        bio: statsResult.data.bio || 'Trading enthusiast',
                        joinedDate: new Date(statsResult.data.joinedDate).toLocaleDateString(),
                        messagesCount: statsResult.data.messagesCount,
                    });

                    // Update status to online
                    await handleUpdateUserStatus(loginId, 'online');
                    
                    // Save username to localStorage for future reference
                    localStorage.setItem(`community_username_${loginId}`, statsResult.data.fullName);
                } else {
                    // User doesn't exist in database, prompt for username
                    setShowUsernamePrompt(true);
                    setLoading(false);
                    return;
                }

                // Load categories from database
                const categoriesResult = await handleGetCategories();
                if (categoriesResult.success && categoriesResult.data) {
                    setCategories(categoriesResult.data);
                    if (categoriesResult.data.length > 0) {
                        setActiveCategory(categoriesResult.data[0]);
                    }
                }
            } catch (error) {
                console.error('Error initializing community:', error);
                // If error checking database, prompt for username
                setShowUsernamePrompt(true);
            } finally {
                setLoading(false);
            }
        };

        initializeCommunity();

        // Cleanup: set status to offline on unmount
        return () => {
            const loginId = getLoginId();
            handleUpdateUserStatus(loginId, 'offline');
        };
    }, []);

    // Load messages when category changes
    useEffect(() => {
        const loadMessages = async () => {
            if (!activeCategory) return;

            // Reset initial load flag when category changes
            isInitialLoadRef.current = true;

            try {
                const result = await handleGetMessages(activeCategory.id, 50);
                
                if (result.success && result.data) {
                    const formattedMessages: Message[] = result.data.map((msg: any) => ({
                        id: msg.id,
                        userId: msg.userId,
                        userName: msg.user.fullName,
                        userAvatar: msg.user.avatar || '👤',
                        content: msg.content,
                        timestamp: new Date(msg.createdAt),
                        replyTo: msg.replyTo
                            ? {
                                  id: msg.replyTo.id,
                                  userName: msg.replyTo.user.fullName,
                                  content: msg.replyTo.content,
                              }
                            : undefined,
                        attachments: msg.attachments?.map((att: any) => ({
                            type: att.type,
                            url: att.url,
                        })),
                        reactions: msg.reactions?.map((reaction: any) => ({
                            emoji: reaction.emoji,
                            userIds: reaction.userIds,
                        })) || [],
                    }));
                    setMessages(formattedMessages);
                    
                    // Scroll to bottom instantly on initial load
                    if (isInitialLoadRef.current) {
                        setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
                            isInitialLoadRef.current = false;
                        }, 100);
                    }
                }
            } catch (error) {
                console.error('Error loading messages:', error);
                setMessages([]);
            }
        };

        loadMessages();
    }, [activeCategory]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle username submission
    const handleUsernameSubmit = async () => {
        if (!usernameInput.trim()) return;

        const loginId = getLoginId();
        localStorage.setItem(`community_username_${loginId}`, usernameInput.trim());

        // Register user in database
        const userResult = await handleRegisterUser(loginId, usernameInput.trim());
        
        if (userResult.success && userResult.data) {
            const statsResult = await handleGetUserStats(loginId);
            
            if (statsResult.success && statsResult.data) {
                setCurrentUser({
                    id: statsResult.data.id,
                    name: statsResult.data.fullName,
                    avatar: statsResult.data.avatar || '👤',
                    status: 'online',
                    bio: statsResult.data.bio || 'Trading enthusiast',
                    joinedDate: new Date(statsResult.data.joinedDate).toLocaleDateString(),
                    messagesCount: statsResult.data.messagesCount,
                });
            }

            await handleUpdateUserStatus(loginId, 'online');
        }

        setShowUsernamePrompt(false);
        setUsernameInput('');

        // Load categories after user is registered
        const categoriesResult = await handleGetCategories();
        if (categoriesResult.success && categoriesResult.data) {
            setCategories(categoriesResult.data);
            if (categoriesResult.data.length > 0) {
                setActiveCategory(categoriesResult.data[0]);
            }
        }
    };

    // Handle send message
    const handleSendMessage = async () => {
        if (!messageInput.trim() || !currentUser || !activeCategory) return;

        try {
            const attachments = attachmentPreview ? [{
                type: 'image' as const,
                url: attachmentPreview,
            }] : undefined;

            const result = await handleCreateMessage(
                currentUser.id,
                activeCategory.id,
                messageInput.trim(),
                replyingTo?.id,
                attachments
            );

            if (result.success && result.data) {
                // Add new message to the list
                const newMessage: Message = {
                    id: result.data.id,
                    userId: result.data.userId,
                    userName: result.data.user.fullName,
                    userAvatar: result.data.user.avatar || '👤',
                    content: result.data.content,
                    timestamp: new Date(result.data.createdAt),
                    replyTo: result.data.replyTo
                        ? {
                              id: result.data.replyTo.id,
                              userName: result.data.replyTo.user.fullName,
                              content: result.data.replyTo.content,
                          }
                        : undefined,
                    attachments: result.data.attachments?.map((att: any) => ({
                        type: att.type,
                        url: att.url,
                    })),
                };

                setMessages([...messages, newMessage]);

                // Update current user's message count
                setCurrentUser({ ...currentUser, messagesCount: currentUser.messagesCount + 1 });
            }

            // Reset input
            setMessageInput('');
            setReplyingTo(null);
            setAttachmentPreview(null);
            setShowEmojiPicker(false);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAttachmentPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReply = (message: Message) => {
        setReplyingTo(message);
    };

    const handleReaction = async (messageId: string, emoji: string) => {
        if (!currentUser) return;

        try {
            // Optimistically update UI
            setMessages(prevMessages => 
                prevMessages.map(msg => {
                    if (msg.id === messageId) {
                        const reactions = msg.reactions || [];
                        const existingReaction = reactions.find(r => r.emoji === emoji);
                        
                        if (existingReaction) {
                            // Toggle reaction - remove if user already reacted
                            if (existingReaction.userIds.includes(currentUser.id)) {
                                const updatedUserIds = existingReaction.userIds.filter(id => id !== currentUser.id);
                                return {
                                    ...msg,
                                    reactions: updatedUserIds.length > 0
                                        ? reactions.map(r => r.emoji === emoji ? { ...r, userIds: updatedUserIds } : r)
                                        : reactions.filter(r => r.emoji !== emoji)
                                };
                            } else {
                                // Add user to existing reaction
                                return {
                                    ...msg,
                                    reactions: reactions.map(r => 
                                        r.emoji === emoji 
                                            ? { ...r, userIds: [...r.userIds, currentUser.id] } 
                                            : r
                                    )
                                };
                            }
                        } else {
                            // Add new reaction
                            return {
                                ...msg,
                                reactions: [...reactions, { emoji, userIds: [currentUser.id] }]
                            };
                        }
                    }
                    return msg;
                })
            );

            // Save to database
            await handleToggleReaction(messageId, emoji, currentUser.id);
        } catch (error) {
            console.error('Error handling reaction:', error);
            // Optionally: reload messages to sync with database
        }
    };

    const handleViewProfile = (message: Message) => {
        setSelectedUser({
            id: message.userId,
            name: message.userName,
            avatar: message.userAvatar,
            status: 'online',
            bio: 'Trading enthusiast',
            joinedDate: new Date().toLocaleDateString(),
            messagesCount: messages.filter(m => m.userId === message.userId).length,
        });
        setShowProfileModal(true);
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="community">
                <div className="community__loading">
                    <div className="community__loading-content">
                        <div className="community__loading-spinner">
                            <div className="community__loading-dot"></div>
                            <div className="community__loading-dot"></div>
                            <div className="community__loading-dot"></div>
                        </div>
                        <h3 className="community__loading-title">
                            <Localize i18n_default_text="Loading Community" />
                        </h3>
                        <p className="community__loading-subtitle">
                            <Localize i18n_default_text="Connecting you with traders worldwide..." />
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="community">
            {/* Username Prompt Modal */}
            {showUsernamePrompt && (
                <div className="community__modal-overlay">
                    <div className="community__username-prompt">
                        <h2>
                            <Localize i18n_default_text="Welcome to Community!" />
                        </h2>
                        <p>
                            <Localize i18n_default_text="Please choose a username to continue" />
                        </p>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                            autoFocus
                        />
                        <button onClick={handleUsernameSubmit} disabled={!usernameInput.trim()}>
                            <Localize i18n_default_text="Continue" />
                        </button>
                    </div>
                </div>
            )}

            {/* Categories Sidebar */}
            <div className="community__sidebar">
                <div className="community__sidebar-header">
                    <h3>
                        <Localize i18n_default_text="Channels" />
                    </h3>
                </div>
                <div className="community__categories">
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className={classNames('community__category', {
                                'community__category--active': activeCategory?.id === category.id,
                            })}
                            onClick={() => setActiveCategory(category)}
                        >
                            <span className="community__category-icon">{category.icon}</span>
                            <div className="community__category-info">
                                <span className="community__category-name">{category.name}</span>
                                <span className="community__category-desc">{category.description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="community__chat">
                {/* Chat Header */}
                <div className="community__chat-header">
                    <div className="community__chat-header-info">
                        <span className="community__chat-header-icon">{activeCategory?.icon}</span>
                        <div>
                            <h3>{activeCategory?.name}</h3>
                            <p>{activeCategory?.description}</p>
                        </div>
                    </div>
                    {currentUser && (
                        <div className="community__user-info" onClick={() => handleViewProfile({
                            id: currentUser.id,
                            userId: currentUser.id,
                            userName: currentUser.name,
                            userAvatar: currentUser.avatar,
                            content: '',
                            timestamp: new Date(),
                        })}>
                            <span className="community__user-avatar">{currentUser.avatar}</span>
                            <span className="community__user-name">{currentUser.name}</span>
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="community__messages">
                    {messages.length === 0 ? (
                        <div className="community__empty-state">
                            <Localize i18n_default_text="No messages yet. Start the conversation!" />
                        </div>
                    ) : (
                        messages.map(message => {
                            const isOwnMessage = currentUser && message.userId === currentUser.id;
                            return (
                                <div 
                                    key={message.id} 
                                    className={classNames('community__message', {
                                        'community__message--own': isOwnMessage
                                    })}
                                >
                                    <div className="community__message-content">
                                        <div className="community__message-header">
                                            {!isOwnMessage && (
                                                <div className="community__message-avatar" onClick={() => handleViewProfile(message)}>
                                                    {message.userAvatar}
                                                </div>
                                            )}
                                            <div className="community__message-header-text">
                                                <span className="community__message-user" onClick={() => handleViewProfile(message)}>
                                                    {message.userName}
                                                </span>
                                                <span className="community__message-time">{formatTime(message.timestamp)}</span>
                                            </div>
                                            {isOwnMessage && (
                                                <div className="community__message-avatar" onClick={() => handleViewProfile(message)}>
                                                    {message.userAvatar}
                                                </div>
                                            )}
                                        </div>
                                        {message.replyTo && (
                                            <div className="community__message-reply">
                                                <div className="community__message-reply-content">
                                                    <span className="community__message-reply-user">{message.replyTo.userName}</span>
                                                    <p>{message.replyTo.content}</p>
                                                </div>
                                            </div>
                                        )}
                                        <p className="community__message-text">{message.content}</p>
                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className="community__message-attachments">
                                                {message.attachments.map((att, idx) => (
                                                    <img key={idx} src={att.url} alt="attachment" />
                                                ))}
                                            </div>
                                        )}
                                        <div className="community__message-footer">
                                            {/* Reactions Display */}
                                            {message.reactions && message.reactions.length > 0 && (
                                                <div className="community__message-reactions">
                                                    {message.reactions.map((reaction, idx) => (
                                                        <button
                                                            key={idx}
                                                            className={classNames('community__message-reaction', {
                                                                'community__message-reaction--active': currentUser && reaction.userIds.includes(currentUser.id)
                                                            })}
                                                            onClick={() => handleReaction(message.id, reaction.emoji)}
                                                            title={`${reaction.userIds.length} reaction${reaction.userIds.length > 1 ? 's' : ''}`}
                                                        >
                                                            <span>{reaction.emoji}</span>
                                                            <span className="community__message-reaction-count">{reaction.userIds.length}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Quick Reactions */}
                                            <div className="community__message-quick-reactions">
                                                {['👍', '❤️', '😊', '🔥', '🚀'].map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        className="community__message-quick-reaction"
                                                        onClick={() => handleReaction(message.id, emoji)}
                                                        title={`React with ${emoji}`}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Reply Button */}
                                            <button 
                                                className="community__message-reply-btn" 
                                                onClick={() => handleReply(message)}
                                                title="Reply to this message"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M6.5 3.5L2 8L6.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M2 8H10C11.6569 8 13 9.34315 13 11V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                {messages.filter(m => m.replyTo?.id === message.id).length > 0 && (
                                                    <span className="community__message-reply-count">
                                                        {messages.filter(m => m.replyTo?.id === message.id).length}
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="community__input-container">
                    {replyingTo && (
                        <div className="community__replying-to">
                            <span>
                                <Localize i18n_default_text="Replying to" /> {replyingTo.userName}
                            </span>
                            <button onClick={() => setReplyingTo(null)}>✕</button>
                        </div>
                    )}
                    {attachmentPreview && (
                        <div className="community__attachment-preview">
                            <img src={attachmentPreview} alt="preview" />
                            <button onClick={() => setAttachmentPreview(null)}>✕</button>
                        </div>
                    )}
                    <div className="community__input-wrapper">
                        <button
                            className="community__input-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            📎
                        </button>
                        <input
                            type="text"
                            className="community__input"
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={!currentUser}
                        />
                        <button
                            className="community__input-btn"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            😊
                        </button>
                        <button
                            className="community__input-btn community__input-btn--send"
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim() || !currentUser}
                        >
                            ➤
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                    </div>
                    {showEmojiPicker && (
                        <div className="community__emoji-picker">
                            {emojis.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => {
                                        setMessageInput(messageInput + emoji);
                                        setShowEmojiPicker(false);
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            {showProfileModal && selectedUser && (
                <div className="community__modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="community__profile-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="community__profile-close" onClick={() => setShowProfileModal(false)}>
                            ✕
                        </button>
                        <div className="community__profile-header">
                            <div className="community__profile-avatar">{selectedUser.avatar}</div>
                            <h2>{selectedUser.name}</h2>
                            <div className={`community__profile-status community__profile-status--${selectedUser.status}`}>
                                {selectedUser.status}
                            </div>
                        </div>
                        <div className="community__profile-body">
                            <div className="community__profile-field">
                                <label>
                                    <Localize i18n_default_text="Bio" />
                                </label>
                                <p>{selectedUser.bio}</p>
                            </div>
                            <div className="community__profile-stats">
                                <div className="community__profile-stat">
                                    <span className="community__profile-stat-value">{selectedUser.messagesCount}</span>
                                    <span className="community__profile-stat-label">
                                        <Localize i18n_default_text="Messages" />
                                    </span>
                                </div>
                                <div className="community__profile-stat">
                                    <span className="community__profile-stat-value">{selectedUser.joinedDate}</span>
                                    <span className="community__profile-stat-label">
                                        <Localize i18n_default_text="Joined" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Community;
