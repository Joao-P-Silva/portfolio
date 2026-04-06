const phrases = ["CREATE TABLE", "</HTML5>", "@PHP_8", "CSS: Flex;",  "git push", "JS =>"];
let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;
let destroyInteractiveDots = null;
let labTypingActive = false;
let labWriterId = null;
let labNextSnippetTimeoutId = null;
let labManualMode = false;

const terminalSnippets = [
`<style>
body {
	background: #050505;
	color: #55BCE8;
	font-family: 'Fira Code', monospace;
	display: grid;
	place-items: center;
	min-height: 100vh;
	margin: 0;
}
.pulse {
	border: 2px solid #ED53AA;
	padding: 24px;
	box-shadow: 0 0 20px rgba(237, 83, 170, 0.7);
	animation: pulse 1.6s infinite ease-in-out;
}
@keyframes pulse {
	0%, 100% { transform: scale(1); opacity: 0.7; }
	50% { transform: scale(1.03); opacity: 1; }
}
</style>
<div class="pulse">
	<h1>NODE_ONLINE</h1>
	<p>STREAM LINK ESTABLISHED...</p>
</div>`,
`<style>
body {
	background: radial-gradient(circle at top, #111 0%, #050505 70%);
	color: #a1e2ff;
	font-family: 'Orbitron', sans-serif;
	margin: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
}
.card {
	border: 2px solid #55BCE8;
	padding: 28px;
	text-align: center;
	box-shadow: 0 0 24px rgba(85, 188, 232, 0.4);
}
.status { color: #ED53AA; letter-spacing: 2px; }
</style>
<div class="card">
	<h2>SYSTEM REPORT</h2>
	<p class="status">[ RUNNING CYBER SCAN ]</p>
</div>`,
`<style>
body {
	margin: 0;
	min-height: 100vh;
	display: grid;
	place-items: center;
	background: #000;
	color: #fff;
	font-family: 'Plus Jakarta Sans', sans-serif;
}
.grid {
	border: 1px solid #55BCE8;
	padding: 20px;
	display: grid;
	gap: 10px;
}
.row {
	color: #55BCE8;
	text-shadow: 0 0 8px #55BCE8;
}
.row b { color: #ED53AA; }
</style>
<div class="grid">
	<div class="row"><b>&gt;</b> boot_sequence: ok</div>
	<div class="row"><b>&gt;</b> assets_loaded: ok</div>
	<div class="row"><b>&gt;</b> render_pipeline: active</div>
</div>`
];

const staticLaravelPreview = 
`<!DOCTYPE html>
<html lang="pt-PT">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>LARAVEL PROJECT</title>
	<style>
		body {
			margin: 0;
			min-height: 100vh;
			display: grid;
			place-items: center;
			background: linear-gradient(160deg, #050505 0%, #0f0f0f 100%);
			color: #f5f5f5;
			font-family: 'Orbitron', sans-serif;
		}
		.shell {
			width: min(780px, 92vw);
			border: 2px solid #55BCE8;
			box-shadow: 0 0 24px rgba(85, 188, 232, 0.25);
			background: rgba(0, 0, 0, 0.6);
			padding: 24px;
		}
		h1 {
			margin: 0 0 8px;
			color: #55BCE8;
			font-size: 1.4rem;
			letter-spacing: 1px;
		}
		p {
			margin: 0 0 18px;
			color: #d4d4d4;
			font-family: 'Fira Code', monospace;
		}
		ul {
			margin: 0;
			padding-left: 18px;
			color: #ED53AA;
			font-family: 'Fira Code', monospace;
			line-height: 1.7;
		}
	</style>
</head>
<body>
	<div class="shell">
		<h1>LARAVEL_PROJECT_v1</h1>
		<p>Preview estatico. Nao depende do LIVE_LAB_TERMINAL.</p>
		<ul>
			<li>Routing e Controllers organizados</li>
			<li>CRUD com Blade templates</li>
			<li>Integracao com MySQL e validacao de formularios</li>
		</ul>
	</div>
</body>
</html>`;

function initProgressBars() {
	const bars = document.querySelectorAll('.progress-bar-rosa[data-progress]');
	if (!bars.length) return;

	const isMobile = window.matchMedia && window.matchMedia('(max-width: 1099.98px)').matches;
	if (isMobile) {
		bars.forEach((bar) => {
			bar.style.width = '100%';
			bar.setAttribute('aria-valuenow', '100');
			bar.classList.remove('is-scrolling');
		});
		return;
	}

	let targetProgress = 0;
	let currentProgress = 0;
	let isScrolling = false;
	let scrollTimeout;

	const updateScrollTarget = () => {
		const scrollTop = window.scrollY || window.pageYOffset || 0;
		const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
		const ratio = Math.max(0, Math.min(1, scrollTop / scrollable));
		targetProgress = ratio * 100;
		
		isScrolling = true;
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(() => {
			isScrolling = false;
		}, 150);
	};

	const animate = () => {
		// Linear interpolation (lerp) for smooth movement
		// current = current + (target - current) * factor
		const diff = targetProgress - currentProgress;
		
		if (Math.abs(diff) > 0.05) {
			currentProgress += diff * 0.1; // 0.1 factor allows for smooth "catch up"
		} else {
			currentProgress = targetProgress;
		}

		bars.forEach((bar) => {
			bar.style.width = `${currentProgress.toFixed(2)}%`;
			bar.setAttribute('aria-valuenow', String(Math.round(currentProgress)));
			
			if (isScrolling || Math.abs(diff) > 0.5) {
				bar.classList.add('is-scrolling');
			} else {
				bar.classList.remove('is-scrolling');
			}
		});

		requestAnimationFrame(animate);
	};

	window.addEventListener('scroll', updateScrollTarget, { passive: true });
	window.addEventListener('resize', updateScrollTarget);
	
	// Start loop
	updateScrollTarget();
	animate();
}

function initInteractiveDots() {
	const bg = document.getElementById('bg-dots') || document.querySelector('.bg-dots');
	if (!bg) return null;

	const startsInLightTheme = document.body.getAttribute('data-theme') === 'light';
	const initialBaseOpacity = startsInLightTheme ? 0.28 : 0.48;

	bg.innerHTML = '';

	const dots = [];
	const spacing = 32;
	const rows = Math.ceil(window.innerHeight / spacing);
	const cols = Math.ceil(window.innerWidth / spacing);

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			const dot = document.createElement('div');
			dot.className = 'dot';

			const x = j * spacing + spacing / 2;
			const y = i * spacing + spacing / 2;

			dot.style.left = `${x}px`;
			dot.style.top = `${y}px`;

			bg.appendChild(dot);
			dots.push({
				el: dot,
				x: x,
				y: y,
				currentX: 0,
				currentY: 0,
				targetX: 0,
				targetY: 0,
				currentScale: 1,
				targetScale: 1,
				currentOpacity: initialBaseOpacity,
				targetOpacity: initialBaseOpacity
			});
		}
	}

	let mouseX = window.innerWidth / 2;
	let mouseY = window.innerHeight / 2;
	const radius = 140;
	const shockwaves = [];
	let animationFrameId = null;
	let isRunning = true;

	function triggerExplosion(x, y) {
		shockwaves.push({
			x: x,
			y: y,
			start: performance.now(),
			duration: 720,
			speed: 1.05,
			band: 90
		});
	}

	const handleMouseMove = (e) => {
		mouseX = e.clientX;
		mouseY = e.clientY;
	};

	const handleClick = (e) => {
		const target = e.target;
		if (target && target.closest('button, a, input, textarea, iframe, .project-module, .vice-btn')) {
			return;
		}
		triggerExplosion(e.clientX, e.clientY);
	};

	document.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('click', handleClick);

	function animateDots() {
		if (!isRunning) return;
		const now = performance.now();
		const isLightTheme = document.body.getAttribute('data-theme') === 'light';
		const baseOpacity = isLightTheme ? 0.28 : 0.48;
		const hoverOpacity = isLightTheme ? 0.62 : 0.9;
		const waveOpacityBase = isLightTheme ? 0.55 : 0.75;
		const waveOpacityBoost = isLightTheme ? 0.15 : 0.2;
		const baseDotColor = isLightTheme ? 'rgba(40, 116, 166, 0.32)' : 'rgba(85, 188, 232, 0.45)';
		const activeDotColor = isLightTheme ? 'rgba(200, 70, 146, 0.58)' : 'var(--rosa)';

		for (let i = shockwaves.length - 1; i >= 0; i--) {
			if (now - shockwaves[i].start > shockwaves[i].duration) {
				shockwaves.splice(i, 1);
			}
		}

		dots.forEach((dot) => {
			const dx = mouseX - dot.x;
			const dy = mouseY - dot.y;
			const distance = Math.hypot(dx, dy);
			let explosionX = 0;
			let explosionY = 0;
			let explosionPower = 0;

			if (distance < radius) {
				const angle = Math.atan2(dy, dx);
				const force = (radius - distance) / radius;
				dot.targetX = Math.cos(angle) * force * -24;
				dot.targetY = Math.sin(angle) * force * -24;
				dot.targetScale = 0.72;
				dot.targetOpacity = hoverOpacity;
				dot.el.style.backgroundColor = activeDotColor;
			} else {
				dot.targetX = 0;
				dot.targetY = 0;
				dot.targetScale = 1;
				dot.targetOpacity = baseOpacity;
				dot.el.style.backgroundColor = baseDotColor;
			}

			shockwaves.forEach((wave) => {
				const elapsed = now - wave.start;
				const waveRadius = elapsed * wave.speed;
				const ddx = dot.x - wave.x;
				const ddy = dot.y - wave.y;
				const dotDistance = Math.hypot(ddx, ddy);
				const ringDelta = Math.abs(dotDistance - waveRadius);

				if (ringDelta < wave.band) {
					const waveForce = (1 - ringDelta / wave.band) * 32;
					const waveAngle = Math.atan2(ddy, ddx);
					explosionX += Math.cos(waveAngle) * waveForce;
					explosionY += Math.sin(waveAngle) * waveForce;
					explosionPower = Math.max(explosionPower, waveForce / 32);
				}
			});

			dot.targetX += explosionX;
			dot.targetY += explosionY;

			if (explosionPower > 0) {
				dot.targetScale = Math.max(dot.targetScale, 1 + explosionPower * 0.5);
				dot.targetOpacity = Math.max(dot.targetOpacity, waveOpacityBase + explosionPower * waveOpacityBoost);
				dot.el.style.backgroundColor = activeDotColor;
			}

			dot.currentX += (dot.targetX - dot.currentX) * 0.16;
			dot.currentY += (dot.targetY - dot.currentY) * 0.16;
			dot.currentScale += (dot.targetScale - dot.currentScale) * 0.14;
			dot.currentOpacity += (dot.targetOpacity - dot.currentOpacity) * 0.12;

			dot.el.style.transform = `translate3d(${dot.currentX}px, ${dot.currentY}px, 0) scale(${dot.currentScale})`;
			dot.el.style.opacity = `${dot.currentOpacity}`;
		});

		animationFrameId = requestAnimationFrame(animateDots);
	}

	animateDots();

	return function destroyDots() {
		isRunning = false;
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('click', handleClick);
		bg.innerHTML = '';
	};
}

function setDotsEnabled(enabled) {
	if (enabled) {
		if (!destroyInteractiveDots) {
			destroyInteractiveDots = initInteractiveDots();
		}
		return;
	}

	if (destroyInteractiveDots) {
		destroyInteractiveDots();
		destroyInteractiveDots = null;
	}
}

function initRealLoader() {
	const loader = document.getElementById('site-loader') || document.querySelector('.siteloader');
	const mainContent = document.getElementById('main-content');
	const percentBg = document.getElementById('percent-bg');
	const statusText = document.getElementById('status-text');
	const logDisplay = document.getElementById('log-display');

	if (!loader || !mainContent || !percentBg || !statusText || !logDisplay) return;

	let prog = 0;
	let isWindowLoaded = false;
	const logs = ['Arquivos Carregados', 'Assets Multimedia', 'Protocolo v2.6', 'Node Stable'];

	window.onload = () => {
		isWindowLoaded = true;
	};

	function addLog(msg) {
		const entry = document.createElement('div');
		entry.className = 'log-entry';
		entry.innerHTML = `<span>[ OK ]</span> ${msg.toUpperCase()}`;
		if (logDisplay.children.length >= 2) logDisplay.removeChild(logDisplay.lastChild);
		logDisplay.prepend(entry);
	}

	function update() {
		const inc = isWindowLoaded ? 2 : 0.4;
		if (prog < 90 || isWindowLoaded) prog += Math.random() * inc;
		if (prog > 100) prog = 100;

		const currentInt = Math.floor(prog);
		percentBg.innerText = currentInt.toString().padStart(2, '0');

		if (currentInt % 25 === 0 && currentInt > 0 && logs.length > 0) {
			addLog(logs.shift());
		}

		if (prog < 100) {
			requestAnimationFrame(update);
		} else {
			statusText.innerText = 'ACESSO CONCEDIDO';
			statusText.style.color = 'var(--rosa)';
			setTimeout(() => {
				loader.classList.add('fade-out');
				mainContent.style.display = 'block';
				if (typeof window.showOnboardingModalIfFirstVisit === 'function') {
					window.showOnboardingModalIfFirstVisit();
				}
				typeEffect();
			}, 600);
		}
	}

	update();
}

function typeEffect() {
	const textElement = document.getElementById('typewriter');
	if (!textElement) return;

	const currentPhrase = phrases[phraseIdx];
	if (isDeleting) {
		textElement.textContent = currentPhrase.substring(0, charIdx - 1);
		charIdx--;
	} else {
		textElement.textContent = currentPhrase.substring(0, charIdx + 1);
		charIdx++;
	}

	let speed = isDeleting ? 60 : 150;
	if (!isDeleting && charIdx === currentPhrase.length) {
		isDeleting = true;
		speed = 2500;
	} else if (isDeleting && charIdx === 0) {
		isDeleting = false;
		phraseIdx = (phraseIdx + 1) % phrases.length;
		speed = 500;
	}

	setTimeout(typeEffect, speed);
}

function updateLabPreview() {
	const htmlElement = document.getElementById('html-code');
	const frameElement = document.getElementById('live-preview');
	if (!htmlElement || !frameElement || !frameElement.contentWindow) return;

	const htmlCode = htmlElement.value;
	const previewFrame = frameElement.contentWindow.document;
	previewFrame.open();
	previewFrame.write(htmlCode);
	previewFrame.close();
}

function startAutoCodeTyping() {
	const editor = document.getElementById('html-code');
	if (!editor) return;
	editor.setAttribute('readonly', 'readonly');
	labTypingActive = true;
	if (labWriterId) {
		clearInterval(labWriterId);
		labWriterId = null;
	}
	if (labNextSnippetTimeoutId) {
		clearTimeout(labNextSnippetTimeoutId);
		labNextSnippetTimeoutId = null;
	}

	function typeNextSnippet() {
		if (!labTypingActive) return;
		const chosenSnippet = terminalSnippets[Math.floor(Math.random() * terminalSnippets.length)];
		editor.value = '';
		updateLabPreview();

		let idx = 0;
		labWriterId = setInterval(() => {
			if (!labTypingActive) {
				clearInterval(labWriterId);
				labWriterId = null;
				return;
			}
			editor.value += chosenSnippet.charAt(idx);
			updateLabPreview();
			idx++;

			if (idx >= chosenSnippet.length) {
				clearInterval(labWriterId);
				labWriterId = null;
				labNextSnippetTimeoutId = setTimeout(typeNextSnippet, 1400);
			}
		}, 18);
	}

	typeNextSnippet();
}

function enableLabTryYourself() {
	const editor = document.getElementById('html-code');
	const title = document.getElementById('live-lab-title');
	const btn = document.getElementById('lab-try-yourself');
	if (!editor || !title || !btn) return;

	if (!labManualMode) {
		// Entrar em modo TRY_YOURSELF
		labTypingActive = false;
		if (labWriterId) {
			clearInterval(labWriterId);
			labWriterId = null;
		}
		if (labNextSnippetTimeoutId) {
			clearTimeout(labNextSnippetTimeoutId);
			labNextSnippetTimeoutId = null;
		}

		editor.removeAttribute('readonly');
		editor.focus();
		editor.removeEventListener('input', updateLabPreview);
		editor.addEventListener('input', updateLabPreview);

		labManualMode = true;
		title.innerHTML = '<span class="text-azul">></span> TRYING_MYSELF';
		btn.textContent = 'RETURN_TO_LIVE';
	} else {
		// Voltar ao modo LIVE_LAB_TERMINAL
		editor.removeEventListener('input', updateLabPreview);
		editor.setAttribute('readonly', 'readonly');
		labManualMode = false;
		title.innerHTML = '<span class="text-azul">></span> LIVE_LAB_TERMINAL';
		btn.textContent = 'TRY_YOURSELF';
		startAutoCodeTyping();
	}
}
