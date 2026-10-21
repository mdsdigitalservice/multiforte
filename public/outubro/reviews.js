      const cards = [...document.querySelectorAll('.card')];
      const system = document.querySelector('#system');
      const statusLabels = {pending:'Pendente',draft:'Legenda salva',approved:'Aprovado',changes:'Ajustes solicitados'};
      const api = '/api/outubro/reviews';
      function message(value, kind = '') { system.textContent = value; system.dataset.kind = kind; }
      function show(entry) {
        const card = cards.find(el => el.dataset.id === entry.id);
        if (!card || Number(entry.revision) !== Number(card.dataset.revision)) return;
        card.querySelector('.caption').value = entry.caption;
        card.querySelector('.feedback').value = entry.feedback || '';
        const badge = card.querySelector('.badge');
        badge.dataset.status = entry.status;
        badge.textContent = statusLabels[entry.status] || 'Pendente';
        card.querySelector('.updated').textContent = entry.updated_at ? `Registrado em ${new Date(entry.updated_at + 'Z').toLocaleString('pt-BR', {dateStyle:'short',timeStyle:'short'})}` : '';
      }
      async function load() {
        try {
          const response = await fetch(api, {cache:'no-store'});
          if (!response.ok) throw new Error('Serviço indisponível');
          const data = await response.json();
          data.reviews.forEach(show);
          cards.forEach(card => card.querySelectorAll('[data-action]').forEach(button => button.disabled = false));
          message('Avaliações sincronizadas. Você já pode responder.', 'success');
        } catch {
          message('As avaliações estão temporariamente indisponíveis. As artes podem ser vistas e baixadas; a aprovação está desativada até o serviço ser restabelecido.', 'error');
        }
      }
      cards.forEach(card => card.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', async () => {
        const status = button.dataset.action;
        const caption = card.querySelector('.caption').value.trim();
        const feedback = card.querySelector('.feedback').value.trim();
        if (!caption) { message('Preencha a legenda antes de enviar.', 'error'); card.querySelector('.caption').focus(); return; }
        if (status === 'changes' && !feedback) { message('Descreva os ajustes desejados antes de solicitar alterações.', 'error'); card.querySelector('.feedback').focus(); return; }
        const buttons = card.querySelectorAll('[data-action]');
        buttons.forEach(control => control.disabled = true);
        card.querySelector('.updated').textContent = 'Salvando…';
        try {
          const response = await fetch(api, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:card.dataset.id,revision:Number(card.dataset.revision),status,caption,feedback})});
          if (!response.ok) throw new Error('Falha ao salvar');
          show((await response.json()).review);
          message(`Proposta ${card.querySelector('h3').textContent} registrada: ${statusLabels[status].toLowerCase()}.`, 'success');
        } catch { card.querySelector('.updated').textContent = 'Não foi possível salvar. Tente novamente.'; message('A resposta não foi registrada. Verifique sua conexão e tente novamente.', 'error'); }
        finally { buttons.forEach(control => control.disabled = false); }
      })));
      const dialog = document.querySelector('#preview');
      document.querySelectorAll('.expand').forEach(button => button.addEventListener('click', () => { dialog.querySelector('img').src = button.dataset.image; dialog.showModal(); }));
      dialog.querySelector('button').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
      load();
