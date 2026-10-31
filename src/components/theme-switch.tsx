"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function ThemeSwitch() {
  const mounted = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-lg border bg-background px-2 py-1.5">
      <Sun
        aria-hidden="true"
        className="size-3.5 text-foreground dark:text-muted-foreground"
      />
      <Switch
        aria-label="Tema oscuro"
        checked={mounted && resolvedTheme === "dark"}
        disabled={!mounted}
        onCheckedChange={(dark) => setTheme(dark ? "dark" : "light")}
      />
      <Moon
        aria-hidden="true"
        className="size-3.5 text-muted-foreground dark:text-foreground"
      />
    </div>
  );
}
