import { useState, type FormEvent } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from './AuthProvider';

export function LoginPage() {
	const { login } = useAuth();
	const [username, setUsername] = useState('admin');
	const [password, setPassword] = useState(import.meta.env.DEV ? '1' : '');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError('');
		setSubmitting(true);
		try {
			await login(username, password);
		} catch (loginError) {
			setError(loginError instanceof Error ? loginError.message : 'Sign-in failed. Try again.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="login-screen">
			<div className="login-layout">
				<div className="login-brand">
					<img src="/icons/icon-192.png" alt="" />
					<span>System Pro</span>
				</div>
				<Card className="login-card">
					<CardHeader className="login-card__header">
						<div className="login-card__icon" aria-hidden="true"><ShieldCheck /></div>
						<CardTitle>Sign in</CardTitle>
						<CardDescription>Access your workspace with your account credentials.</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="login-form" onSubmit={handleSubmit}>
							<label htmlFor="login-username">Username</label>
							<Input
								id="login-username"
								autoComplete="username"
								maxLength={64}
								value={username}
								required
								disabled={submitting}
								onChange={(event) => setUsername(event.target.value)}
								placeholder="Enter your username"
							/>
							<label htmlFor="login-password">Password</label>
							<Input
								id="login-password"
								type="password"
								autoComplete="current-password"
								maxLength={128}
								value={password}
								required
								 disabled={submitting}
								onChange={(event) => setPassword(event.target.value)}
								placeholder="Enter your password"
							/>
							{import.meta.env.DEV && <p className="login-development-note">Local development demo credentials</p>}
							{error && <p className="login-error" role="alert">{error}</p>}
							<Button className="login-submit" type="submit" disabled={submitting}>
								<KeyRound aria-hidden="true" />
								{submitting ? 'Signing in…' : 'Sign in'}
							</Button>
						</form>
					</CardContent>
				</Card>
				<p className="login-footer">Protected access · System Pro</p>
			</div>
		</main>
	);
}