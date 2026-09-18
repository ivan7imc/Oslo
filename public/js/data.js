/* ============================================================
   RENOVE — Dados e lógica pura da Calculadora de Preço
   (sem dependências de DOM — testável em Node)
   ============================================================ */

/* WhatsApp da Renove (DDI + DDD + número, só dígitos). */
export const WHATSAPP_NUMBER = "5535999479680";

/* ---------- Catálogo de serviços (preço base em R$) ---------- */
export const PRODUCTS = [
  { id: "sofa2",    label: "Sofá 2 lugares",             base: 150 },
  { id: "sofa3",    label: "Sofá 3 lugares",             base: 180 },
  { id: "sofa4",    label: "Sofá 4 lugares",             base: 220 },
  { id: "sofa5",    label: "Sofá 5 lugares / modular",   base: 280 },
  { id: "poltrona", label: "Poltrona",                   base: 90 },
  { id: "puff",     label: "Puff / ottoman",             base: 70 },
  { id: "cadeira",  label: "Cadeira de jantar",          base: 45 },
  { id: "casal",    label: "Cama de casal (colchão + box)", base: 170 },
  { id: "colchao",  label: "Colchão queen/king",         base: 200 },
  { id: "carro",    label: "Banco de carro",             base: 60 },
];

/* ---------- Níveis de sujeira (multiplicador sobre o preço base) ---------- */
export const LEVELS = [
  { id: "leve",   label: "Leve",   desc: "só manutenção",                     mult: 1.0 },
  { id: "media",  label: "Normal", desc: "uso diário",                        mult: 1.15 },
  { id: "pesada", label: "Pesada", desc: "manchas, pets, sem limpeza há tempo", mult: 1.4 },
];

/* ---------- Cidades atendidas (Poços de Caldas e região) ----------
   aliases = formas abreviadas usadas no match “fofo” (sem acento). */
export const AREAS = [
  { name: "Poços de Caldas",        aliases: ["pocos de caldas", "pocos", "caldas"] },
  { name: "Bandeira do Sul",        aliases: ["bandeira do sul", "bandeira"] },
  { name: "Alpinópolis",            aliases: [] },
  { name: "Alfenas",                aliases: [] },
  { name: "Passos",                 aliases: [] },
  { name: "Piumhi",                 aliases: [] },
  { name: "Delfim Moreira",         aliases: [] },
  { name: "Campestre",              aliases: [] },
  { name: "Carvalho",               aliases: [] },
  { name: "Monte Santo de Minas",   aliases: ["monte santo"] },
  { name: "São Roque de Minas",     aliases: ["sao roque"] },
  { name: "Vargem Bonita",          aliases: [] },
  { name: "Botelhos",               aliases: [] },
  { name: "Campo do Meio",          aliases: [] },
  { name: "Cambuí",                 aliases: [] },
  { name: "Cabo Verde",             aliases: [] },
  { name: "Carandaí",               aliases: [] },
  { name: "Campos Gerais",          aliases: [] },
  { name: "Itamonte",               aliases: [] },
  { name: "Miradouro",              aliases: [] },
  { name: "Passa-Quatro",           aliases: ["passa quatro"] },
  { name: "Passa-Vinte",            aliases: ["passa vinte"] },
  { name: "Pocrane",                aliases: [] },
  { name: "Santana do Garambéu",    aliases: ["santana do garambeu"] },
  { name: "Jacuí",                  aliases: [] },
  { name: "Poço Fundo",             aliases: [] },
];

/* ---------- Helpers ---------- */
export const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bminas gerais\b/g, " ")
    .replace(/\bminas\b/g, " ")
    .replace(/\bmg\b/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Busca a cidade no lista de atendimento.
 * Retorna o objeto da cidade ({name, aliases}) ou null.
 */
export function findCity(raw) {
  const q = norm(raw);
  if (!q) return null;

  // 1) match exato (nome ou alias)
  for (const a of AREAS) {
    const names = [a.name, ...a.aliases].map(norm);
    if (names.includes(q)) return a;
  }
  // 2) match por inclusão (ex.: "poços de caldas centro", "minha cidade é pocos")
  for (const a of AREAS) {
    const names = [a.name, ...a.aliases].map(norm);
    if (names.some((n) => (n.length >= 4 && q.includes(n)) || (q.length >= 4 && n.includes(q)))) return a;
  }
  return null;
}

export const round5 = (v) => Math.round(v / 5) * 5;

export const nfBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function priceFor(product, level) {
  const avg = round5(product.base * level.mult);
  return { avg, range: [round5(avg * 0.9), round5(avg * 1.12)] };
}

export function quoteMessage(product, level, city) {
  const { avg, range } = priceFor(product, level);
  return [
    "Olá! Quero um orçamento pela calculadora do site da Renove. 🛋️",
    "",
    `• Estofado: ${product.label}`,
    `• Nível de sujeira: ${level.label}`,
    `• Cidade: ${city.name}`,
    "",
    `O site mostrou valor médio de ${nfBRL.format(avg)} (faixa ${nfBRL.format(range[0])}–${nfBRL.format(range[1])}). Qual o valor exato para mim?`,
  ].join("\n");
}
