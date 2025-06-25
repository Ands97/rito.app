import { Loader2 } from "lucide-react";

export const Loading = () => (
    <div className="w-screen h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-2" />
    </div>
);
