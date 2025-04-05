"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Folder, PenSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
    type: "collection",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
    type: "collection",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
    type: "collection",
  },
  {
    value: "remix",
    label: "Remix",
    type: "drawing",
  },
  {
    value: "astro",
    label: "Astro",
    type: "drawing",
  },
];

export function ComboboxDemo() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[400px] justify-between">
          {value ? frameworks.find((framework) => framework.value === value)?.label : "Tìm kiếm nhanh..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." className="focus:outline-none focus:ring-0" />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {framework.type === "collection" && <Folder />}
                  {framework.type === "drawing" && <PenSquare />}
                  {framework.label}
                  <Check className={cn("ml-auto h-4 w-4", value === framework.value ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
