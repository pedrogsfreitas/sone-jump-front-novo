import { type ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'small' | 'large';
    onClick?: () => void;
}

export function Button({ children, variant = 'large', onClick }: ButtonProps) {
    const baseClasses = "bg-white text-black font-medium transition-all hover:bg-zinc-200 active:scale-95"
    const sizeClasses = variant === 'small'
      ? "px-6 py-2 rounded-md text-sm"
      : "px-10 py-4 rounded-lg text-lg uppercase tracking-wider";

    return (
        <button 
            className={`${baseClasses} ${sizeClasses}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}