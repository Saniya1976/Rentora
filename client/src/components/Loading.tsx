import React from "react";

const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-20 space-y-4">
            <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1acec8]/20 border-t-[#1acec8] rounded-full animate-spin"></div>
                <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-[#15b8b3] rounded-full animate-spin [animation-duration:1.5s]"></div>
            </div>
            <p className="text-[#1acec8] font-bold text-sm uppercase tracking-widest animate-pulse">
                Fetching data...
            </p>
        </div>
    );
};

export default Loading;
