import React, { useRef, useState } from 'react';
import chipBoard from '../assets/img/chipboard.svg';

// Function to format chip values  
export const formatChipValue = (value: number): string => {
    if (value >= 1e9) {
        return `${(value / 1e9).toFixed(0)}b`;
    } else if (value >= 1e6) {
        return `${(value / 1e6).toFixed(0)}m`;
    } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(0)}k`;
    }
    return value.toString();
};

// Function to map chip values to colors  
const getChipColor = (value: number): string => {
    if (value < 100) return '#5176a7';
    if (value < 1000) return '#2679e7';
    if (value < 10000) return '#8a5bed';
    if (value < 100000) return '#51e4ed';
    if (value < 1000000) return '#ed5151 ';
    if (value < 10000000) return '#CD7F32';
    return '#e7c651';
};

const ChipButtonGroup: React.FC<{ chipValues: number[]; onChooseChip: (value: number) => void; selected: number, label?: any }> = ({ chipValues, onChooseChip, selected, label }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -50 : 50; // Adjust scroll amount as needed  
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const onMouseDown = (e: React.MouseEvent) => {
        if (scrollRef.current) {
            setIsDragging(true);
            setStartX(e.pageX - scrollRef.current.offsetLeft);
            setScrollLeft(scrollRef.current.scrollLeft);
        }
    };

    const onMouseLeave = () => {
        setIsDragging(false);
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div className='flex-col'>
            <div>
                {label}
            </div>
            <div className="flex items-center justify-between bg-input_bg rounded-md overflow-hidden input">
                <button className="text-white w-10 fill-[#FFF]  h-full" onClick={() => scroll('left')}>
                    <svg fill="currentColor" viewBox="0 0 64 64" style={{ width: '100%', height: '100%' }}>
                        <path d="M36.998 53.995 16 32.998 36.998 12l6.306 6.306L28.61 33l14.694 14.694L36.998 54v-.005Z"></path>
                    </svg>
                </button>
                <div
                    ref={scrollRef}
                    className="flex space-x-2 overflow-x-auto scrollbar-hide scroll-smooth p-1 border-[2px] border-inputborader hover:border-input_hover  bg-panel "
                    style={{ scrollbarWidth: 'none' }}
                    onMouseDown={onMouseDown}
                    onMouseLeave={onMouseLeave}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                >
                    {chipValues.map((value, index) => (
                        <ChipButton value={value} selected={index == selected} key={index} onClick={() => onChooseChip(index)} />
                    ))}
                </div>
                <button className="text-white w-10 fill-[#FFF] bg-input_bg h-full" onClick={() => scroll('right')}>
                    <svg fill="currentColor" viewBox="0 0 64 64">
                        <path d="m26.307 53.995 20.998-20.997L26.307 12 20 18.306 34.694 33 20.001 47.694 26.307 54v-.005Z"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChipButtonGroup;

interface ChipButtonProps {
    onClick?: () => void;
    value: number;
    selected?: boolean;
    style?: any
}

// Updated ChipButton component to use the color prop  
export const ChipButton: React.FC<ChipButtonProps> = ({ onClick, value, selected, style = {} }) => {
    const color = getChipColor(value);
    return (
        <button
            onClick={() => onClick && onClick()}
            className={`flex items-center justify-center text-[#fff] rounded-full uppercase text-sm font-bold select-none input  shadow-slate-950  outline text-[#2c2c2ccc] ${selected ? "outline-[2px] outline-[#00be00]" : "outline-[2px] outline-[#0000004f]"}`}
            style={{
                backgroundImage: `url(${chipBoard})`,
                aspectRatio: '1',
                width: '40px',
                minWidth: '40px',
                fontSize: "12px",
                backgroundColor: color,
                ...style
            }}
        >
            {formatChipValue(value)}
        </button>
    );
};