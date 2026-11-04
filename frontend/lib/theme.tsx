"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light" | "medium";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  cycleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("enginewatch_theme") as ThemeMode | null;
      if (saved && (saved === "dark" || saved === "light" || saved === "medium")) {
        setThemeState(saved);
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        setThemeState("light");
      }
    } catch {
      // localStorage may fail in restricted iframes
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light", "theme-medium", "dark");
    root.classList.add(`theme-${theme}`);
    if (theme === "dark" || theme === "medium") {
      root.classList.add("dark");
    }
    try {
      localStorage.setItem("enginewatch_theme", theme);
    } catch {
      // ignore
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const cycleTheme = () => {
    if (theme === "dark") setThemeState("light");
    else if (theme === "light") setThemeState("medium");
    else setThemeState("dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
