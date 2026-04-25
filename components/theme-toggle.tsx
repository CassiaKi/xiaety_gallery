"use client";

import { useEffect, useState } from "react";

type ThemeMode = "day" | "night";

const STORAGE_KEY = "xiaety-theme";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("day");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme: ThemeMode = storedTheme === "night" ? "night" : "day";

    applyTheme(nextTheme);
    setTheme(nextTheme);
    setReady(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "day" ? "night" : "day";
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  const nextThemeLabel = theme === "day" ? "夜间" : "日间";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={ready ? `切换到${nextThemeLabel}主题` : "切换主题"}
      title={ready ? `切换到${nextThemeLabel}主题` : "切换主题"}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {theme === "day" ? "☀" : "☾"}
      </span>
      <span className="theme-toggle__label">{theme === "day" ? "白天" : "黑夜"}</span>
    </button>
  );
}
