import { useEffect, useRef } from 'react';
import '../styles/WeatherAnimation.css';

const WeatherAnimation = ({ weatherCode }) => {
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null); // Store animation frame ID in a ref
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear previous animations
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation elements
    let particles = [];
    
    // Create animation based on weather code
    // Weather codes from OpenWeatherMap: https://openweathermap.org/weather-conditions
    const weatherType = getWeatherType(weatherCode);
    
    switch (weatherType) {
      case 'rain':
        setupRainAnimation(canvas, ctx, particles, animationFrameIdRef);
        break;
      case 'snow':
        setupSnowAnimation(canvas, ctx, particles, animationFrameIdRef);
        break;
      case 'clouds':
        setupCloudAnimation(canvas, ctx, particles, animationFrameIdRef);
        break;
      case 'clear':
        setupSunAnimation(canvas, ctx, animationFrameIdRef);
        break;
      case 'thunderstorm':
        setupThunderstormAnimation(canvas, ctx, particles, animationFrameIdRef);
        break;
      default:
        // No animation for unknown weather
        break;
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [weatherCode]);
  
  // Determine weather type from code
  const getWeatherType = (code) => {
    if (!code) return 'clear';
    
    // OpenWeatherMap icon codes
    if (code.includes('01')) return 'clear';
    if (code.includes('02') || code.includes('03') || code.includes('04')) return 'clouds';
    if (code.includes('09') || code.includes('10')) return 'rain';
    if (code.includes('11')) return 'thunderstorm';
    if (code.includes('13')) return 'snow';
    if (code.includes('50')) return 'mist';
    
    return 'clear';
  };
  
  // Rain animation setup
  const setupRainAnimation = (canvas, ctx, particles, animationFrameIdRef) => {
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 10 + 10,
        thickness: Math.random() * 2 + 1
      });
    }
    
    const drawRain = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
      ctx.lineWidth = 1;
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(
          particle.x + particle.length * Math.sin(Math.PI / 4),
          particle.y + particle.length * Math.cos(Math.PI / 4)
        );
        ctx.stroke();
        
        // Move rain drops
        particle.y += particle.speed;
        
        // Reset rain drops when they fall off canvas
        if (particle.y > canvas.height) {
          particle.y = -20;
          particle.x = Math.random() * canvas.width;
        }
      });
      
      animationFrameIdRef.current = requestAnimationFrame(drawRain);
    };
    
    drawRain();
  };
  
  // Snow animation setup
  const setupSnowAnimation = (canvas, ctx, particles, animationFrameIdRef) => {
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 1,
        wind: Math.random() * 0.5 - 0.25
      });
    }
    
    const drawSnow = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Move snowflakes
        particle.y += particle.speed;
        particle.x += particle.wind;
        
        // Add some wobble to the snowflakes
        particle.wind += Math.random() * 0.2 - 0.1;
        particle.wind = Math.max(-0.5, Math.min(0.5, particle.wind));
        
        // Reset snowflakes when they fall off canvas
        if (particle.y > canvas.height) {
          particle.y = -5;
          particle.x = Math.random() * canvas.width;
        }
        
        // Wrap snowflakes horizontally
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
      });
      
      animationFrameIdRef.current = requestAnimationFrame(drawSnow);
    };
    
    drawSnow();
  };
  
  // Cloud animation setup - Improved version
  const setupCloudAnimation = (canvas, ctx, particles, animationFrameIdRef) => {
    // Clear existing particles
    particles.length = 0;
    
    // Add fewer, larger clouds
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height / 3) + 20,
        width: Math.random() * 120 + 80, // Larger width
        height: Math.random() * 50 + 30,  // Larger height
        speed: Math.random() * 0.3 + 0.1  // Slightly slower movement
      });
    }
    
    const drawClouds = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(cloud => {
        // Save the current context state
        ctx.save();
        
        // Use a better cloud drawing technique
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Create a cloud shape using bezier curves
        ctx.beginPath();
        
        // Start point at the bottom-left of the cloud
        const startX = cloud.x;
        const startY = cloud.y + cloud.height / 2;
        
        ctx.moveTo(startX, startY);
        
        // Bottom curve
        ctx.bezierCurveTo(
          startX - cloud.width * 0.1, startY + cloud.height * 0.1, 
          startX + cloud.width * 1.1, startY + cloud.height * 0.1,
          startX + cloud.width, startY
        );
        
        // Right side curve
        ctx.bezierCurveTo(
          startX + cloud.width * 1.1, startY - cloud.height * 0.5,
          startX + cloud.width * 0.7, startY - cloud.height * 1.2,
          startX + cloud.width * 0.6, startY - cloud.height * 0.6
        );
        
        // Top curve
        ctx.bezierCurveTo(
          startX + cloud.width * 0.5, startY - cloud.height * 1.0,
          startX + cloud.width * 0.3, startY - cloud.height * 1.0,
          startX + cloud.width * 0.2, startY - cloud.height * 0.6
        );
        
        // Left side curve
        ctx.bezierCurveTo(
          startX, startY - cloud.height * 0.8,
          startX - cloud.width * 0.1, startY - cloud.height * 0.2,
          startX, startY
        );
        
        // Fill the cloud
        ctx.fill();
        
        // Add some subtle shading
        const gradient = ctx.createLinearGradient(
          startX, startY - cloud.height, 
          startX, startY + cloud.height / 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(230, 230, 230, 0.7)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Restore the context
        ctx.restore();
        
        // Move clouds
        cloud.x += cloud.speed;
        
        // Reset clouds when they move off canvas
        if (cloud.x > canvas.width + cloud.width) {
          cloud.x = -cloud.width;
          cloud.y = Math.random() * (canvas.height / 3) + 20;
          cloud.width = Math.random() * 120 + 80;
          cloud.height = Math.random() * 50 + 30;
        }
      });
      
      animationFrameIdRef.current = requestAnimationFrame(drawClouds);
    };
    
    drawClouds();
  };
  
  // Sun animation setup
  const setupSunAnimation = (canvas, ctx, animationFrameIdRef) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;
    const radius = 40;
    let raysLength = 0;
    let increasing = true;
    
    const drawSun = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw sun
      const gradient = ctx.createRadialGradient(centerX, centerY, radius/2, centerX, centerY, radius);
      gradient.addColorStop(0, '#ffff88');
      gradient.addColorStop(1, '#ffdd00');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw sun rays
      ctx.strokeStyle = '#ffdd00';
      ctx.lineWidth = 3;
      
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const innerRadius = radius + 5;
        const outerRadius = radius + 5 + raysLength;
        
        ctx.beginPath();
        ctx.moveTo(
          centerX + innerRadius * Math.cos(angle),
          centerY + innerRadius * Math.sin(angle)
        );
        ctx.lineTo(
          centerX + outerRadius * Math.cos(angle),
          centerY + outerRadius * Math.sin(angle)
        );
        ctx.stroke();
      }
      
      // Animate sun rays
      if (increasing) {
        raysLength += 0.2;
        if (raysLength >= 15) increasing = false;
      } else {
        raysLength -= 0.2;
        if (raysLength <= 5) increasing = true;
      }
      
      animationFrameIdRef.current = requestAnimationFrame(drawSun);
    };
    
    drawSun();
  };
  
  // Thunderstorm animation setup
  const setupThunderstormAnimation = (canvas, ctx, particles, animationFrameIdRef) => {
    // Setup rain particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 15 + 10,
        thickness: Math.random() * 2 + 1
      });
    }
    
    // Lightning parameters
    let lightningTimer = 0;
    let lightningDuration = 0;
    let nextLightning = Math.random() * 100 + 50;
    
    const drawThunderstorm = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw rain (similar to rain animation)
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
      ctx.lineWidth = 1;
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(
          particle.x + particle.length * Math.sin(Math.PI / 4),
          particle.y + particle.length * Math.cos(Math.PI / 4)
        );
        ctx.stroke();
        
        particle.y += particle.speed;
        
        if (particle.y > canvas.height) {
          particle.y = -20;
          particle.x = Math.random() * canvas.width;
        }
      });
      
      // Lightning flash
      lightningTimer++;
      
      if (lightningTimer >= nextLightning) {
        lightningDuration = 5;
        lightningTimer = 0;
        nextLightning = Math.random() * 100 + 50;
        
        // Draw lightning
        drawLightning(ctx, canvas.width / 3 + Math.random() * (canvas.width / 3), 0, canvas.width / 2, canvas.height / 2);
      }
      
      if (lightningDuration > 0) {
        // Create white overlay for flash effect
        ctx.fillStyle = `rgba(255, 255, 255, ${lightningDuration * 0.05})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        lightningDuration--;
      }
      
      animationFrameIdRef.current = requestAnimationFrame(drawThunderstorm);
    };
    
    const drawLightning = (ctx, x, y, destX, destY) => {
      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      
      ctx.moveTo(x, y);
      
      // Create a jagged line for lightning
      let currentX = x;
      let currentY = y;
      
      while (currentY < destY) {
        const nextX = currentX + (Math.random() * 20 - 10);
        const nextY = currentY + Math.random() * 20 + 10;
        
        ctx.lineTo(nextX, nextY);
        
        currentX = nextX;
        currentY = nextY;
      }
      
      ctx.stroke();
    };
    
    drawThunderstorm();
  };
  
  return (
    <div className="weather-animation">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default WeatherAnimation;