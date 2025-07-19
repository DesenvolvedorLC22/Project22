// Define um nome e versão para o cache
const CACHE_NAME = 'github-shortcut-v1';
// Lista de arquivos que serão armazenados em cache para funcionamento offline
const URLS_TO_CACHE = [
  '/',
  'index.html'
];

// Evento 'install': é acionado quando o service worker é instalado
self.addEventListener('install', (event) => {
  // Espera até que o cache seja aberto e todos os nossos arquivos sejam adicionados a ele
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento 'fetch': é acionado toda vez que o app tenta buscar um recurso (imagem, script, etc.)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Tenta encontrar o recurso no cache primeiro
    caches.match(event.request)
      .then((response) => {
        // Se encontrar no cache, retorna o recurso do cache
        if (response) {
          return response;
        }
        // Se não encontrar, busca o recurso na rede
        return fetch(event.request);
      })
  );
});