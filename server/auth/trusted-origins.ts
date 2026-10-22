type OriginEnvironment = {
	APP_URL?: string;
	CODESPACE_NAME?: string;
	GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN?: string;
	SYSTEM_PRO_WEB_PORT?: string;
};

export function resolveTrustedAppOrigins(environment: OriginEnvironment = process.env) {
	const origins = new Set<string>();
	const addOrigin = (candidate: string | undefined) => {
		if (!candidate) return;
		try {
			const url = new URL(candidate);
			if (url.protocol === 'http:' || url.protocol === 'https:') origins.add(url.origin);
		} catch {
			return;
		}
	};

	addOrigin(environment.APP_URL);

	const codespaceName = environment.CODESPACE_NAME;
	const forwardingDomain = environment.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
	const webPort = environment.SYSTEM_PRO_WEB_PORT ?? '3000';
	if (codespaceName && forwardingDomain && /^\d{2,5}$/.test(webPort)) {
		addOrigin(`https://${codespaceName}-${webPort}.${forwardingDomain}`);
	}

	return origins;
}