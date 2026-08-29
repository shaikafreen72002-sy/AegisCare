import React from 'react';

interface DeMentorLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const DeMentorLogo: React.FC<DeMentorLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  className = ''
}) => {
  const iconSizeClasses = {
    sm: 'w-8 h-8 rounded-[10px]',
    md: 'w-10 h-10 rounded-[13px]',
    lg: 'w-12 h-12 rounded-[16px]',
    xl: 'w-16 h-16 rounded-[20px]'
  };

  const svgSizes = {
    sm: 18,
    md: 22,
    lg: 26,
    xl: 36
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Innovative Brain-Synapse + Guiding Star Vector Icon */}
      <div
        className={`relative ${iconSizeClasses[size]} bg-gradient-to-tr from-[#FF6138] via-[#FF7D54] to-[#7952EC] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(255,97,56,0.35)] shrink-0 group transition-transform hover:scale-105 duration-300`}
      >
        <div className="absolute inset-0 rounded-[inherit] ring-1 ring-white/30 pointer-events-none" />

        <svg
          width={svgSizes[size]}
          height={svgSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xs text-white"
        >
          <path
            d="M9.5 4C6.5 4 4 6.5 4 9.5C4 11.2 4.8 12.7 6 13.7C5.4 14.6 5 15.7 5 17C5 19.2 6.8 21 9 21C10.1 21 11.1 20.6 11.8 19.9M14.5 4C17.5 4 20 6.5 20 9.5C20 11.2 19.2 12.7 18 13.7C18.6 14.6 19 15.7 19 17C19 19.2 17.2 21 15 21C13.9 21 12.9 20.6 12.2 19.9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.95"
          />
          <path
            d="M12 7V13M9 10H15"
            stroke="#FFE600"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="1.5" fill="#FFE600" />
        </svg>

        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FFE600] border-2 border-white animate-pulse" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black ${titleSizes[size]} tracking-tight font-['Outfit'] leading-none flex items-center`}
            >
              <span className="text-[#2D2545] tracking-tight">De</span>
              <span className="bg-gradient-to-r from-[#FF6138] via-[#FF784B] to-[#E84E27] bg-clip-text text-transparent tracking-tight">
                Mentor
              </span>
            </span>

            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF0EB] text-[#FF6138] font-black uppercase tracking-wider border border-[#FF6138]/20 hidden sm:inline-block shadow-2xs">
              AI Memory Coach
            </span>
          </div>

          {subtitle && (
            <p className="text-xs text-[#6B6282] font-medium mt-0.5 truncate max-w-[280px]">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
