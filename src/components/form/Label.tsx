import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        "mb-2 block text-sm font-medium text-gray-800 transition-colors dark:text-gray-200",
        className
      )}
    >
      {children}
    </label>
  );
};

export default Label;
