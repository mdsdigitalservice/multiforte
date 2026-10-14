# Conferência da migração

## Evidências desta etapa

- Repositório GitHub público `mdsdigitalservice/multiforte` vazio antes da implementação.
- ZIP recebido: 83 arquivos WebP, 1.194.560 bytes no total.
- Site informado: https://www.multiforteseguranca.com.br/.
- Leitura do site atual indisponível por timeout no ambiente. Não há inventário confiável das páginas ou dos textos.
- Não foram presumidas páginas `/servicos`, `/quem-somos`, `/contato` ou outras.
- `src/pages/404.astro` é uma página técnica de erro e precisa de aprovação editorial na conferência final.
- Contatos de conversas anteriores não foram inseridos: precisam ser confrontados com o conteúdo atual, conforme o pedido de fidelidade.

## Preservar antes de redesenhar

1. Exportar sitemap e todas as páginas/posts públicos, incluindo eventuais paginações, categorias e downloads indexados.
2. Registrar cada URL exata (inclusive barras finais), título SEO, descrição, canonical, H1, demais títulos, textos, listas, links e alt das imagens.
3. Registrar menu, ordem de seções, rodapé, contatos, redes, botões, PDFs e formulários com sua integração original.
4. Compor as páginas com os componentes existentes, respeitando literalmente o conteúdo e a ordem originais. Ajustar o layout, espaçamento e comportamento responsivo, mantendo a arquitetura de informação.
5. Criar a mesma rota em `src/pages/`: por exemplo, SOMENTE se existir `/empresa/` no original, criar `src/pages/empresa/index.astro`. Registrar cada caminho em `expectedPaths`.
6. Confirmar URLs de mídia antigas e copiar os mesmos caminhos ou criar redirects individuais quando a mídia também tiver URLs públicas relevantes. Não redirecionar todos os erros para a home.
7. Transferir PDFs/downloads e tratar formulários: o site estático não executa PHP nem plugins WordPress. Não apresentar envio como concluído sem backend ou integração real.
8. Comparar conteúdo, links, títulos, canonical e status HTTP entre original e build; confirmar que as URLs que não existem continuam retornando 404.
9. Verificar menu por teclado, foco visível, zoom, contraste, imagens e tamanhos 360/768/1440px; executar Lighthouse na versão publicada antes de estimar ganhos.
10. Só após conferência, remover o aviso de prévia e os dois bloqueios de indexação (meta e header), publicar sitemap/robots com as URLs reais e apontar o domínio.

## Registro de revisão

Atualizar `src/data/migration.json` quando as evidências estiverem completas:

- `capturedAt`: data real da captura do conteúdo original.
- `expectedPaths`: todos os caminhos públicos originais, incluindo `/`.
- `status`: `complete` somente após implementação completa.
- `reviewed`: `true` somente após comparação com o original.

O verificador `npm run build:production` cobre apenas a declaração de revisão, o inventário básico de rotas literais e o header noindex. A validação de texto, SEO, indexação por página e funcionamento de formulários exige conferência adicional. Não remover o bloqueio apenas para fazer o deploy passar.
