# Migração de conteúdo — 14/10/2026

## Origem e conferência

- WXR: `multifortesegurana.WordPress.2026-10-14.xml`, exportado em 14/10/2026 21:00:31 UTC.
- ZIP Markdown: 11 documentos com dados do Elementor iguais aos do XML. Comparação registrada em `source-crosscheck.json`.
- URLs públicas do XML: seis páginas; nenhuma publicação de blog ativa.
- Títulos `<title>` e canonical foram capturados diretamente nas seis páginas do site após o acesso voltar a responder; valores em `src/data/seo.json`.
- A ordem dos blocos da home foi mantida: capa, chamada, quatro serviços, sobre nós/indicadores, texto institucional e vídeo, relatório, portfólio, clientes, depoimentos ocultos no original, chamada final e contato no rodapé.
- Primeiro título das páginas internas passou de H2 para H1 sem alterar o texto. A home tem um H1 e títulos subordinados.
- Menus customizados do WordPress usam âncoras, não páginas `/quem-somos/`, `/servicos/` ou `/contato/`.

## Mídia

- 83 imagens WebP do ZIP em `public/images/`, com hashes em `src/data/images.json`.
- Oito arquivos adicionais baixados, mantendo os caminhos em `public/wp-content/uploads/`: catálogo, três relatórios PDF e quatro imagens. Tamanhos e hashes em `src/data/documents.json`.
- PDFs preservados sem reescrita ou alteração de conteúdo. O catálogo é versionado em duas partes binárias e recomposto pelo hook prebuild; o SHA-256 garante identidade byte a byte.
- `missing-media.json` está vazio. Todo recurso que depende do antigo domínio e é usado pelas páginas migradas tem cópia local.
- Vídeo institucional preservado pelo ID original `R1MOzNQ1OKI`; embed lazy em domínio `youtube-nocookie.com`.
- Lightbox de imagens dos relatórios substituído por links para o arquivo original local, permitindo abrir/ampliar sem plugins.
- Imagens antigas presentes no inventário de mídia têm redirects individuais em `_redirects`, evitando depender do WordPress após a troca de domínio.

## Comportamento preservado e correções

- Os quatro flip cards de serviços viraram cartões com expansão nativa por clique/teclado. Títulos, chamadas e descrições foram preservados.
- Chamada para proposta continua direcionando ao WhatsApp extraído da fonte. Não foi criado formulário novo ou envio de e-mail fictício.
- A seção de depoimentos estava oculta em desktop, tablet e mobile no Elementor. O texto foi preservado, e a seção continua oculta. O shortcode Trustindex não é executado no Astro; não há widget PHP ou feed vivo de avaliações.
- O link de YouTube na bio estava concatenado com uma URL de PDF inválida. Foi usado o endereço correto do canal, confirmado no cabeçalho da própria fonte.
- `/avalie-nos` retorna 301 para `https://g.page/r/Ca91en9E0_lREB0/review` no site original. Esse redirect e a variante com barra final foram replicados no Pages.
- Conteúdo publicado de `/teste/`, erros de redação na origem, telefones e copyright 2024 foram mantidos por fidelidade ao pedido. A política continua com o placeholder `[E-MAIL DE CONTATO]`, como na fonte.

## Validação executada

- `npm run check`: zero erros e avisos.
- `npm run build`: saída estática em `dist/`.
- `python3 scripts/verify-migration.py <XML>`: compara as seis rotas, titles, canonical, presença de um H1, texto original, arquivos locais e âncoras do menu.
- Na home, a URL textual de vídeo do export é reconhecida pelo mesmo ID no iframe; não é exibida como texto cru.
- O importador remove estilos, scripts e SVG decorativo do conteúdo HTML. Links novos com `target=_blank` recebem `noopener noreferrer`.
- Arquivos binários conferidos pelo tipo e SHA-256.

## Pendente antes do domínio definitivo

- Revisão visual em navegador nas larguras de celular, tablet e desktop. Não foi executada nesta etapa; não há pontuação Lighthouse ou garantia de Core Web Vitals medida.
- Conferir as interações no navegador publicado: menu, expansão dos serviços, WhatsApp, vídeo e downloads.
- Remover noindex da meta em `BaseLayout.astro` e do header em `_headers` somente na versão que substituirá o WordPress; atualizar `migration.json` para `complete` e `reviewed: true`.
- Apontar o domínio após validar a prévia. DNS e hospedagem atual permanecem sem alteração nesta etapa.
