import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: number;
  readOnly?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  value, 
  onChange, 
  max = 5, 
  size = 24,
  readOnly = false 
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const active = (hover || value) >= starValue;
        
        return (
          <motion.button
            key={i}
            type="button"
            whileHover={!readOnly ? { scale: 1.2 } : {}}
            whileTap={!readOnly ? { scale: 0.9 } : {}}
            onClick={() => !readOnly && onChange(starValue)}
            onMouseEnter={() => !readOnly && setHover(starValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={`transition-colors duration-200 ${
              active ? 'text-amber-400' : 'text-slate-200'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star 
              size={size} 
              fill={active ? "currentColor" : "none"} 
              strokeWidth={2}
            />
          </motion.button>
        );
      })}
    </div>
  );
};
