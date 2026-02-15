import { ReactNode } from "react"

export interface CardProps {
    children: ReactNode,
    className?: string
}

export function Card({ children, className = "" }: CardProps) {
    return (
        <div className={" p-2 sm:p-4 md:p-8 rounded-md bg-white " + className}>{ children }</div>
    )
}