import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

type ThemeContextValue = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = 'system-pro-theme';

function applyTheme(theme: Theme) {
	document.documentElement.classList.toggle('dark', theme === 'dark');
	document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setCurrentTheme] = useState<Theme>(() =>
		document.documentElement.classList.contains('dark') ? 'dark' : 'light',
	);

	const setTheme = (nextTheme: Theme) => {
		applyTheme(nextTheme);
		setCurrentTheme(nextTheme);
		try {
			localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
		} catch {
			return;
		}
	};

	useEffect(() => {
		const handleStorage = (event: StorageEvent) => {
			if (event.key !== THEME_STORAGE_KEY) return;
			const nextTheme = event.newValue === 'dark' ? 'dark' : 'light';
			applyTheme(nextTheme);
			setCurrentTheme(nextTheme);
		};
		window.addEventListener('storage', handleStorage);
		return () => window.removeEventListener('storage', handleStorage);
	}, []);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) throw new Error('useTheme must be used within ThemeProvider.');
	return context;
}