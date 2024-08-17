import React from 'react';
import ThreeDLine from './components/threeDline';
import WelcomeText from './components/threeDWelcome';
import InteractiveExperience from './components/interactiveExperience';
import './App.css';

const App = () => {
  return (
    <div className='app-container'>
      <InteractiveExperience/>
      <div className='scroll-container'>
        <ThreeDLine>
          <div className='welcome-text-container'>
            <WelcomeText />
          </div>
        </ThreeDLine>
        {/* <div className='interactive-skill-container'>
          <InteractiveSkill />
        </div> */}
      </div>
    </div>
  );
};

export default App;
