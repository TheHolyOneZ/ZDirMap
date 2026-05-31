import { useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useStore } from "../../store";

const ORDER: Array<"system" | "dark" | "light"> = ["system", "dark", "light"];

export default function ThemeToggle() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  const next = () => {
    const i = ORDER.indexOf(theme);
    setTheme(ORDER[(i + 1) % ORDER.length]);
  };

  return (
    <button
      onClick={next}
      title={`Theme: ${theme}`}
      aria-label="Toggle theme"
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 cursor-default"
      style={{ color: "var(--color-text-subtle)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--color-panel-hover)";
        e.currentTarget.style.color = "var(--color-text-muted)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--color-text-subtle)";
      }}
    >
      <Icon size={11} />
    </button>
  );
}
