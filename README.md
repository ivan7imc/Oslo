# Renove — Landing Page + Calculadora de Preço

Landing page estática de alta conversão para a **Renove Limpeza e Higienização de Estofados** (Poços de Caldas/MG e região), com **Calculadora de Preço de Higienização** integrada.

**Otimizada para mobile** (o link é compartilhado pelo WhatsApp) e com **mínimo de cliques**:

- Sofá 3 lugares + sujeira normal já vêm **pré-selecionados** (o lead só toca na cidade)
- **Chips de cidade** (Poços de Caldas, Bandeira do Sul, Passos): 1 toque em vez de digitar
- Preço calculado → **barra fixa no rodapé da tela** com valor + botão do WhatsApp (desktop usa o painel lateral)
- A mensagem do WhatsApp já chega **pré-preenchida** com estofado, sujeira, cidade e valor mostrado
- Cidade fora da região → aviso "ainda não atendemos" + botão "me avise quando chegarem"
- Sem frameworks, sem build — HTML + CSS + JS puro, hero image não é baixada em telas pequenas

## Rodando localmente

Qualquer servidor estático funciona:

```bash
npx serve public
# ou
python3 -m http.server 8080 -d public
```

## Publicando no Cloudflare (Worker + assets estáticos)

O `wrangler.jsonc` aponta a pasta `public/` como `assets.directory`, então o deploy publica o site como **Worker com assets estáticos** — não existe passo de build.

**Opção 1 — via Git (Workers Builds):**
1. No painel do Cloudflare: **Workers & Pages → Create → Workers → Connect to Git**
2. Selecione este repositório
3. Build command: **(deixe vazio)** · Deploy command: **`npx wrangler deploy`**
4. Deploy. A página roda em `https://renove-estofados.<seu-subdominio>.workers.dev` (ou no domínio personalizado)

**Opção 2 — via Wrangler CLI (na sua máquina):**

```bash
npx wrangler login
npx wrangler deploy
```

> **Atenção:** `npx wrangler deploy` é comando de **Workers**. Se a config tiver só `pages_build_output_dir` (formato Pages), ele falha com `Missing entry-point to Worker script or to assets directory`. Se preferir **Cloudflare Pages** (`*.pages.dev`), troque a config para `"pages_build_output_dir": "public"` e use `npx wrangler pages deploy public --project-name=renove-estofados` — as duas chaves não funcionam juntas no mesmo comando.

## Configurações rápidas

| O quê | Onde |
| --- | --- |
| **Número do WhatsApp** | constante `WHATSAPP_NUMBER` no topo de `public/js/data.js` (hoje: `5535999479680`) |
| **Preços** por tipo de estofado | array `PRODUCTS` (`base` = preço base em R$) |
| **Multiplicadores** por nível de sujeira | array `LEVELS` (`mult`) |
| **Cidades atendidas** (nomes + aliases) | array `AREAS` |
| **Chips de cidade** (1 toque) | constante `CITY_CHIPS` no `public/js/app.js` |
| **Pré-seleção** (reduz cliques) | função `selectDefaults()` no `public/js/app.js` |
| Texto do orçamento enviado no WhatsApp | função `quoteMessage()` |
| Imagem de compartilhamento (Open Graph) | meta `og:image` no `index.html` — depois do deploy, troque pela URL absoluta |

## Estrutura

```
public/
├── index.html          # landing page
├── css/styles.css      # design (mobile-first)
├── js/data.js          # preços, cidades, match, mensagem WhatsApp
├── js/app.js           # UI, pré-seleção, chips, barra de CTA
└── images/             # hero.jpg, before-after.jpg
test/calc.test.mjs      # testes da lógica (node test/calc.test.mjs)
wrangler.jsonc          # config Cloudflare Workers (assets estáticos)
```
