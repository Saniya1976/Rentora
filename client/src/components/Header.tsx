import React from "react";

interface HeaderProps {
    title: string;
    subtitle: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
    return (
        <div className="mb-8">
            <h1 className="text-4xl font-black bg-linear-to-r from-[#1acec8] to-[#15b8b3] bg-clip-text text-transparent uppercase tracking-tight">
                {title}
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-sm italic mt-1">
                {subtitle}
            </p>
        </div>
    );
};

export default Header;
