'use client';
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface RightBarProps {
    children: React.ReactNode;
    expandIcon?: React.ReactNode;
    closeIcon?: React.ReactNode;
    className?: string;
}

const RightBar: React.FC<RightBarProps> = ({ children,expandIcon,closeIcon=<ChevronRight className="h-4 w-4" />,className }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded)
    }


    return (
        <div className={cn(`transition-all duration-300 ease-in-out h-[calc(100vh-4rem)] border-l sticky top-0 bg-background overflow-auto flex flex-col items-start justify-start`, className)}
            style={{
                width: isExpanded ? "20rem" : "4rem",
                scrollbarWidth: "none",
            }}>
            <div className="p-4 pb-0">
                <Button variant="secondary" size="icon" onClick={toggleSidebar}>
                    {isExpanded ? closeIcon : expandIcon}
                </Button>
            </div>
            {isExpanded && <CardContent className='p-4 w-full'>
                {children}
            </CardContent>}
        </div>
    );
};

export default RightBar;