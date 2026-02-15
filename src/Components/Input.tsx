import { InputHTMLAttributes } from 'react';

export type InputParams = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...rest }: InputParams) {
    return (
        <input
            className={`w-full p-4 border rounded-lg outline-none ring-1 ring-gray-300 focus:ring-primary ${className}`}
            {...rest}
        />
    );
}