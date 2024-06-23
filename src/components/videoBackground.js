import React, { useRef, useEffect, useState } from 'react';
import './styles/VideoBackground.css'; 


const VideoBackground = () => {
    const videoRef = useRef(null);
    const [scrollDirection, setScrollDirection] = useState('none'); 
    const animationRef = useRef(null);
  
    useEffect(() => {
      const handleScroll = () => {
        if (window.scrollY > window.scrollYOffset) {
          setScrollDirection('down');
        } else {
          setScrollDirection('up');
        }
      };
  
      window.addEventListener('scroll', handleScroll);
  
      return () => {
        window.removeEventListener('scroll', handleScroll);
        cancelAnimationFrame(animationRef.current);
      };
    }, []);
  
    useEffect(() => {
      const video = videoRef.current;
  
      const handleScrollPlayback = () => {
        if (scrollDirection === 'down') {
          video.play();
        } else if (scrollDirection === 'up') {
          // Reverse playback manually
          cancelAnimationFrame(animationRef.current); // Cancel previous animation frame if any
  
          const backwardPlay = () => {
            if (video.currentTime > 0) {
              video.currentTime -= 0.03; // Adjust the step as needed for smoother playback
              animationRef.current = requestAnimationFrame(backwardPlay);
            }
          };
  
          backwardPlay();
        } else {
          video.pause();
        }
      };
  
      handleScrollPlayback();
  
      return () => {
        video.pause();
        cancelAnimationFrame(animationRef.current);
      };
    }, [scrollDirection]);
  
    return (
      <div className="video-background" style={{ position: 'relative', width: '100%', height: '500px' }}>
        <video ref={videoRef} className="fullscreen-video" autoPlay loop muted>
          <source src="test.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="content-below">
        </div>
      </div>
    );
  };
  
  export default VideoBackground;