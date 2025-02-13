import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TreeProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

interface TreeItemProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  label: string;
}

export const Tree = forwardRef<HTMLDivElement, TreeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-1", className)} {...props}>
        {children}
      </div>
    );
  }
);
Tree.displayName = "Tree";

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  ({ className, icon, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent cursor-pointer",
          className
        )}
        {...props}
      >
        {icon}
        <span>{label}</span>
      </div>
    );
  }
);
TreeItem.displayName = "TreeItem";
