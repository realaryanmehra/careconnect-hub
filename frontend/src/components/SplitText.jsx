import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SplitText = ({ 
  text, 
  className = "", 
  delay = 0, 
  stagger = 0.02, 
  duration = 0.8,
  triggerOnView = true 
}) => {
  const container = useRef();

  useGSAP(() => {
    const chars = container.current.querySelectorAll('.char');
    
    const animation = {
      y: 100,
      opacity: 0,
      rotateX: -90,
      stagger: stagger,
      duration: duration,
      ease: "power4.out",
      delay: delay,
    };

    if (triggerOnView) {
      gsap.from(chars, {
        ...animation,
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%",
          toggleActions: "play none none none",
        }
      });
    } else {
      gsap.from(chars, animation);
    }
  }, { scope: container });

  // Handle nested spans or basic text
  const renderText = (txt) => {
    if (typeof txt !== 'string') return txt;
    
    return txt.split("").map((char, i) => (
      <span key={i} className="char inline-block origin-bottom">
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  return (
    <span ref={container} className={`${className} inline-block overflow-hidden py-1`}>
      {renderText(text)}
    </span>
  );
};

export default SplitText;
