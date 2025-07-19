// Nome do cache
const CACHE_NAME = 'study-manager-cache-v1';

// Arquivos e recursos a serem armazenados em cache
// Inclui o HTML, os scripts de bibliotecas externas e o manifest.json
const urlsToCache = [
  '/', // Representa o arquivo HTML principal (index.html)
  'manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.min.js',
  'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.css',
  'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.js',
  'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/locales/pt-br.js'
];

// Evento de Instalação: é acionado quando o service worker é registrado pela primeira vez.
self.addEventListener('install', event => {
  // O service worker espera até que o cache seja completamente preenchido.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        // Adiciona todos os URLs definidos ao cache.
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de Fetch: é acionado para cada requisição feita pela página.
self.addEventListener('fetch', event => {
  event.respondWith(
    // Tenta encontrar uma resposta para a requisição no cache.
    caches.match(event.request)
      .then(response => {
        // Se a resposta for encontrada no cache, a retorna.
        if (response) {
          return response;
        }

        // Se não for encontrada no cache, faz a requisição à rede.
        return fetch(event.request).then(
          response => {
            // Se a resposta da rede for inválida, a retorna sem cachear.
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta. Uma resposta é um Stream e só pode ser consumida uma vez.
            // Precisamos de uma cópia para o navegador e outra para o cache.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Adiciona a nova resposta da rede ao cache para uso futuro.
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Evento de Ativação: é acionado quando um novo service worker assume o controle.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Lista de caches a serem mantidos.

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Se o nome do cache não estiver na lista de permissões, ele é excluído.
          // Isso remove caches antigos e desatualizados.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

