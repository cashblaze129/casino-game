import React from "react";

type props = {
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick: () => void;
    style?: any
}
const Button: React.FC<props> = ({ onClick, children, className, disabled = false, style }) => {
    return <button disabled={disabled}
        onClick={onClick}
        className={`w-full p-2 shadow-input rounded-sm font-bold mt-5 transition
        ${disabled ? 'bg-green-800 cursor-not-allowed' : 'bg-bet_button hover:bg-bet_hover_button'}
        ${className || ''} 
        ${disabled ? '' : 'active:scale-90 transform'}`}
        style={style || {}}
    >
        {children}
    </button>
}

export default Button;