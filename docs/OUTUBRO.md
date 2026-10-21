# Avaliação das artes de outubro

`/outubro/` mostra as seis propostas visuais do primeiro lote, em duas séries de três variações. A página não está vinculada ao menu, rodapé ou sitemap e envia `noindex, nofollow`. O link não exige senha: quem o receber pode alterar as avaliações.

As imagens são WebP otimizadas em `public/outubro/`. Os originais em PNG permanecem na origem dos materiais criativos, fora deste repositório. O endpoint `/api/outubro/reviews` é uma Cloudflare Pages Function que usa D1 para manter legenda, observações, estado e horário por arte. A interface só habilita aprovação depois de uma leitura bem sucedida do endpoint; se o banco não estiver conectado, avisa que a aprovação está indisponível.

## Vincular armazenamento na Cloudflare Pages

1. Criar um banco D1 no painel Cloudflare para as avaliações da Multiforte.
2. Em **Workers & Pages → multiforte → Settings → Bindings**, adicionar o banco D1 com o nome exato `MULTIFORTE_REVIEWS`, tanto em Production quanto em Preview, conforme necessário.
3. Publicar novamente o projeto após adicionar o binding. A tabela é criada na primeira chamada da Function.
4. Abrir `/api/outubro/reviews`: a resposta deve ser `{"reviews":[]}` no início. Um HTTP 503 indica binding ausente ou falha do banco.
5. Testar o envio de uma legenda de rascunho na página, recarregar em outro dispositivo e confirmar persistência. Reverter o teste pelo próprio painel, se necessário.

Mudanças nas imagens ou legendas que exijam nova aprovação devem aumentar `data-revision` nos cartões modificados e aceitar a nova revisão na Function. O endpoint fica no mesmo domínio do site. Como a página é acessível por link sem autenticação, as respostas também são acessíveis a quem conhece a URL da API.
