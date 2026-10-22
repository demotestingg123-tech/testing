import {createRoot} from 'react-dom/client';
import App from './app/App.tsx';
import './styles/theme.css';
import './styles/app.css';
import { ThemeProvider } from './features/theme/ThemeProvider.tsx';
import { TooltipProvider } from './components/ui/tooltip.tsx';

createRoot(document.getElementById('root')!).render(
	<ThemeProvider>
		<TooltipProvider>
			<App />
		</TooltipProvider>
	</ThemeProvider>,
);
