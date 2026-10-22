import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type InstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function PwaController() {
	const {
		offlineReady: [offlineReady, setOfflineReady],
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW();
	const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		const handleInstallPrompt = (event: Event) => {
			event.preventDefault();
			setInstallPrompt(event as InstallPromptEvent);
			setDismissed(false);
		};
		const handleInstalled = () => {
			setInstallPrompt(null);
			setDismissed(true);
		};

		window.addEventListener('beforeinstallprompt', handleInstallPrompt);
		window.addEventListener('appinstalled', handleInstalled);
		return () => {
			window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
			window.removeEventListener('appinstalled', handleInstalled);
		};
	}, []);

	const handleInstall = async () => {
		if (!installPrompt) return;

		await installPrompt.prompt();
		await installPrompt.userChoice;
		setInstallPrompt(null);
	};

	const message = needRefresh
		? 'A new version is ready.'
		: offlineReady
			? 'System Pro is ready to use offline.'
			: installPrompt
				? 'Install System Pro for quick access.'
				: null;

	if (!message || dismissed) return null;

	return (
		<aside className="pwa-notice" aria-live="polite" aria-label="App status">
			<div className="pwa-notice__message">
				<strong>{needRefresh ? 'Update available' : offlineReady ? 'Offline ready' : 'Install app'}</strong>
				<span>{message}</span>
			</div>
			{needRefresh ? (
				<Button size="sm" onClick={() => updateServiceWorker(true)}>
					<RefreshCw aria-hidden="true" />
					Update
				</Button>
			) : offlineReady ? null : (
				<Button size="sm" onClick={handleInstall}>
					<Download aria-hidden="true" />
					Install
				</Button>
			)}
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label="Dismiss app status"
				title="Dismiss"
				onClick={() => {
					setDismissed(true);
					setOfflineReady(false);
					setNeedRefresh(false);
				}}
			>
				<X aria-hidden="true" />
			</Button>
		</aside>
	);
}