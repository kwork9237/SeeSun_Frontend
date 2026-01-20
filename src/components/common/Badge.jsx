import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
        primary: "bg-indigo-50 text-indigo-700 border-indigo-100",
        success: "bg-green-50 text-green-700 border-green-100",
        danger:  "bg-red-50 text-red-700 border-red-100",
        warning: "bg-yellow-50 text-yellow-700 border-yellow-100",
        gray:    "bg-gray-100 text-gray-600 border-gray-200",
    };

    return (
        <span className={`
            inline-flex items-center justify-center px-2.5 py-0.5 
            rounded-full text-[10px] font-black border uppercase tracking-wider
            whitespace-nowrap shrink-0
            ${variants[variant]} 
            ${className}
        `}>
            {children}
        </span>
    );
};

export default Badge;