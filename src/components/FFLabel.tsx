import React from 'react';
import { motion } from 'motion/react';

interface FFLabelProps {
  main: string;
  sub?: string;
  className?: string;
  color?: string;
  delay?: number;
}

export const FFLabel: React.FC<FFLabelProps> = ({ 
  main, 
  sub, 
  className = '', 
  color = 'white',
  delay = 0 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`ff-label ${className}`}
    >
      <div 
        className="ff-label-main"
        style={{ color: color === 'white' ? 'white' : color }}
      >
        {main}
      </div>
      {sub && (
        <div className="ff-label-sub">
          {sub}
        </div>
      )}
    </motion.div>
  );
};
