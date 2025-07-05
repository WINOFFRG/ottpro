import { useEffect, useState } from "react";
import { OTTModalHeader } from "./OTTModalHeader";
import { OTTModalFooter } from "./OTTModalFooter";
import { RuleSection } from "./RuleSection";
import { RuleItem } from "./RuleItem";
import { SocialSection } from "./SocialSection";

interface OTTModalProps {
  root: HTMLElement;
}

export function OTTModal({ root }: OTTModalProps) {
  const [provider, setProvider] = useState<"netflix" | "hotstar" | "unknown">(
    "unknown"
  );
  const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);

  // Detect current provider
  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes("netflix")) {
      setProvider("netflix");
    } else if (hostname.includes("hotstar")) {
      setProvider("hotstar");
    } else {
      setProvider("netflix");
    }
  }, []);

  const getProviderInfo = () => {
    switch (provider) {
      case "netflix":
        return {
          name: "Netflix",
          version: "v1.0.0",
        };
      case "hotstar":
        return {
          name: "Hotstar",
          version: "v1.0.0",
        };
      default:
        return {
          name: "OTT Enhancer",
          version: "v1.0.0",
        };
    }
  };

  const providerInfo = getProviderInfo();

  // Proper close handler that unmounts the UI
  const handleClose = () => {
    console.log("handleClose", root);
    root.remove();
  };

  const handleTurnOff = () => {
    // Logic to turn off the extension
    console.log("Turning off extension...");
    handleClose();
  };

  return (
    <div
      className={`fixed right-3 top-3 w-[278px] ${
        isLogsDrawerOpen ? "max-h-[90vh]" : "max-h-[calc(100vh-300px)]"
      } pointer-events-auto
                 z-[9999999] bg-neutral-800 backdrop-blur-[40px] rounded-3xl 
                 border border-white/10 shadow-[0px_0px_28px_0px_rgba(0,0,0,0.5)]
                 animate-in slide-in-from-right-2 fade-in
                 flex flex-col isolate transform-gpu overflow-hidden transition-all duration-300`}
      style={{
        transition:
          "box-shadow 0.2s, opacity 0.2s, transform 0.2s, max-height 0.3s",
        msScrollChaining: "none",
        overscrollBehavior: "contain",
      }}
    >
      <OTTModalHeader
        providerName={providerInfo.name}
        version={providerInfo.version}
        onClose={handleClose}
      />

      <div
        className="flex-1 overflow-y-auto px-0 min-h-0"
        style={{
          msScrollChaining: "none",
          overscrollBehavior: "contain",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {provider !== "unknown" && (
          <RuleSection title="Rules">
            <RuleItem
              title="Enable 4K"
              description="Force maximum quality streaming up to 4K resolution"
            />
            <RuleItem
              title="Skip Intro"
              description="Automatically skip intro sequences"
            />
            <RuleItem
              title="Auto Next Episode"
              description="Automatically play next episode without countdown"
            />
          </RuleSection>
        )}

        <SocialSection />
      </div>

      <OTTModalFooter onTurnOff={handleTurnOff} />
    </div>
  );
}
