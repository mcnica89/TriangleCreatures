import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({ variant = "default", className, ...props }) => {
  const baseStyles = "px-4 py-2 rounded-md transition-all";
  const variantStyles = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-gray-500 text-gray-300 hover:bg-gray-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props} />
  );
};
