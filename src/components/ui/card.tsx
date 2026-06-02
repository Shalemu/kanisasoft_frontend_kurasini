import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-6 flex flex-col h-full">{children}</div>;
};
