import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type AuthUser = {
	id: string;
	username: string;
	role: 'admin' | 'operator';
};

type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';

type AuthContextValue = {
	user: AuthUser | null;
	status: AuthStatus;
	login: (username: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readResponse(response: Response) {
	const payload = await response.json().catch(() => ({})) as { user?: AuthUser | null; error?: string };
	if (!response.ok) throw new Error(payload.error ?? 'The request could not be completed.');
	return payload;
}

type AuthProviderProps = {
	children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [status, setStatus] = useState<AuthStatus>('loading');

	useEffect(() => {
		let active = true;
		void fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' })
			.then(readResponse)
			.then(({ user: sessionUser }) => {
				if (!active) return;
				setUser(sessionUser ?? null);
				setStatus(sessionUser ? 'authenticated' : 'anonymous');
			})
			.catch(() => {
				if (active) setStatus('error');
			});
		return () => {
			active = false;
		};
	}, []);

	const login = async (username: string, password: string) => {
		const response = await fetch('/api/auth/login', {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
		});
		const payload = await readResponse(response);
		setUser(payload.user ?? null);
		setStatus('authenticated');
	};

	const logout = async () => {
		const response = await fetch('/api/auth/logout', {
			method: 'POST',
			credentials: 'same-origin',
		});
		await readResponse(response);
		setUser(null);
		setStatus('anonymous');
	};

	return <AuthContext.Provider value={{ user, status, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used within AuthProvider.');
	return context;
}