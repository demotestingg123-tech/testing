import { Button } from '@/components/ui/button';

type SystemProLoaderProps = {
	message?: string;
	onRetry?: () => void;
};

export function SystemProLoader({ message = 'Preparing your workspace', onRetry }: SystemProLoaderProps) {
	return (
		<main className="system-loader" role="status" aria-live="polite">
			<div className="system-loader__content">
				<div className="system-loader__brand">
					<img src="/icons/icon-192.png" alt="" />
					<span>System Pro</span>
				</div>
				<p>{message}</p>
				<div className="system-loader__track" aria-hidden="true"><span /></div>
				{onRetry && <Button variant="outline" onClick={onRetry}>Retry connection</Button>}
			</div>
		</main>
	);
}