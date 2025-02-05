import { cn } from "@/lib/utils";
import {  Boxes } from "lucide-react";

export default function Logo({
    className
}:{
    className?: string
}) {
    return <div className={cn("flex items-center gap-2 font-bold text-muted-foreground",className)}>
        <Boxes size={24} /> <span className="text-20 font-normal">Dataxpert</span>
    </div>
}