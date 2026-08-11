
/* Mundos Sombrios — Códice dos Mundos
   Dual-library hub: Êxodo (sci-fi) / Ocultatun (horror paranormal)
   This file only controls the Códice presentation and selection flow.
*/

const CODEX_MODE_INFO = {
  exodo: {
    title: 'Biblioteca de Êxodo',
    kicker: 'ÊXODO // ASSIMILAÇÃO',
    subtitle: 'Ficção científica, Gene Êxodo, Carga Êxodo, Linhagem Herdada e Projeto Player.',
    summaryTitle: 'Eixos do acervo',
    summary: [
      'Livro base de Êxodo com as regras centrais do Gene, CÊ, Assimilação e Estresse.',
      'Expansões de Êxodo agrupadas no mesmo acervo, incluindo Projeto Player, Linhagem Herdada e Aprimorador.',
      'Leitura interna do PDF dentro do próprio site.'
    ],
    chips: ['CÊ', 'TCG', 'Projeto Player', 'Linhagem Herdada', 'Bio-Forja'],
    themeClass: 'codex-theme-exodo'
  },
  ocultatun: {
    title: 'Biblioteca de Ocultatun',
    kicker: 'OCULTATUN // DECADÊNCIA',
    subtitle: 'Horror paranormal, Energia Paranormal, Decadência, Envolto e contenção do Abismo.',
    summaryTitle: 'Eixos do acervo',
    summary: [
      'Livro base de Ocultatun com as regras centrais do sistema D20 adaptativo e Decadência.',
      'Expansões de Ocultatun agrupadas no mesmo acervo, incluindo O Envolto e demais suplementos.',
      'Leitura interna do PDF dentro do próprio site.'
    ],
    chips: ['EP', 'TCP', 'Decadência', 'Envolto', 'Gamma Lock'],
    themeClass: 'codex-theme-ocultatun'
  }
};

function getCodexRoot() {
  return document.getElementById('screen-codex');
}

function openCodexMode(mode) {
  const info = CODEX_MODE_INFO[mode] || CODEX_MODE_INFO.exodo;
  window.currentCodexMode = mode in CODEX_MODE_INFO ? mode : 'exodo';

  const root = getCodexRoot();
  const home = document.getElementById('codex-home');
  const view = document.getElementById('codex-library-view');
  const title = document.getElementById('codex-library-title');
  const subtitle = document.getElementById('codex-library-subtitle');
  const kicker = document.getElementById('codex-library-kicker');

  if (!root || !home || !view) return;

  root.classList.remove('codex-theme-exodo', 'codex-theme-ocultatun');
  root.classList.add(info.themeClass);

  home.style.display = 'none';
  view.style.display = 'block';

  if (title) title.textContent = info.title;
  if (subtitle) subtitle.textContent = info.subtitle;
  if (kicker) kicker.textContent = info.kicker;

  renderCodexLibrary(window.currentCodexMode);
  renderCodexSummary(window.currentCodexMode);
}

function closeCodexMode() {
  const root = getCodexRoot();
  const home = document.getElementById('codex-home');
  const view = document.getElementById('codex-library-view');
  if (!root || !home || !view) return;

  root.classList.remove('codex-theme-exodo', 'codex-theme-ocultatun');
  home.style.display = 'grid';
  view.style.display = 'none';

  closeCodexReader();
}

function renderCodexSummary(mode) {
  const info = CODEX_MODE_INFO[mode] || CODEX_MODE_INFO.exodo;
  const root = document.getElementById('codex-mode-summary');
  if (!root) return;
  root.innerHTML = `
    <section class="codex-summary-card">
      <h4>${escapeCodexHtml(info.summaryTitle)}</h4>
      <div class="codex-chips">
        ${info.chips.map(x => `<span class="codex-chip">${escapeCodexHtml(x)}</span>`).join('')}
      </div>
      <ul>
        ${info.summary.map(x => `<li>${escapeCodexHtml(x)}</li>`).join('')}
      </ul>
    </section>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const home = document.getElementById('codex-home');
  const view = document.getElementById('codex-library-view');
  if (home) home.style.display = 'grid';
  if (view) view.style.display = 'none';
  window.currentCodexMode = 'exodo';
  renderCodexSummary('exodo');
});
