import React, { ReactNode } from 'react';

// Define the props for the Container component
interface ContainerProps {
    children: ReactNode;
    className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
    return (
        <div className={`${className} flex-1`}>
            {children}
        </div>
    );
};

export default Container;