import { X } from "lucide-react";
import { Button } from "./ui/button";

interface OTTModalHeaderProps {
  providerName: string;
  version: string;
  onClose: () => void;
}

export function OTTModalHeader({
  providerName,
  version,
  onClose,
}: OTTModalHeaderProps) {
  return (
    <div
      className="relative w-full h-18 overflow-hidden flex-shrink-0 group backdrop-blur-md bg-gradient-to-r from-red-600/90 via-foreground/80 to-transparent 
                   before:absolute before:inset-0 before:bg-gradient-to-br before:from-red-500/60 before:via-transparent before:to-foreground/40 
                   after:absolute after:inset-0 after:bg-gradient-to-tr after:from-foreground/70 after:via-transparent after:to-red-400/30
                   animate-in fade-in duration-700"
    >
      <div className="relative flex items-center justify-between h-full px-4 animate-in fade-in slide-in-from-right-3 duration-600 ">
        <div className="flex flex-col space-y-0.5">
          <p className="text-white text-base font-medium m-0 bg-gradient-to-r from-white via-white/95 to-white/80 bg-clip-text transparent animate-in fade-in slide-in-from-left-2 duration-500 ">
            {providerName}
          </p>
          <span className="text-white/50 text-sm font-normal animate-in fade-in slide-in-from-left-1 duration-500 ">
            {version}
          </span>
        </div>

        <Button
          size="icon"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20
                     flex items-center justify-center transition-allhover:scale-105 hover:rotate-90
                     animate-in fade-in zoom-in-50 duration-400  hover:shadow-lg hover:shadow-red-500/20 z-1"
        >
          <X className="w-4 h-4 text-white/60 hover:text-white/80 transition-colors duration-200" />
        </Button>
      </div>
    </div>
  );
}
