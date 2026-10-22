import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<Button
			className="w-full justify-start"
			variant="ghost"
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
		>
			{isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
			<span>Switch to {isDark ? 'light' : 'dark'} theme</span>
		</Button>
	);
}