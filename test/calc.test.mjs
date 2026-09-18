// Testes da lógica da calculadora (rodam em Node: node test/calc.test.mjs)
import assert from "node:assert/strict";
import {
  findCity,
  priceFor,
  quoteMessage,
  PRODUCTS,
  LEVELS,
  AREAS,
  waLink,
} from "../public/js/data.js";

// ---------- Match de cidades ----------
assert.equal(findCity("Poços de Caldas")?.name, "Poços de Caldas");
assert.equal(findCity("pocos de caldas")?.name, "Poços de Caldas");
assert.equal(findCity("Pocos MG")?.name, "Poços de Caldas");
assert.equal(findCity("poços de caldas centro")?.name, "Poços de Caldas");
assert.equal(findCity("minha cidade é Poços de Caldas")?.name, "Poços de Caldas");
assert.equal(findCity("Bandeira do Sul")?.name, "Bandeira do Sul");
assert.equal(findCity("bandeira")?.name, "Bandeira do Sul");
assert.equal(findCity("alfenas")?.name, "Alfenas");
assert.equal(findCity("São Roque")?.name, "São Roque de Minas");
assert.equal(findCity("passa-quatro")?.name, "Passa-Quatro");

// Fora da região → null
assert.equal(findCity("Belo Horizonte"), null);
assert.equal(findCity("São Paulo"), null);
assert.equal(findCity("Campinas"), null);
assert.equal(findCity(""), null);
assert.equal(findCity("   "), null);

// ---------- Preço ----------
const sofa3 = PRODUCTS.find((p) => p.id === "sofa3");
const leve = LEVELS.find((l) => l.id === "leve");
const media = LEVELS.find((l) => l.id === "media");
const pesada = LEVELS.find((l) => l.id === "pesada");

assert.deepEqual(priceFor(sofa3, leve), { avg: 180, range: [160, 200] });
assert.equal(priceFor(sofa3, media).avg, 205); // 180 * 1.15 = 207 → 205
assert.equal(priceFor(sofa3, pesada).avg, 250); // 180 * 1.4 = 252 → 250
assert.equal(priceFor(PRODUCTS.find((p) => p.id === "carro"), leve).avg, 60);

// ---------- Mensagem do WhatsApp ----------
const msg = quoteMessage(sofa3, media, findCity("Poços"));
assert.match(msg, /Sofá 3 lugares/);
assert.match(msg, /Normal/);
assert.match(msg, /Poços de Caldas/);
assert.match(msg, /R\$\s?205/);

const link = waLink("oi");
assert.match(link, /^https:\/\/wa\.me\/\d+\?text=/);

// ---------- Cidades únicas ----------
const names = AREAS.map((a) => a.name);
assert.equal(new Set(names).size, names.length);
assert.ok(names.includes("Poços de Caldas"));
assert.ok(names.length >= 20, `esperava >= 20 cidades, tinha ${names.length}`);

console.log(`✅ ${names.length} cidades atendidas · todos os asserts passaram`);
