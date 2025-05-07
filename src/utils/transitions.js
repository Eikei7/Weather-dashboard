/**
 * Add CSS transition classes for elements entering the DOM
 * @param {Element} element - DOM element to animate
 * @param {string} className - CSS class name with animation
 * @param {number} duration - Duration of animation in milliseconds
 * @returns {Promise} - Promise that resolves when animation completes
 */
export const animateElement = (element, className, duration = 300) => {
    return new Promise(resolve => {
      if (!element) {
        resolve();
        return;
      }
      
      // Add animation class
      element.classList.add(className);
      
      // Remove class and resolve promise when animation ends
      const onAnimationEnd = () => {
        element.removeEventListener('animationend', onAnimationEnd);
        resolve();
      };
      
      element.addEventListener('animationend', onAnimationEnd);
      
      // Backup: if animation doesn't trigger, resolve after duration
      setTimeout(() => {
        resolve();
      }, duration + 50);
    });
  };
  
  /**
   * Apply transition when changing between two values
   * @param {number} startValue - Starting value
   * @param {number} endValue - Ending value
   * @param {Function} callback - Callback function to update UI
   * @param {number} duration - Duration of transition in milliseconds
   * @param {string} easing - CSS easing function name
   */
  export const animateValue = (
    startValue, 
    endValue, 
    callback, 
    duration = 1000, 
    easing = 'easeOutQuad'
  ) => {
    let start = null;
    const change = endValue - startValue;
    
    // Easing functions
    const easings = {
      linear: t => t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    };
    
    const easingFunction = easings[easing] || easings.easeOutQuad;
    
    const animate = timestamp => {
      if (!start) start = timestamp;
      
      const progress = Math.min(1, (timestamp - start) / duration);
      const easedProgress = easingFunction(progress);
      
      const currentValue = startValue + change * easedProgress;
      callback(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };
  
  /**
   * Create a staggered entrance animation for multiple elements
   * @param {NodeList|Array} elements - Collection of DOM elements to animate
   * @param {string} className - CSS class name with animation
   * @param {number} staggerDelay - Delay between each element's animation in milliseconds
   * @param {number} duration - Duration of each animation in milliseconds
   * @returns {Promise} - Promise that resolves when all animations complete
   */
  export const staggerElements = (elements, className, staggerDelay = 100, duration = 300) => {
    return new Promise(resolve => {
      if (!elements || elements.length === 0) {
        resolve();
        return;
      }
      
      const elementsArray = Array.from(elements);
      let completed = 0;
      
      elementsArray.forEach((element, index) => {
        setTimeout(() => {
          animateElement(element, className, duration).then(() => {
            completed++;
            if (completed === elementsArray.length) {
              resolve();
            }
          });
        }, index * staggerDelay);
      });
    });
  };
  
  /**
   * Create a typewriter effect for text
   * @param {Element} element - DOM element to add text to
   * @param {string} text - Text to type
   * @param {number} speed - Typing speed in milliseconds per character
   * @returns {Promise} - Promise that resolves when typing completes
   */
  export const typeText = (element, text, speed = 50) => {
    return new Promise(resolve => {
      if (!element) {
        resolve();
        return;
      }
      
      let index = 0;
      element.textContent = '';
      
      const type = () => {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          index++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      };
      
      type();
    });
  };