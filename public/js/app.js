/* ============================================================
   RENOVE — UI da Calculadora de Preço de Higienização
   Mobile-first, mínimo clique até o WhatsApp
   Lógica de dados/preço/cidades: ./data.js
   ============================================================ */
import {
  PRODUCTS,
  LEVELS,
  AREAS,
  findCity,
  priceFor,
  nfBRL,
  waLink,
  quoteMessage,
} from "./data.js";

const $ = (sel) => document.querySelector(sel);

/* ---------- Estado (com pré-seleção: o lead só toca na cidade) ---------- */
const state = { product: null, level: null, city: null, cityRaw: "" };

const resultPanel = $("#result-panel");
const cityInput = $("#city-input");
const fab = $("#wa-fab");
const mct = {
  label: $("#mct-label"),
  price: $("#mct-price"),
  btn: $("#mct-wa"),
};

/* cidades exibidas como chip rápido (1 toque) */
const CITY_CHIPS = ["Poços de Caldas", "Bandeira do Sul", "Passos"];

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const checkSvg =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const waIcon =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.83 14.13c-.25.7-1.44 1.34-2 1.42-.51.08-1.15.11-1.85-.12-.43-.14-.98-.32-1.68-.62-2.94-1.27-4.86-4.23-5.01-4.43-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37l.57.01c.18.01.43-.07.67.51.25.6.85 2.06.92 2.21.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.61.17.3.77 1.27 1.65 2.06 1.14 1.02 2.1 1.33 2.4 1.48.3.15.47.12.64-.07.18-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.34.07.13.07.72-.18 1.42z"/></svg>';

/* ---------- Render: opções ---------- */
function renderOptions() {
  const prodWrap = $("#product-options");
  prodWrap.innerHTML = PRODUCTS.map(
    (p) => `
    <button type="button" class="opt" data-product="${p.id}" aria-pressed="false">
      <span class="opt-main">
        <span class="opt-title">${p.label}</span>
        <span class="opt-sub">a partir de ${nfBRL.format(p.base)}</span>
      </span>
      <span class="opt-check">${checkSvg}</span>
    </button>`
  ).join("");

  const levelWrap = $("#level-options");
  levelWrap.innerHTML = LEVELS.map(
    (l) => `
    <button type="button" class="opt" data-level="${l.id}" aria-pressed="false">
      <span class="level-main">
        <span class="opt-dot"></span>
        <span class="opt-texts">
          <span class="opt-title">${l.label}</span>
          <span class="opt-sub">${l.desc}</span>
        </span>
      </span>
      <span class="opt-check">${checkSvg}</span>
    </button>`
  ).join("");

  prodWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-product]");
    if (!btn) return;
    state.product = PRODUCTS.find((p) => p.id === btn.dataset.product);
    prodWrap.querySelectorAll("[data-product]").forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
    renderResult();
  });

  levelWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-level]");
    if (!btn) return;
    state.level = LEVELS.find((l) => l.id === btn.dataset.level);
    levelWrap.querySelectorAll("[data-level]").forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
    renderResult();
  });
}

/* pré-seleciona o cenário mais comum: sofá 3 lugares + sujeira normal */
function selectDefaults() {
  state.product = PRODUCTS.find((p) => p.id === "sofa3");
  state.level = LEVELS.find((l) => l.id === "media");
  document.querySelector('[data-product="sofa3"]')?.setAttribute("aria-pressed", "true");
  document.querySelector('[data-level="media"]')?.setAttribute("aria-pressed", "true");
}

/* ---------- Cidades: chips + datalist + rodapé ---------- */
function renderCityChips() {
  const wrap = $("#city-chips");
  wrap.innerHTML = CITY_CHIPS.map(
    (name) => `<button type="button" class="city-chip" data-city="${name}" aria-pressed="false">📍 ${name}</button>`
  ).join("");
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".city-chip");
    if (!btn) return;
    cityInput.value = btn.dataset.city;
    onCityInput();
  });
}

function syncChips(cityName) {
  document.querySelectorAll(".city-chip").forEach((b) =>
    b.setAttribute("aria-pressed", b.dataset.city === cityName ? "true" : "false")
  );
}

function renderAreas() {
  $("#city-list").innerHTML = AREAS.map((a) => `<option value="${a.name}"></option>`).join("");
  $("#area-list").innerHTML = AREAS.map((a) => `<li>${a.name}</li>`).join("");
}

/* ---------- Painel de resultado ---------- */
function countUp(el, target) {
  const dur = 750;
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = nfBRL.format(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function setQuoteReady(product, level, city, avg, waHref) {
  mct.label.textContent = `${product.label} · sujeira ${level.label}`;
  mct.price.textContent = nfBRL.format(avg);
  mct.btn.href = waHref;
  fab.href = waHref; // o FAB também vira atalho do orçamento pronto
  document.body.classList.add("quote-ready");
}

function setQuoteNotReady() {
  document.body.classList.remove("quote-ready");
}

function renderResult() {
  const { product, level, city } = state;

  // Cidade digitada mas fora da região → aviso + captura de interesse
  if (city === null && state.cityRaw.trim()) {
    setQuoteNotReady();
    const raw = escapeHtml(state.cityRaw.trim());
    resultPanel.innerHTML = `
      <div class="result-state result-noserved">
        <span class="result-city no">✕ Ainda não atendemos essa cidade</span>
        <h3>Ainda não chegamos em ${raw}</h3>
        <p>Atendemos <strong>Poços de Caldas e região</strong>. Quer ser avisado quando chegarmos perto de você?</p>
        <div class="areas-preview">${AREAS.slice(0, 4).map((a) => `<span>${a.name}</span>`).join("")}<span>+${AREAS.length - 4} cidades</span></div>
        <a class="btn btn-wa" href="${waLink(
          `Olá! Visitei o site da Renove. Estou em ${state.cityRaw.trim()} e vi que vocês ainda não atendem por lá. Podem me avisar quando chegarem? 👋`
        )}" target="_blank" rel="noopener">${waIcon} Me avise quando chegarem</a>
      </div>`;
    return;
  }

  // Faltando algo
  if (!product || !level || !city) {
    setQuoteNotReady();
    const missing = [];
    if (!product) missing.push("o estofado");
    if (!level) missing.push("o nível de sujeira");
    if (!city) missing.push("sua cidade");
    const title = missing.length === 1 ? "Só falta " + missing[0] : "Faltam só " + missing.join(" e ");
    resultPanel.innerHTML = `
      <div class="result-state result-empty">
        <div class="empty-ico">${missing.length === 1 && missing[0] === "sua cidade" ? "📍" : "⏳"}</div>
        <h3>${title}</h3>
        <p>${missing[0] === "sua cidade" ? "Toque em uma das opções acima ou digite." : "Toque nas opções acima para continuar."}</p>
      </div>`;
    return;
  }

  // Tudo pronto → preço + WhatsApp
  const { avg, range } = priceFor(product, level);
  const waHref = waLink(quoteMessage(product, level, city));

  resultPanel.innerHTML = `
    <div class="result-state">
      <span class="result-city ok">✓ Atendemos ${escapeHtml(city.name)}</span>
      <span class="price-label">Valor médio do serviço</span>
      <div class="price" id="price-value">${nfBRL.format(0)}</div>
      <p class="price-range">faixa de <strong>${nfBRL.format(range[0])}</strong> a <strong>${nfBRL.format(range[1])}</strong></p>
      <div class="result-breakdown">
        <span>Estofado: <b>${escapeHtml(product.label)}</b></span>
        <span>Sujeira: <b>${escapeHtml(level.label)}</b></span>
        <span>Cidade: <b>${escapeHtml(city.name)}</b></span>
      </div>
      <a class="btn btn-wa btn-lg" href="${waHref}" target="_blank" rel="noopener">${waIcon} Pedir orçamento no WhatsApp</a>
      <p class="result-micro">Resposta em minutos · Sem compromisso</p>
    </div>`;

  countUp($("#price-value"), avg);
  setQuoteReady(product, level, city, avg, waHref);
}

function onCityInput() {
  state.cityRaw = cityInput.value;
  state.city = findCity(cityInput.value);
  syncChips(state.city ? state.city.name : null);
  renderResult();
}

cityInput.addEventListener("input", onCityInput);
cityInput.addEventListener("change", onCityInput);

/* ---------- Links de WhatsApp genéricos ---------- */
const genericMsg = waLink("Olá! Vim pelo site da Renove e quero um orçamento de higienização de estofados. 🛋️");
document.querySelectorAll("#why-wa, #final-wa, #footer-wa").forEach((a) => (a.href = genericMsg));
fab.href = genericMsg;

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    }),
  { threshold: 0.1 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- Ano do rodapé ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- Performance mobile: hero não aparece em telas pequenas ----------
   evita baixar ~200 KB à toa no navegador embutido do WhatsApp */
if (matchMedia("(max-width: 920px)").matches) {
  document.querySelector(".hero-visual img")?.removeAttribute("src");
}

/* ---------- Init ---------- */
renderOptions();
selectDefaults();
renderCityChips();
renderAreas();
renderResult();
