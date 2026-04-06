let myModal;
let currentPreviewUrl = null;

function applyModalPreviewCursor() {
	const previewFrame = document.getElementById('previewFrame');
	if (!previewFrame || !previewFrame.contentWindow) return;

	try {
		const frameDoc = previewFrame.contentWindow.document;
		let forceCursorStyle = frameDoc.getElementById('force-cell-cursor-style');
		if (!forceCursorStyle) {
			forceCursorStyle = frameDoc.createElement('style');
			forceCursorStyle.id = 'force-cell-cursor-style';
			forceCursorStyle.textContent = '* { cursor: cell !important; }';
			(frameDoc.head || frameDoc.documentElement).appendChild(forceCursorStyle);
		}
		if (frameDoc.documentElement) {
			frameDoc.documentElement.style.cursor = 'cell';
		}
		if (frameDoc.body) {
			frameDoc.body.style.cursor = 'cell';
		}
	} catch (error) {
		// Ignore access errors for non-same-origin documents.
	}
}

function getOrCreateFieldFeedback(input) {
	if (!input || !input.parentElement) return null;

	let feedback = input.parentElement.querySelector('.field-feedback');
	if (!feedback) {
		feedback = document.createElement('small');
		feedback.className = 'field-feedback';
		feedback.setAttribute('aria-live', 'polite');
		input.parentElement.appendChild(feedback);
	}

	return feedback;
}

function setFieldState(input, isValid, message) {
	if (!input) return;

	const feedback = getOrCreateFieldFeedback(input);
	input.classList.toggle('is-invalid', !isValid);
	input.classList.toggle('is-valid', isValid);

	if (feedback) {
		feedback.textContent = message || '';
		feedback.classList.toggle('is-invalid', !isValid && !!message);
		feedback.classList.toggle('is-valid', isValid && !!message);
	}
}

function validateUserId(value) {
	const cleaned = (value || '').trim();
	if (!cleaned) {
		return { valid: false, message: 'USER_ID e obrigatorio.' };
	}

	if (cleaned.length < 3) {
		return { valid: false, message: 'USER_ID precisa de pelo menos 3 caracteres.' };
	}

	if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(cleaned)) {
		return { valid: false, message: 'Usa apenas letras, numeros, _, . ou -.' };
	}

	return { valid: true, message: 'USER_ID valido.' };
}

function validateEmail(value) {
	const cleaned = (value || '').trim();
	if (!cleaned) {
		return { valid: false, message: 'EMAIL_SIGNAL e obrigatorio.' };
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
	if (!emailRegex.test(cleaned)) {
		return { valid: false, message: 'Formato de email invalido.' };
	}

	return { valid: true, message: 'EMAIL valido.' };
}

function initSignalFormValidation() {
	const form = document.getElementById('send-signal-form');
	const userIdInput = document.getElementById('user-id');
	const emailInput = document.getElementById('email-signal');
	const globalFeedback = document.getElementById('signal-form-feedback');

	if (!form || !userIdInput || !emailInput) return;

	const runUserValidation = () => {
		const result = validateUserId(userIdInput.value);
		setFieldState(userIdInput, result.valid, result.message);
		return result.valid;
	};

	const runEmailValidation = () => {
		const result = validateEmail(emailInput.value);
		setFieldState(emailInput, result.valid, result.message);
		return result.valid;
	};

	userIdInput.addEventListener('blur', runUserValidation);
	emailInput.addEventListener('blur', runEmailValidation);

	userIdInput.addEventListener('input', () => {
		if (userIdInput.classList.contains('is-invalid')) runUserValidation();
	});

	emailInput.addEventListener('input', () => {
		if (emailInput.classList.contains('is-invalid')) runEmailValidation();
	});

	form.addEventListener('submit', (event) => {
		event.preventDefault();

		const isUserValid = runUserValidation();
		const isEmailValid = runEmailValidation();
		const isFormValid = isUserValid && isEmailValid;

		if (!globalFeedback) return;

		if (isFormValid) {
			globalFeedback.textContent = 'SIGNAL enviado com sucesso.';
			globalFeedback.className = 'form-global-feedback x-small is-valid';
		} else {
			globalFeedback.textContent = 'Corrige os campos marcados antes de enviar.';
			globalFeedback.className = 'form-global-feedback x-small is-invalid';
		}
	});
}

function detectUserNode() {
	const nodeElement = document.getElementById('user-node') || document.getElementById('user-mode');
	if (!nodeElement) return;

	nodeElement.innerText = 'SCANNING...';
	nodeElement.classList.add('blink');

	const userAgent = window.navigator.userAgent.toLowerCase();
	let detectedNode = 'UNKNOWN_NODE';

	if (userAgent.includes('win')) detectedNode = 'WINDOWS_USER';
	else if (userAgent.includes('mac')) detectedNode = 'MAC_OS_USER';
	else if (userAgent.includes('linux')) detectedNode = 'LINUX_NODE';
	else if (userAgent.includes('android')) detectedNode = 'MOBILE_ANDROID';
	else if (userAgent.includes('iphone')) detectedNode = 'MOBILE_IOS';

	setTimeout(() => {
		nodeElement.classList.remove('blink');
		nodeElement.innerText = detectedNode;
		nodeElement.style.color = 'var(--azul-bright)';
	}, 10000);
}

function openPreview(url, title) {
	const modalTitle = document.getElementById('modalTitle');
	const previewFrame = document.getElementById('previewFrame');
	if (!modalTitle || !previewFrame || !myModal) return;

	modalTitle.innerText = `${title}`;
	currentPreviewUrl = url;
	previewFrame.src = url;
	myModal.show();
}

function openLabPreview(title) {
	const modalTitle = document.getElementById('modalTitle');
	const previewFrame = document.getElementById('previewFrame');
	if (!modalTitle || !previewFrame || !myModal || !previewFrame.contentWindow) return;

	modalTitle.innerText = `PROJECT_PREVIEW // ${title}`;
	myModal.show();

	setTimeout(() => {
		const frameDoc = previewFrame.contentWindow.document;
		frameDoc.open();
		frameDoc.write(staticLaravelPreview);
		frameDoc.close();
		applyModalPreviewCursor();
	}, 300);
}

function showOnboardingModalIfFirstVisit() {
	try {
		if (localStorage.getItem('vice-onboarding-hide') === '1') {
			return;
		}
	} catch (error) {
		return;
	}

	const modalEl = document.getElementById('onboardingModal');
	if (!modalEl || typeof bootstrap === 'undefined' || !bootstrap.Modal) return;

	const onboardingModal = new bootstrap.Modal(modalEl);
	const markDontShow = () => {
		try {
			localStorage.setItem('vice-onboarding-hide', '1');
		} catch (error) {
			// ignore storage errors
		}
	};

	const dontShowCheckbox = modalEl.querySelector('#onboarding-dont-show');
	const closeBtn = modalEl.querySelector('.btn-close');

	const gotItBtn = modalEl.querySelector('[data-onboarding-cta="got-it"]');
	if (gotItBtn) {
		gotItBtn.addEventListener('click', () => {
			if (dontShowCheckbox && dontShowCheckbox.checked) {
				markDontShow();
			}
			onboardingModal.hide();
		}, { once: true });
	}

	const openSettingsBtn = modalEl.querySelector('[data-onboarding-action="open-settings"]');
	if (openSettingsBtn) {
		openSettingsBtn.addEventListener('click', () => {
			if (dontShowCheckbox && dontShowCheckbox.checked) {
				markDontShow();
			}
			onboardingModal.hide();
			const settingsBtn = document.getElementById('settings-launch');
			if (settingsBtn) {
				settingsBtn.click();
			}
		}, { once: true });
	}

	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			if (dontShowCheckbox && dontShowCheckbox.checked) {
				markDontShow();
			}
		});
	}

	modalEl.addEventListener('hidden.bs.modal', () => {
		// Garantir que nenhuma backdrop "fantasma" fica ativa
		const body = document.body;
		if (body.classList.contains('modal-open')) {
			body.classList.remove('modal-open');
		}
		const backdrops = document.querySelectorAll('.modal-backdrop');
		backdrops.forEach((el) => {
			if (el && el.parentNode) {
				el.parentNode.removeChild(el);
			}
		});
	});

	onboardingModal.show();
}

function initMobileSidebar() {
	const toggleBtn = document.getElementById('sidebar-toggle');
	const overlay = document.getElementById('mobile-sidebar-overlay');
	const sidebar = document.getElementById('profile-sidebar');
	if (!toggleBtn || !overlay || !sidebar) return;

	const icon = toggleBtn.querySelector('i');

	const syncButtonState = (isOpen) => {
		if (!icon) return;
		if (isOpen) {
			icon.className = 'bi bi-x-lg';
			toggleBtn.setAttribute('aria-label', 'Fechar menu lateral');
		} else {
			icon.className = 'bi bi-list';
			toggleBtn.setAttribute('aria-label', 'Abrir menu lateral');
		}
	};

	const openSidebar = () => {
		document.body.classList.add('sidebar-open');
		syncButtonState(true);
	};

	const closeSidebar = () => {
		document.body.classList.remove('sidebar-open');
		syncButtonState(false);
	};

	toggleBtn.addEventListener('click', () => {
		if (document.body.classList.contains('sidebar-open')) {
			closeSidebar();
		} else {
			openSidebar();
		}
	});

	overlay.addEventListener('click', closeSidebar);

	window.addEventListener('resize', () => {
		if (window.innerWidth >= 992) {
			closeSidebar();
		}
	});

	// garantia de estado inicial
	syncButtonState(document.body.classList.contains('sidebar-open'));
}

document.addEventListener('DOMContentLoaded', () => {
	initThemeToggle();
	initPerformanceToggle();
	applyRandomSelectionColor();
	initProgressBars();
	initRealLoader();
	detectUserNode();
	startAutoCodeTyping();
	initSignalFormValidation();
	initMobileSidebar();

	const modalEl = document.getElementById('previewModal');
	if (modalEl) {
		myModal = new bootstrap.Modal(modalEl);
		const previewFrame = document.getElementById('previewFrame');
		if (previewFrame) {
			previewFrame.addEventListener('load', applyModalPreviewCursor);
		}
		modalEl.addEventListener('hidden.bs.modal', () => {
			const previewFrame = document.getElementById('previewFrame');
			if (previewFrame) previewFrame.src = '';
		});
	}

	const fullscreenBtn = document.getElementById('preview-fullscreen-btn');
	if (fullscreenBtn) {
		fullscreenBtn.addEventListener('click', () => {
			if (currentPreviewUrl) {
				window.open(currentPreviewUrl, '_blank');
			}
		});
	}

	const ano = document.getElementById('ano');
	if (ano) {
		ano.textContent = new Date().getFullYear();
	}

	const labTryBtn = document.getElementById('lab-try-yourself');
	if (labTryBtn && typeof enableLabTryYourself === 'function') {
		labTryBtn.addEventListener('click', enableLabTryYourself);
	}
});
