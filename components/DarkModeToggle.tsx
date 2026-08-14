'use client';

import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('listicles-dark-mode', String(next));
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="w-11 h-11 flex items-center justify-center rounded-full bg-card shadow text-xl"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
