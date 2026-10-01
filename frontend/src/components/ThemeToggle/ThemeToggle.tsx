import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    return stored === "dark" ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <button
      type="button"
      className="theme-choice"
      onClick={() =>
        setTheme((current) => (current === "light" ? "dark" : "light"))
      }
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <span className="theme-choice-icon">
        {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
      </span>
      <span>
        <strong>Appearance</strong>
        <small>{theme === "light" ? "Light mode" : "Dark mode"}</small>
      </span>
      <span className="theme-choice-action">Switch</span>
    </button>
  );
}
