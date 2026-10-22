import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { PagePreloader } from '@/app/PagePreloader';
import { AdminSidebar } from '@/features/admin-navigation/AdminSidebar';
import { AppHeader } from './AppHeader';

export function AdminLayout() {
	return (
		<SidebarProvider defaultOpen>
			<AdminSidebar />
			<SidebarInset>
				<AppHeader />
				<div className="admin-content">
					<Suspense fallback={<PagePreloader />}>
						<Outlet />
					</Suspense>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}