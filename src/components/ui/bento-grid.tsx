import React from 'react';
import { cn } from '../../lib/utils';

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export const BentoGrid = ({ className, children }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto w-full",
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const BentoCard = ({
  className,
  title,
  description,
  header,
  icon,
  onClick,
}: BentoCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group/bento row-span-1 border border-white/10 flex flex-col justify-between space-y-4 bg-black/40 backdrop-blur-sm p-4 cursor-pointer hover:border-purple-500/40 transition-all active:scale-[0.98]",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div className="flex items-center gap-2 mb-2">
           {icon}
           <div className="font-serif italic font-light text-white/90 tracking-widest text-xs uppercase">
             {title}
           </div>
        </div>
        <div className="font-mono text-[10px] text-white/40 uppercase tracking-tighter leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};
