import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  size?: number;
  online?: boolean;
  border?: boolean;
}

const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({
    src,
    alt,
    size = 40,
    online = false,
    border = false,
    className,
    ...props
  }, ref) => {
    return (
      <div
        className={cn(
          "relative flex h-[var(--avatar-size, 2rem)] w-[var(--avatar-size, 2rem)] shrink-0 overflow-hidden rounded-full",
          border && "ring-2 ring-background",
          { "--avatar-size": `${size}px` },
          className
        )}
      >
        <Image
          ref={ref}
          src={src}
          alt={alt || ""}
          fill
          sizes="100%"
          priority
          className="object-cover"
        />
        {online && (
          <div className="absolute bottom-0 right-0 h-2 w-2 bg-success-500/80 border-2 border-white rounded-full"></div>
        )}
      </div>
    );
  }
);
Avatar.displayName = Avatar.name;

export { Avatar };