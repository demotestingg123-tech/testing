import {
	Boxes,
	Building2,
	Bus,
	ContactRound,
	HardHat,
	LayoutDashboard,
	Package,
	Receipt,
	Settings,
	Store,
	Truck,
	Wallet,
	type LucideIcon,
} from 'lucide-react';

export type MenuItem = {
	title: string;
	to: string;
	section: string;
};

export type MenuGroup = {
	title: string;
	items: MenuItem[];
};

export type MenuSection = {
	title: string;
	icon: LucideIcon;
	items: MenuItem[];
	groups: MenuGroup[];
};

function slugify(value: string) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function createItems(section: string, titles: string[], group?: string): MenuItem[] {
	const sectionPath = slugify(section);
	const groupPath = group ? `${slugify(group)}/` : '';

	return titles.map((title) => ({
		title,
		to: `/${sectionPath}/${groupPath}${slugify(title)}`,
		section,
	}));
}

function createSection(
	title: string,
	icon: LucideIcon,
	items: string[],
	groups: { title: string; items: string[] }[] = [],
): MenuSection {
	return {
		title,
		icon,
		items: createItems(title, items),
		groups: groups.map((group) => ({
			title: group.title,
			items: createItems(title, group.items, group.title),
		})),
	};
}

const directoryGroups = [
	{ title: 'Financial', items: ['Dues Reminders', 'Customers Rank', 'Products Rank'] },
	{ title: 'Statistics', items: ['Sales by Products', 'Sales by Clients', 'Clients Ledger'] },
	{ title: 'Customers', items: ['Billing Customers', 'Shipping Customers'] },
];

export const menuSections: MenuSection[] = [
	createSection('Admin Dashboard', LayoutDashboard, ['All Dashboard', 'Chawk Dashboard', 'Dist Dashboard']),
	createSection(
		'Dist Directory',
		Store,
		[
			'Dist Dashboard',
			'Sales Invoices',
			'Create Invoice',
			'Manage Invoices',
			'Sales Returns',
			'Archived Invoices',
			'Payments',
			'Current Invoices',
			'Collections',
			'Collections List',
			'Sales Orders',
			'Create Order',
			'Order List',
			'Due Products',
			'Shipped Orders',
			'Challan List',
			'Sales Commission',
			'Commission Entry',
			'Commission Tracking',
			'Commission Report',
		],
		directoryGroups,
	),
	createSection(
		'Chawk Directory',
		Building2,
		[
			'Chawk Dashboard',
			'Sales Invoices',
			'Create Invoice',
			'Manage Invoices',
			'Sales Returns',
			'Archived Invoices',
			'Payments',
			'Current Invoices',
			'Collections',
			'Collections List',
			'Sales Orders',
			'Create Order',
			'Order List',
			'Due Products',
			'Shipped Orders',
			'Sales Commission',
			'Commission Entry',
			'Commission Tracking',
			'Commission Report',
		],
		directoryGroups,
	),
	createSection('Expenses', Receipt, ['Create Expense', 'Manage Expense', 'Expense History']),
	createSection('Asset Directory', Package, ['Products', 'Products List']),
	createSection('Inventory', Boxes, [
		'Create Stock',
		'Manage Stock',
		'Current Stock',
		'Stock In',
		'Stock Out',
		'Stock Trend',
		'Stock Ledger',
		'Warehouses',
	]),
	createSection('Employees', ContactRound, ['Create Employee', 'Manage Employee']),
	createSection('Payroll', Wallet, ['Create Payroll', 'Manage Payroll', 'Payroll Reporting']),
	createSection('Workers', HardHat, ['Add Worker', 'Manage Workers', 'Items List', 'Worker Pay Slips']),
	createSection('Suppliers', Truck, [
		'Add Supplier',
		'Suppliers List',
		'Suppliers Invoices',
		'Suppliers Invoice List',
		'Suppliers Payments',
		'Suppliers Dues',
		'Suppliers Rank',
		'Suppliers Ledger',
	]),
	createSection('Booking', Bus, ['Transport', 'Transport List']),
	createSection('System', Settings, ['Company Config', 'Control Panel', 'Role Users', 'Permissions', 'Audit', 'Help', 'Settings']),
];

export const allMenuItems = menuSections.flatMap((section) => [
	...section.items,
	...section.groups.flatMap((group) => group.items),
]);

export const defaultMenuItem = menuSections[0].items[0];