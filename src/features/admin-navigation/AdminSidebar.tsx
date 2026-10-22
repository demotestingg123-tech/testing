import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarSeparator,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/features/theme/ThemeToggle';
import { menuSections, type MenuItem, type MenuSection } from './menu-data';

function MenuLink({ item, nested = false }: { item: MenuItem; nested?: boolean }) {
	const { pathname } = useLocation();
 const active = pathname === item.to;

	if (nested) {
		return (
			<SidebarMenuSubItem>
				<SidebarMenuSubButton className="admin-tree-leaf" asChild isActive={active}>
					<NavLink to={item.to} end>{item.title}</NavLink>
				</SidebarMenuSubButton>
			</SidebarMenuSubItem>
		);
	}

	return (
		<SidebarMenuItem>
			<SidebarMenuButton className="admin-tree-leaf" asChild isActive={active} tooltip={item.title}>
				<NavLink to={item.to} end>{item.title}</NavLink>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

function MenuBranch({ group }: { group: MenuSection['groups'][number] }) {
	const { pathname } = useLocation();
	const isActive = group.items.some((item) => item.to === pathname);
	const [isOpen, setIsOpen] = useState(isActive);

	useEffect(() => {
		if (isActive) setIsOpen(true);
	}, [isActive]);

	return (
		<SidebarMenuItem>
			<Collapsible className="group/subsection admin-tree-branch" open={isOpen} onOpenChange={setIsOpen}>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton className="admin-tree-branch-trigger" size="sm" aria-expanded={isOpen}>
						<span>{group.title}</span>
						<ChevronRight className="ml-auto transition-transform group-data-[state=open]/subsection:rotate-90" aria-hidden="true" />
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub className="admin-tree-children">
						{group.items.map((item) => <MenuLink item={item} key={item.to} nested />)}
					</SidebarMenuSub>
				</CollapsibleContent>
			</Collapsible>
		</SidebarMenuItem>
	);
}

function SidebarSection({ section, index }: { section: MenuSection; index: number }) {
	const { pathname } = useLocation();
	const Icon = section.icon;
	const hasActiveRoute = [...section.items, ...section.groups.flatMap((group) => group.items)]
		.some((item) => item.to === pathname);
	const [isOpen, setIsOpen] = useState(index === 0 || hasActiveRoute);

	useEffect(() => {
		if (hasActiveRoute) setIsOpen(true);
	}, [hasActiveRoute]);

	return (
		<SidebarGroup className="admin-tree-section">
			<Collapsible className="group/section" open={isOpen} onOpenChange={setIsOpen}>
				<SidebarGroupLabel asChild>
					<CollapsibleTrigger className="admin-tree-parent w-full cursor-pointer justify-start gap-2 text-sidebar-foreground hover:text-sidebar-foreground" aria-expanded={isOpen}>
						<Icon aria-hidden="true" />
						<span>{section.title}</span>
						<ChevronRight className="ml-auto transition-transform group-data-[state=open]/section:rotate-90" aria-hidden="true" />
					</CollapsibleTrigger>
				</SidebarGroupLabel>
				<CollapsibleContent>
					<SidebarGroupContent>
						<SidebarMenu className="admin-tree-menu">
							{section.items.map((item) => <MenuLink item={item} key={item.to} />)}
							{section.groups.map((group) => <MenuBranch group={group} key={group.title} />)}
						</SidebarMenu>
					</SidebarGroupContent>
				</CollapsibleContent>
			</Collapsible>
		</SidebarGroup>
	);
}

export function AdminSidebar() {
	return (
		<Sidebar className="admin-sidebar" collapsible="offcanvas" variant="inset">
			<SidebarHeader>
				<div className="px-2 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Workspace
				</div>
			</SidebarHeader>
			<SidebarContent className="admin-sidebar-scroll">
				{menuSections.map((section, index) => (
					<SidebarSection key={section.title} section={section} index={index} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<SidebarSeparator />
				<ThemeToggle />
			</SidebarFooter>
		</Sidebar>
	);
}