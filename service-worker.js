const CACHE_NAME = 'toolbazaar-shell-v5';
const CORE_ASSETS = [
    './index.html',
    './toolbazaar_multi_tool_hub.html',
    './manifest.json',
    './toolbazaar-icon.svg',
    './service-worker.js'
];

const EXTERNAL_ASSETS = [
    { url: 'https://cdn.tailwindcss.com', mode: 'no-cors' },
    { url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap', mode: 'cors' },
    { url: 'https://unpkg.com/lucide@latest', mode: 'no-cors' },
    { url: 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js', mode: 'no-cors' },
    { url: 'https://cdn.jsdelivr.net/npm/@pdfsmaller/pdf-encrypt@1.2.0/dist/pdf-encrypt.umd.js', mode: 'cors' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', mode: 'no-cors' },
    { url: 'https://cdn.jsdelivr.net/npm/qrcode@1.0.0/build/qrcode.min.js', mode: 'no-cors' },
    { url: 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js', mode: 'no-cors' },
    { url: 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', mode: 'cors' },
    { url: 'https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.umd.js', mode: 'cors' },
    { url: 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js', mode: 'cors' },
    { url: 'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js', mode: 'cors' },
    { url: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.8/dist/index.mjs', mode: 'cors' },
    { url: 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js', mode: 'cors' },
    { url: 'https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js', mode: 'cors' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js', mode: 'no-cors' },
    { url: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js', mode: 'cors' }
];

const CDN_ORIGINS = new Set([
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://unpkg.com',
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
    'https://staticimgly.com'
]);

async function cacheExternalResource(cache, url, mode) {
    const request = new Request(url, { mode, cache: 'reload' });
    const response = await fetch(request);
    if (!response.ok && response.type !== 'opaque') {
        throw new Error(`HTTP ${response.status} while caching ${url}`);
    }
    await cache.put(request, response.clone());

    if (url.startsWith('https://fonts.googleapis.com/')) {
        const stylesheet = await response.text();
        const fontUrls = new Set(
            Array.from(stylesheet.matchAll(/url\((?:['"]?)(https:\/\/fonts\.gstatic\.com\/[^)'"]+)/g), match => match[1])
        );
        await Promise.all(Array.from(fontUrls, async fontUrl => {
            try {
                await cacheExternalResource(cache, fontUrl, 'cors');
            } catch (error) {
                console.warn('Could not precache a Google Font file:', fontUrl, error);
            }
        }));
    }
}

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        const coreUrls = CORE_ASSETS.map(path => new URL(path, self.registration.scope).href);
        await cache.addAll(coreUrls);

        const results = await Promise.allSettled(
            EXTERNAL_ASSETS.map(asset => cacheExternalResource(cache, asset.url, asset.mode))
        );
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn('External asset was not precached and will need a connection once:', EXTERNAL_ASSETS[index].url, result.reason);
            }
        });

        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames
            .filter(name => name.startsWith('toolbazaar-shell-') && name !== CACHE_NAME)
            .map(name => caches.delete(name)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const requestUrl = new URL(request.url);
    if (CDN_ORIGINS.has(requestUrl.origin)) {
        event.respondWith((async () => {
            const cache = await caches.open(CACHE_NAME);
            const cached = await cache.match(request, { ignoreVary: true });
            if (cached) return cached;

            try {
                const response = await fetch(request);
                if (response.ok || response.type === 'opaque') {
                    await cache.put(request, response.clone());
                }
                return response;
            } catch (error) {
                console.error('Cached CDN resource is unavailable offline:', request.url, error);
                return new Response('This ToolBazaar dependency is not cached yet. Connect once and reload the app.', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                });
            }
        })());
        return;
    }

    if (requestUrl.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            const cache = await caches.open(CACHE_NAME);
            try {
                const response = await fetch(request);
                if (response.ok) await cache.put(request, response.clone());
                return response;
            } catch (error) {
                const appUrl = new URL('./toolbazaar_multi_tool_hub.html', self.registration.scope).href;
                const offlinePage = await cache.match(request, { ignoreSearch: true }) || await cache.match(appUrl);
                if (offlinePage) return offlinePage;
                console.error('ToolBazaar app shell is not available offline:', error);
                return new Response('ToolBazaar is not cached yet. Connect to the internet and open the app once.', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                });
            }
        })());
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
            const response = await fetch(request);
            if (response.ok) await cache.put(request, response.clone());
            return response;
        } catch (error) {
            console.error('Local ToolBazaar resource is unavailable offline:', request.url, error);
            return new Response('This ToolBazaar resource is not cached yet.', {
                status: 503,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }
    })());
});
