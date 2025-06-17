
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundText?: string;
  disabled?: boolean;
  className?: string; // For the trigger button
  popoverClassName?: string;
  dir?: "ltr" | "rtl";
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "اختر...",
  searchPlaceholder = "بحث...",
  notFoundText = "لم يتم العثور على نتائج.",
  disabled,
  className,
  popoverClassName,
  dir = "rtl",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal", // Ensure w-full and normal font weight
            selectedOption ? "text-foreground" : "text-muted-foreground",
            className
          )}
          disabled={disabled}
          dir={dir}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn("w-[--radix-popover-trigger-width] p-0", popoverClassName)} 
        dir={dir}
        style={{ zIndex: 9999 }} // Ensure popover is on top
      >
        <div className="p-2">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full"
            aria-label={searchPlaceholder}
          />
        </div>
        <ScrollArea className="max-h-60">
          {filteredOptions.length === 0 && searchValue !== "" ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {notFoundText}
            </div>
          ) : (
            <div className="p-2 pt-0">
              {filteredOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start my-1 h-auto py-2 px-2 font-normal", // normal font weight for items
                    value === option.value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Check
                    className={cn(
                      "me-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
