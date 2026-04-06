const countBtn = document.getElementById('countBtn');
const countLabel = document.getElementById('countLabel');
const themeBtn = document.getElementById('themeBtn');

let clickCount = 0;

if (countBtn && countLabel) {
    countBtn.addEventListener('click', () => {
        clickCount += 1;
        countLabel.textContent = `Cliques: ${clickCount}`;
    });
}

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light');
        themeBtn.textContent = isLight ? 'Modo escuro' : 'Modo claro';
    });
}
