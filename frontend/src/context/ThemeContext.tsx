import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "dark";
  });

  useEffect(() => {

    localStorage.setItem("theme", theme);

    const root = document.documentElement;

    root.classList.remove("light");
    root.classList.remove("dark");

    if (theme === "system") {

      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      root.classList.add(
        prefersDark ? "dark" : "light"
      );

    } else {

      root.classList.add(theme);

    }

  }, [theme]);

  return (

    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>

  );

}

export function useTheme() {
  return useContext(ThemeContext);
}