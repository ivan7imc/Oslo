# Renove — Landing Page + Calculadora de Preço

Landing page estática de alta conversão para a **Renove Limpeza e Higienização de Estofados** (Poços de Caldas/MG e região), com **Calculadora de Preço de Higienização** integrada:

- Escolha do **tipo de estofado** (sofás, poltronas, cadeiras, camas, colchões, bancos de carro)
- Escolha do **nível de sujeira** (leve / normal / pesada)
- Digitação da **cidade** — se for Poços de Caldas ou região (lista em `public/js/app.js`), mostra o **valor médio na hora** e já abre o **WhatsApp com o orçamento pré-preenchido**; se a cidade não for da região, avisa que ainda não atendem e oferece "me avise quando chegarem".

Sem frameworks, sem build — HTML + CSS + JS puro, leve e rápida.

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

## Configurações rápidas (tudo em `public/js/app.js`)

| O quê | Onde |
| --- | --- |
| **Número do WhatsApp** (DDI+DDD, só dígitos) | constante `WHATSAPP_NUMBER` no topo do arquivo — **troque antes de publicar** |
| **Preços** por tipo de estofado | array `PRODUCTS` (`base` = preço base em R$) |
| **Multiplicadores** por nível de sujeira | array `LEVELS` (`mult`) |
| **Cidades atendidas** (nomes + aliases) | array `AREAS` |
| Texto do orçamento enviado no WhatsApp | função `quoteMessage()` |
| Imagem de compartilhamento (Open Graph) | meta `og:image` no `index.html` — depois do deploy, troque pela URL absoluta (`https://seu-dominio.pages.dev/images/hero.jpg`) |

## Estrutura

```
public/
├── index.html          # landing page
├── css/styles.css      # design
├── js/app.js           # calculadora + validação de cidade + funil WhatsApp
└── images/             # hero.jpg, before-after.jpg
wrangler.jsonc          # config Cloudflare Pages
```
