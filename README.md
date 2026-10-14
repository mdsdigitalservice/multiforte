# Multiforte Segurança — Astro + Tailwind

Base inicial da migração de WordPress para Astro, com saída 100% estática para Cloudflare Pages.

## Estado atual

O repositório estava vazio na análise de 14/10/2026. Foram importadas as 83 imagens do ZIP, sem modificar os arquivos. A home original não respondeu às tentativas de leitura neste ambiente. Portanto, esta entrega é a **estrutura técnica inicial**, não a migração completa do conteúdo.

A página inicial é uma prévia técnica identificada e não indexável. Os componentes recebem conteúdo por propriedades; não foram inventados textos comerciais, menus, contatos ou URLs. `Features` e `Services` ficam disponíveis para compor as seções após conferir a ordem do site original.

## Desenvolvimento

Requisito: Node.js 22.12+ (versão do projeto em `.node-version`).

```bash
npm ci
npm run dev
```

```bash
npm run check
npm run build
npm run preview
```

`npm run build` gera `dist/`. Não é necessário adaptador SSR ou backend WordPress em produção.

## Estrutura

```text
src/
  components/
    Header.astro
    Hero.astro
    Features.astro
    Services.astro
    Footer.astro
  layouts/BaseLayout.astro
  pages/
    index.astro
    404.astro
  styles/global.css
  data/
    site.ts
    images.json
    migration.json
public/
  images/        # 83 imagens do ZIP, já importadas
  _headers
scripts/check-migration.mjs
docs/MIGRACAO.md
```

## Onde subir as imagens no GitHub

As imagens anexadas **já estão em `public/images/`**. Não precisa enviar o ZIP novamente.

Para novas imagens pelo GitHub: descompacte o ZIP no computador, abra `public/images/`, selecione **Add file → Upload files** e envie os arquivos extraídos. Evite criar uma segunda pasta `images` dentro dessa pasta e não suba apenas o ZIP: Astro não o descompacta no build.

Uso no código:

```astro
<img src="/images/nome-do-arquivo.webp" alt="Descrição real da imagem" />
```

A URL pública omite `public/`. Mantenha os nomes já importados para não quebrar referências. O inventário `src/data/images.json` registra dimensões, tamanho e SHA-256 dos arquivos originais. Imagens futuras precisam ter suas dimensões e textos alternativos conferidos.

## Cloudflare Pages

Conectar o repositório `mdsdigitalservice/multiforte` com:

| Configuração | Valor |
| --- | --- |
| Framework preset | Astro |
| Production branch | `main` |
| Root directory | raiz do repositório |
| Build command para prévia | `npm run build` |
| Build output directory | `dist` |
| Node | `.node-version` ou `NODE_VERSION=22.22.0` |

Ainda não foi criado um projeto Pages nem alterado o DNS. A configuração foi preparada no código. Use primeiro o endereço `pages.dev` para revisão.

Após concluir e conferir o conteúdo original, use `npm run build:production` como comando de produção. Esse comando impede substituir o site atual enquanto o inventário e a revisão estiverem pendentes; não é uma comparação automática dos textos.

Antes de liberar o domínio: substituir a prévia, restaurar todas as URLs, metadados, links e formulários; remover o noindex da meta e de `public/_headers`; registrar a revisão em `src/data/migration.json`. Só então conferir o site em desktop/mobile e fazer a troca de hospedagem.

## Próximo passo

Fornecer uma exportação do WordPress (Ferramentas → Exportar → Todo o conteúdo), o sitemap e, se possível, uma cópia HTML completa do site. O XML preserva páginas e slugs; uma cópia HTML ajuda a recuperar menus, rodapé e campos de plugins/Elementor que o XML pode não representar como conteúdo renderizado. PDFs e outros downloads também precisam ser copiados quando existirem: o ZIP recebido contém apenas imagens WebP.

Veja `docs/MIGRACAO.md` para a conferência de SEO e conteúdo.
