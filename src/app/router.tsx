import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { allMenuItems, defaultMenuItem } from '@/features/admin-navigation/menu-data';

const AdminPage = lazy(() =>
	import('@/features/admin-pages/AdminPage').then((module) => ({ default: module.AdminPage })),
);
const NotFoundPage = lazy(() =>
	import('@/features/admin-pages/AdminPage').then((module) => ({ default: module.NotFoundPage })),
);

export const router = createBrowserRouter([
	{
		path: '/',
		element: <AdminLayout />,
		children: [
			{ index: true, element: <Navigate to={defaultMenuItem.to} replace /> },
			...allMenuItems.map((item) => ({
				path: item.to.slice(1),
				element: <AdminPage item={item} />,
			})),
			{ path: '*', element: <NotFoundPage /> },
		],
	},
]);