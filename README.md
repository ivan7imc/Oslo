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

## Publicando no Cloudflare Pages

**Opção 1 — via Git (recomendado):**
1. No painel do Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**
2. Selecione este repositório
3. Build settings: **Build command: (deixe vazio)** · **Build output directory: `public`**
4. Deploy. Pronto — a página roda no `*.pages.dev` (ou no domínio personalizado).

**Opção 2 — via Wrangler CLI:**

```bash
npx wrangler pages deploy public --project-name=renove-estofados
```

(o `wrangler.jsonc` na raiz já aponta a pasta `public` como output)

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
wrangler.jsonc          # config Cloudflare Pages
```
