# Multiforte Segurança — Astro + Tailwind

Migração estática do WordPress para Astro 7 e Tailwind 4. As seis páginas publicadas e a navegação por âncoras foram recuperadas do XML de 14/10/2026. Os 11 documentos do ZIP Markdown foram comparados aos dados do Elementor: todos coincidem.

## Conteúdo e URLs

| Página | URL |
| --- | --- |
| Home | `/` |
| PORTFÓLIO | `/portfolio/` |
| teste | `/teste/` |
| bio | `/bio/` |
| Instrução Normativa | `/instrucao-normativa/` |
| Política de Privacidade | `/politica-de-privacidade/` |

Quem somos, Serviços, Portfólio, Avaliações e Contato no menu apontam para âncoras da home, conforme o WordPress. Não foram criadas páginas fictícias para esses itens. `/teste/` foi mantida porque está publicada no original, inclusive com o texto de exemplo. Rascunhos, autores, dados administrativos e templates internos do Elementor não foram publicados.

Os textos foram preservados, inclusive os telefones, o ano do rodapé e o placeholder de e-mail na política. Correções editoriais ficam para uma etapa separada. O link quebrado de YouTube na bio foi corrigido usando o endereço válido já presente no cabeçalho original. `/avalie-nos` mantém o redirecionamento 301 observado no site para a avaliação do Google.

## Desenvolvimento e build

Node.js 22.12+; versão sugerida em `.node-version`.

```bash
npm ci
npm run dev
npm run check
npm run build
python3 scripts/verify-migration.py
npm run preview
```

`npm run build` gera `dist/`, sem PHP, WordPress, React ou renderização por servidor. O vídeo usa iframe lazy do YouTube; serviços usam `<details>` acessível e o menu móvel usa JavaScript mínimo.

## Estrutura

```text
src/
  components/    # Header, Hero, Services, About, MediaSection,
                 # Portfolio, Clients, CallToAction, Footer
  layouts/BaseLayout.astro
  pages/
    index.astro
    [...slug].astro
    404.astro
    sitemap.xml.ts
  data/
    wordpress.json        # Conteúdo público extraído
    seo.json              # Titles e canonical capturados ao vivo
    images.json           # Inventário das 83 imagens do ZIP
    documents.json        # PDFs e imagens complementares
    redirects.json
    migration.json
  styles/global.css
public/
  images/                 # 83 imagens já importadas
  wp-content/uploads/     # Catálogo e relatórios nos caminhos originais
  _headers
  _redirects
scripts/
  import-wordpress.py
  verify-migration.py
```

## Imagens e PDFs

As imagens anexadas **já estão em `public/images/`**. Não é necessário reenviar o ZIP. Para novas imagens pelo GitHub: descompactar no computador, abrir `public/images/`, selecionar **Add file → Upload files** e enviar os arquivos extraídos. Referenciar no código como `/images/arquivo.webp`, sem `public` na URL.

O catálogo, os três relatórios em PDF e quatro imagens complementares foram baixados e preservados sem alteração em `public/wp-content/uploads/`, preservando as URLs originais. As imagens equivalentes do ZIP usam redirects individuais de suas antigas URLs para os WebP locais. O catálogo é armazenado em duas partes em `assets/documents/` para respeitar o limite de upload do conector GitHub. O hook `prebuild` recompõe o PDF original e valida seu SHA-256 antes de gerar o site; não há downloads do WordPress durante o build.

## Cloudflare Pages

Conectar `mdsdigitalservice/multiforte` com:

| Configuração | Valor |
| --- | --- |
| Preset | Astro |
| Branch | `main` |
| Root directory | raiz do repositório |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node | `.node-version` ou `NODE_VERSION=22.22.0` |

O projeto está preparado para o build do Pages. Nenhum domínio ou DNS foi alterado. A versão permanece com `noindex` para revisão antes da troca de hospedagem. Para ativar a indexação: mudar o padrão `noindex` em `BaseLayout.astro` e remover `X-Robots-Tag: noindex, nofollow` de `public/_headers`. Conferir o resultado visual em desktop e mobile antes da troca do domínio.

O comando adicional `npm run build:production` continua bloqueando o corte definitivo enquanto a revisão estiver pendente. Isso não impede `npm run build` para prévia. Detalhes e limites da verificação estão em `docs/MIGRACAO.md`.

## Reimportação

```bash
python3 scripts/import-wordpress.py /caminho/export.xml
npm run build
python3 scripts/verify-migration.py /caminho/export.xml
```

O importador foi escrito para a estrutura deste site; IDs de widgets e templates identificam os blocos originais. Mudanças estruturais no Elementor exigem ajustar o importador. O XML bruto não fica no repositório público.
