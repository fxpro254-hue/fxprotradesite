import React, { useState, useEffect, useRef } from 'react';
import './branded-loader.scss';

type BrandedLoaderProps = {
    message?: string;
    subMessage?: string;
    showProgress?: boolean;
};

const BrandedLoader: React.FC<BrandedLoaderProps> = ({ 
    message = "Initializing Binary Trading Core...", 
    subMessage = "Preparing quantum entanglement networks",
    showProgress = true 
}) => {
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState(message);
    const [particleCount] = useState(() => Math.min(50, Math.floor(window.innerWidth / 20)));
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const MINIMUM_LOADING_TIME = 4000; // 4 seconds for better UX

    const loadingSteps = [
        "Establishing binary connections...",
        "Calibrating probability waves...",
        "Initializing superposition states...",
        "Engaging quantum decoherence filters...",
        "Aligning with market uncertainty principle...",
        "Ready for binary trading!"
    ];

    // Quantum particles animation with Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions to match parent
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };

        // Initial resize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Quantum particle class
        class QuantumParticle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            hue: number;
            opacity: number;
            connectionRadius: number;
            entangled: QuantumParticle | null = null;
            entanglementStrength: number = 0;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.speedY = (Math.random() - 0.5) * 1.5;
                this.hue = Math.random() > 0.5 
                    ? Math.floor(Math.random() * 40 + 240) // Blue spectrum
                    : Math.floor(Math.random() * 60 + 280); // Purple spectrum
                this.opacity = Math.random() * 0.5 + 0.3;
                this.connectionRadius = Math.random() * 100 + 50;
            }

            update() {
                // Update position with boundary check
                this.x += this.speedX;
                if (this.x > canvas.width || this.x < 0) {
                    this.speedX *= -1;
                }
                
                this.y += this.speedY;
                if (this.y > canvas.height || this.y < 0) {
                    this.speedY *= -1;
                }

                // Quantum fluctuation effect
                if (Math.random() < 0.01) {
                    this.speedX = (Math.random() - 0.5) * 1.5;
                    this.speedY = (Math.random() - 0.5) * 1.5;
                }

                // Update entanglement
                if (this.entangled) {
                    this.entanglementStrength = Math.min(1, this.entanglementStrength + 0.01);
                } else if (Math.random() < 0.001) {
                    this.entanglementStrength = Math.max(0, this.entanglementStrength - 0.01);
                }
            }

            draw() {
                if (!ctx) return;
                
                // Draw the particle
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 100%, 65%, ${this.opacity})`;
                ctx.fill();
                
                // Add glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, 0.8)`;
                
                // Reset shadow
                ctx.shadowBlur = 0;
            }
        }

        // Create particles
        const particles: QuantumParticle[] = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new QuantumParticle());
        }

        // Randomly create entangled pairs
        for (let i = 0; i < particles.length; i += 2) {
            if (i + 1 < particles.length && Math.random() < 0.3) {
                particles[i].entangled = particles[i + 1];
                particles[i + 1].entangled = particles[i];
            }
        }

        // Animation loop
        const animate = () => {
            if (!ctx) return;
            
            // Clear canvas with a fade effect
            ctx.fillStyle = 'rgba(5, 0, 35, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw quantum wave grid
            const time = Date.now() * 0.001;
            ctx.strokeStyle = 'rgba(106, 0, 255, 0.08)';
            ctx.lineWidth = 1;
            
            // Horizontal wave lines
            const lineCount = 20;
            const ySpacing = canvas.height / lineCount;
            for (let i = 0; i < lineCount; i++) {
                ctx.beginPath();
                for (let x = 0; x < canvas.width; x += 5) {
                    const y = i * ySpacing + Math.sin(x * 0.01 + time + i * 0.2) * 10;
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            
            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            // Draw connections between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const maxDistance = particles[i].connectionRadius;
                    
                    if (distance < maxDistance) {
                        // Regular connections
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(106, 0, 255, ${0.1 * (1 - distance / maxDistance)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                    
                    // Draw entanglement connection if exists
                    if (particles[i].entangled === particles[j]) {
                        const strength = particles[i].entanglementStrength;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 0, 230, ${0.3 * strength})`;
                        ctx.lineWidth = 1;
                        ctx.setLineDash([5, 5]);
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                }
            }
            
            requestAnimationFrame(animate);
        };
        
        // Start animation
        const animationId = requestAnimationFrame(animate);
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, [particleCount]);

    // Loading progress timer
    useEffect(() => {
        const startTime = Date.now();
        let stepIndex = 0;
        let hasReached100 = false;

        const timer = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            let progressValue = (elapsedTime / MINIMUM_LOADING_TIME) * 100;
            
            // Ensure we reach exactly 100% at the end
            if (progressValue >= 100) {
                progressValue = 100;
                hasReached100 = true;
            }
            
            setProgress(Math.floor(progressValue));

            // Update loading text based on progress
            const newStepIndex = Math.floor((progressValue / 100) * (loadingSteps.length - 1));
            if (newStepIndex !== stepIndex && newStepIndex < loadingSteps.length) {
                stepIndex = newStepIndex;
                setLoadingText(loadingSteps[stepIndex]);
            }

            // When we reach 100%, show final message and clear timer
            if (hasReached100) {
                setLoadingText("Binary State Ready");
                setTimeout(() => {
                    clearInterval(timer);
                }, 500); // Give a moment to see 100%
            }
        }, 50);

        return () => clearInterval(timer);
    }, [loadingSteps]);

    return (
        <div className='branded-loader binary-theme'>
            <canvas ref={canvasRef} className='quantum-canvas'></canvas>

            <div className='loader-container'>
                <div className='brand-section'>
                    <div className='quantum-visualization'>
                        <div className='q-sphere'>
                            <div className='q-core'></div>
                            <div className='q-orbit orbit-1'></div>
                            <div className='q-orbit orbit-2'></div>
                            <div className='q-orbit orbit-3'></div>
                            <div className='q-electron e1'></div>
                            <div className='q-electron e2'></div>
                            <div className='q-electron e3'></div>
                            <div className='q-wave'></div>
                            <div className='q-probability-cloud'></div>
                        </div>
                    </div>
                    
                    <div className='brand-text'>
                        <h1 className='brand-title'>
                            Binary<span className='highlight'>FX</span>
                        </h1>
                        <p className='brand-subtitle'>
                            <span className='brand-name'>Binary Trading Engine</span>
                        </p>
                    </div>
                </div>

                {showProgress && (
                    <div className='progress-section'>
                        <div className='progress-container'>
                            <div className='progress-track'>
                                <div 
                                    className='progress-fill'
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className='progress-shine'></div>
                                </div>
                            </div>
                            <div className='progress-text'>{progress}%</div>
                        </div>
                        
                        <div className='loading-status'>
                            <div className='status-text'>{loadingText}</div>
                            <div className='loading-dots'>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        
                        {subMessage && (
                            <div className='sub-message'>{subMessage}</div>
                        )}
                    </div>
                )}

                <div className='feature-highlights'>
                    <div className='feature'>
                        <div className='feature-icon'>⚛️</div>
                        <span>Quantum Entanglement</span>
                    </div>
                    <div className='feature'>
                        <div className='feature-icon'>🌊</div>
                        <span>Wave Function</span>
                    </div>
                    <div className='feature'>
                        <div className='feature-icon'>🔄</div>
                        <span>Superposition</span>
                    </div>
                    <div className='feature'>
                        <div className='feature-icon'>🌌</div>
                        <span>Quantum Coherence</span>
                    </div>
                </div>
            </div>

            <div className='version-info'>
                <span>v4.1.0 - Binary Core</span>
            </div>
        </div>
    );
};

export default BrandedLoader;
