import React from "react";
import "./PremiumBoltLoader.css";

interface Props {
  message?: string;
}

const PremiumBoltLoader: React.FC<Props> = ({ message }) => {
  return (
    <div className="bolt-loader-wrapper">
      <div className="bolt-loader-container">
        <div className="bolt-glow"></div>

        <img
          className="bolt-logo"
          src="https://pikwizard.com/pw/medium/431483f16b507e51b042c748e0e1c0c9.png"
          alt="Gold Lightning Bolt"
        />
      </div>

      {message && (
        <p className="bolt-loader-text">
          {message}
        </p>
      )}
    </div>
  );
};

export default PremiumBoltLoader;