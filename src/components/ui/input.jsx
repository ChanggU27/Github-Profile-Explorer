import * as React from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

function Input({
  className,
  containerClassName,
  type,
  value,
  onChange,
  ...props
}) {
  const showClear = Boolean(value);

  function handleClear() {
    onChange?.({ target: { value: "" } });
  }

  return (
    <div className={cn("relative", containerClassName)}>
      <input
        type={type}
        data-slot="input"
        value={value}
        onChange={onChange}
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-black-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          showClear && "pr-8",
          className,
        )}
        {...props}
      />
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear input"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <XMarkIcon className="size-5" />
        </button>
      )}
    </div>
  );
}

export { Input };
