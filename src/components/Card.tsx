import React from "react";

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return <div className={`rounded-lg shadow-md ${className}`}>{children}</div>;
};

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="p-4 border-b border-gray-700">{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <h2 className="text-lg font-semibold">{children}</h2>;
};

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="p-4">{children}</div>;
};
