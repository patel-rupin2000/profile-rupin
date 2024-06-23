import React from 'react';
import './styles/WelcomeText.css'; // Import CSS file

const WelcomeText = () => {
  const text = `Welcome to my portfolio! I'm Rupin Patel, a full stack developer with extensive experience in simulations, migrations, and artificial intelligence. My expertise lies in bridging complex technical challenges with innovative solutions, creating seamless and efficient systems. With a passion for cutting-edge technology, I thrive on transforming intricate problems into streamlined processes. Explore my portfolio to learn more about the unique blend of creativity and technical acumen that drives my work and see how I can bring value to your projects.`;

  const words = text.split(/(\s+)/);

  return (
    <div className="intro-container" style={{justifyContent:"center", textAlign:"center"}}>
      <p>
        {words.map((word, index) => (
          word.trim() ? (
            <span key={index} className="wave">{word}</span>
          ) : (
            <span key={index}>&nbsp;</span>
          )
        ))}
      </p>
    </div>
  );
};

export default WelcomeText;
