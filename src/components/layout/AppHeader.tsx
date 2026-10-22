import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthProvider';

export function AppHeader() {
	const { user, logout } = useAuth();
	const [loggingOut, setLoggingOut] = useState(false);

	const handleLogout = async () => {
		setLoggingOut(true);
		try {
			await logout();
		} finally {
			setLoggingOut(false);
		}
	};

	return (
		<header className="app-header">
			<span className="app-header__brand">System Pro</span>
			<div className="app-header__account">
				{user && <span className="app-header__username">{user.username}</span>}
				<Button size="sm" variant="ghost" onClick={handleLogout} disabled={loggingOut}>
					<LogOut aria-hidden="true" />
					{loggingOut ? 'Signing out…' : 'Sign out'}
				</Button>
			</div>
		</header>
	);
}