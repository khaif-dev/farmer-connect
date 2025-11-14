import React from 'react';

export const ScrollArea = ({ children, className }) => {
  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      <div className="h-full w-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
};