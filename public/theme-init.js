(() => {
	let theme = 'light';
	try {
		theme = (localStorage.getItem('system-pro-theme') ?? localStorage.getItem('theme')) === 'dark' ? 'dark' : 'light';
	} catch {
		theme = 'light';
	}
	document.documentElement.classList.toggle('dark', theme === 'dark');
	document.documentElement.style.colorScheme = theme;
})();