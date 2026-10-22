import { Skeleton } from '@/components/ui/skeleton';

export function PagePreloader() {
	return (
		<div className="page-preloader" role="status" aria-label="Loading page">
			<span className="sr-only">Loading page</span>
			<Skeleton className="h-4 w-32" />
			<Skeleton className="h-8 w-56" />
			<Skeleton className="mt-4 h-24 w-full max-w-xl" />
		</div>
	);
}