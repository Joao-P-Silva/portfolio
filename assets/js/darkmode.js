let themeTransitionTimer = null;

const selectionPalette = [
	'#8B5CF6',
	'#22C55E',
	'#06B6D4',
	'#EAB308'
];

function getRandomSelectionColor() {
	const idx = Math.floor(Math.random() * selectionPalette.length);
	return selectionPalette[idx];
}

function getContrastTextColor(hexColor) {
	const sanitized = hexColor.replace('#', '');
	const r = parseInt(sanitized.substring(0, 2), 16);
	const g = parseInt(sanitized.substring(2, 4), 16);
	const b = parseInt(sanitized.substring(4, 6), 16);
	const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
	return luminance > 160 ? '#050505' : '#FFFFFF';
}

function applyRandomSelectionColor() {
	const randomBg = getRandomSelectionColor();
	const randomText = getContrastTextColor(randomBg);
	const root = document.documentElement;

	root.style.setProperty('--selection-random-bg', randomBg);
	root.style.setProperty('--selection-random-text', randomText);
}

function applyTheme(theme) {
	const safeTheme = theme === 'light' ? 'light' : 'dark';
	document.body.setAttribute('data-theme', safeTheme);

	const icon = document.getElementById('theme-toggle-icon');
	const label = document.getElementById('theme-toggle-text');
	if (icon && label) {
		if (safeTheme === 'light') {
			icon.className = 'bi bi-sun-fill';
			label.textContent = 'DIA';
		} else {
			icon.className = 'bi bi-moon-stars-fill';
			label.textContent = 'NOITE';
		}
	}
}

function animateThemeSwitch(nextTheme) {
	const body = document.body;
	const directionClass = nextTheme === 'light' ? 'theme-to-light' : 'theme-to-dark';

	body.classList.remove('theme-transition', 'theme-to-light', 'theme-to-dark');
	void body.offsetWidth;
	body.classList.add('theme-transition', directionClass);

	if (themeTransitionTimer) {
		clearTimeout(themeTransitionTimer);
	}

	themeTransitionTimer = window.setTimeout(() => {
		body.classList.remove('theme-transition', 'theme-to-light', 'theme-to-dark');
	}, 520);
}

function applyPerformanceMode(mode) {
	const safeMode = mode === 'performance' ? 'performance' : 'normal';
	document.body.setAttribute('data-performance', safeMode);

	const icon = document.getElementById('performance-toggle-icon');
	const label = document.getElementById('performance-toggle-text');
	if (icon && label) {
		if (safeMode === 'performance') {
			icon.className = 'bi bi-speedometer2';
			label.textContent = 'PERFORMANCE';
		} else {
			icon.className = 'bi bi-grid-3x3-gap-fill';
			label.textContent = 'NORMAL';
		}
	}

	if (typeof setDotsEnabled === 'function') {
		setDotsEnabled(safeMode === 'normal');
	}
}

function initPerformanceToggle() {
	const toggleBtn = document.getElementById('performance-toggle');
	const savedMode = localStorage.getItem('vice-performance') || 'normal';
	applyPerformanceMode(savedMode);

	if (!toggleBtn) return;

	toggleBtn.addEventListener('click', () => {
		const isPerformance = document.body.getAttribute('data-performance') === 'performance';
		const nextMode = isPerformance ? 'normal' : 'performance';
		applyPerformanceMode(nextMode);
		localStorage.setItem('vice-performance', nextMode);
	});
}

function initThemeToggle() {
	const toggleBtn = document.getElementById('theme-toggle');
	if (!toggleBtn) return;

	const savedTheme = localStorage.getItem('vice-theme') || 'dark';
	applyTheme(savedTheme);

	toggleBtn.addEventListener('click', () => {
		const isLight = document.body.getAttribute('data-theme') === 'light';
		const nextTheme = isLight ? 'dark' : 'light';
		animateThemeSwitch(nextTheme);
		applyTheme(nextTheme);
		localStorage.setItem('vice-theme', nextTheme);
	});
}
