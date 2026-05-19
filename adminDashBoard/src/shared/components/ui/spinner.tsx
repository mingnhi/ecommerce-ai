import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex justify-center items-center p-4">
      <Loader2 className={`size-6 animate-spin text-sky-500 ${className || ""}`} />
    </div>
  );
}
