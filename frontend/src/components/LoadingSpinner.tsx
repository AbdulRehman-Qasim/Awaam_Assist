import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    fullScreen?: boolean;
}

const LoadingSpinner = ({ size = "md", text, fullScreen = false }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-[#7c3aed]`} />
            {text && <p className="text-sm text-gray-600">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
