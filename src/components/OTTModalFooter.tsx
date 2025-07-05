import React from "react";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { cn } from "../lib/utils";

interface OTTModalFooterProps {
  onTurnOff: () => void;
}

export function OTTModalFooter({ onTurnOff }: OTTModalFooterProps) {
  const sampleLogs = [
    {
      timestamp: "14:30:22",
      level: "INFO",
      message: "Extension initialized successfully",
    },
    {
      timestamp: "14:30:25",
      level: "DEBUG",
      message: "Detected Netflix player",
    },
    {
      timestamp: "14:30:28",
      level: "INFO",
      message: "Applied playback speed: 1.25x",
    },
    {
      timestamp: "14:30:31",
      level: "DEBUG",
      message: "Skipped intro: 15 seconds",
    },
    {
      timestamp: "14:30:35",
      level: "INFO",
      message: "Auto-next episode enabled",
    },
    {
      timestamp: "14:30:38",
      level: "DEBUG",
      message: "Volume normalized to 80%",
    },
    {
      timestamp: "14:30:42",
      level: "INFO",
      message: "Quality changed to 1080p",
    },
    {
      timestamp: "14:30:45",
      level: "DEBUG",
      message: "Subtitle track changed: English",
    },
    {
      timestamp: "14:30:48",
      level: "INFO",
      message: "Blocked advertisements: 3",
    },
    {
      timestamp: "14:30:51",
      level: "DEBUG",
      message: "Enhanced audio quality applied",
    },
    {
      timestamp: "14:30:54",
      level: "INFO",
      message: "Custom UI themes loaded",
    },
    {
      timestamp: "14:30:57",
      level: "DEBUG",
      message: "Performance optimizations active",
    },
  ];

  return (
    <>
      <div className="w-full bg-[rgba(28,28,28,0.95)] backdrop-blur-[20px] flex-shrink-0">
        <div className="border-t border-white/15 px-4 py-3 flex gap-1">
          <Button
            variant="ghost"
            size="default"
            onClick={onTurnOff}
            className="flex-1 px-3 py-2 min-h-9 bg-white/10 hover:bg-white/20 
                       rounded-3xl text-white text-sm font-medium transition-all duration-200
                       border-0 hover:text-white"
          >
            Turn Off
          </Button>
          {/* <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="default"
              className="flex-1 px-3 py-2 min-h-9 bg-white/10 hover:bg-white/20 
            rounded-3xl text-white text-sm font-medium transition-all duration-200
            border-0 hover:text-white"
            >
              Logs
            </Button>
          </DrawerTrigger> */}
        </div>
      </div>

      {/* <Drawer direction="bottom">
        <DrawerContent
          data-slot="drawer-content"
          className={cn(
            "group/drawer-content bg-background absolute inset-0 z-50 flex h-auto flex-col",
            "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
            "bg-[rgba(28,28,28,0.98)] backdrop-blur-[20px] border-t border-white/15 text-white rounded-3xl"
          )}
        >
          <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
          <DrawerHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-white font-medium text-sm">
                Extension Logs
              </DrawerTitle>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-2 min-h-0">
            <div className="space-y-1">
              {sampleLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex gap-2 p-2 rounded-md bg-white/5 border border-white/10 flex-col"
                >
                  <div className="flex items-center gap-2 flex-row">
                    <span className="text-[10px] text-white/50 font-mono flex-shrink-0 w-12">
                      {log.timestamp}
                    </span>
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        log.level === "INFO"
                          ? "bg-blue-500/20 text-blue-300"
                          : log.level === "DEBUG"
                          ? "bg-gray-500/20 text-gray-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {log.level}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/80 flex-1 min-w-0 truncate">
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer> */}
    </>
  );
}
