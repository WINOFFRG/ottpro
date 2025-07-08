import { createContext, type ReactNode, useContext, useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

interface DrawerContextType {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

function useDrawer() {
	const context = useContext(DrawerContext);
	if (!context) {
		throw new Error("useDrawer must be used within a Drawer");
	}
	return context;
}

interface DrawerProps {
	children: ReactNode;
}

function Drawer({ children }: DrawerProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<DrawerContext.Provider value={{ isOpen, setIsOpen }}>
			{children}
		</DrawerContext.Provider>
	);
}

interface DrawerTriggerProps {
	children: ReactNode;
}

function DrawerTrigger({ children }: DrawerTriggerProps) {
	const { setIsOpen } = useDrawer();

	const handleClick = () => {
		setIsOpen(true);
	};

	return (
		<button className="contents" onClick={handleClick} type="button">
			{children}
		</button>
	);
}

interface DrawerContentProps {
	children: ReactNode;
	className?: string;
}

function DrawerContent({ children, className }: DrawerContentProps) {
	const { isOpen, setIsOpen } = useDrawer();

	if (!isOpen) {
		return null;
	}

	const handleBackdropClick = () => {
		setIsOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setIsOpen(false);
		}
	};

	return (
		<>
			<Button
				aria-label="Close drawer"
				className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
				onClick={handleBackdropClick}
				onKeyDown={handleKeyDown}
				type="button"
			/>

			<div
				aria-modal="true"
				className={cn(
					"fixed z-50 flex flex-col bg-background",
					"inset-x-0 bottom-0 rounded-t-lg border-t",
					"slide-in-from-bottom animate-in duration-300",
					className
				)}
				data-slot="drawer-content"
				role="dialog"
			>
				{children}
			</div>
		</>
	);
}

interface DrawerHeaderProps {
	children: ReactNode;
	className?: string;
}

function DrawerHeader({ children, className }: DrawerHeaderProps) {
	return (
		<div
			className={cn("flex flex-col space-y-1.5 p-6", className)}
			data-slot="drawer-header"
		>
			{children}
		</div>
	);
}

interface DrawerTitleProps {
	children: ReactNode;
	className?: string;
}

function DrawerTitle({ children, className }: DrawerTitleProps) {
	return (
		<h3
			className={cn(
				"font-semibold text-lg leading-none tracking-tight",
				className
			)}
			data-slot="drawer-title"
		>
			{children}
		</h3>
	);
}

interface DrawerCloseProps {
	children: ReactNode;
}

function DrawerClose({ children }: DrawerCloseProps) {
	const { setIsOpen } = useDrawer();

	const handleClick = () => {
		setIsOpen(false);
	};

	return (
		<button className="contents" onClick={handleClick} type="button">
			{children}
		</button>
	);
}

export {
	Drawer,
	DrawerTrigger,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerClose,
};
