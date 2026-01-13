import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    progress: number;
    message?: string;
    className?: string;
}

export function ProgressBar({ progress, message, className }: ProgressBarProps) {
    return (
        <div className={cn("w-full space-y-2", className)}>
            <div className="flex justify-between text-sm text-gray-600">
                <span>{message || "Processing..."}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 w-full transition-all" />
        </div>
    );
}
