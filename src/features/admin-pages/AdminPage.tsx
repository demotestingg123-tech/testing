import { Link } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { defaultMenuItem, type MenuItem } from '@/features/admin-navigation/menu-data';

function SidebarVisibilityButton() {
	const { isMobile, open, openMobile, toggleSidebar } = useSidebar();
	const isVisible = isMobile ? openMobile : open;
	const label = isVisible ? 'Hide sidebar' : 'Show sidebar';
	const Icon = isVisible ? PanelLeftClose : PanelLeftOpen;

	return (
		<Button
			variant="outline"
			size="sm"
			aria-label={label}
			aria-expanded={isVisible}
			title={label}
			onClick={toggleSidebar}
		>
			<Icon aria-hidden="true" />
			<span>{label}</span>
		</Button>
	);
}

export function AdminPage({ item }: { item: MenuItem }) {
	return (
		<section className="admin-page" aria-labelledby="page-title">
			<div className="page-toolbar">
				<SidebarVisibilityButton />
				<Breadcrumb className="page-breadcrumb">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link to={defaultMenuItem.to}>Dashboard</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<span>{item.section}</span>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage className="page-breadcrumb-current">{item.title}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>
			<h1 className="sr-only" id="page-title">{item.title}</h1>
		</section>
	);
}

export function NotFoundPage() {
	return (
		<section className="admin-page" aria-labelledby="page-title">
			<div className="page-toolbar">
				<SidebarVisibilityButton />
			</div>
			<header className="page-heading">
				<p>System</p>
				<h1 id="page-title">Page not found</h1>
			</header>
		</section>
	);
}