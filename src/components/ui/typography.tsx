import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-4xl font-thin tracking-widest text-gray-800 text-center py-8",
    },
  },
});

export type TypographyVariants = VariantProps<typeof typographyVariants> & {
  children: React.ReactNode;
  className?: string;
};
export function Typography({
  children,
  className,
  variant,
}: TypographyVariants) {
  if (variant === "h1") {
    return (
      <h1
        className={cn(
          "text-4xl font-thin tracking-widest text-gray-800 text-center py-8",
          className,
        )}
      >
        {children}
      </h1>
    );
  }
}
