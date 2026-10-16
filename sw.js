const C = "mf-62883c49", F = ["./", "index.html", "manifest.webmanifest"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(F)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(K => Promise.all(K.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // الصفحة: من الشبكة أولاً (فيصل كل تحديث فوراً عند وجود اتصال)، ومن النسخة المحفوظة دون اتصال
  // وإن كانت الإشارة ضعيفة في الميدان: بعد 3 ثوانٍ تُعرض النسخة المحفوظة دون انتظار
  if (e.request.mode === "navigate") {
    const net = fetch(e.request, {cache: "no-store"}).then(n => { if (n.ok) { const cp = n.clone(); caches.open(C).then(c => c.put("index.html", cp)); } return n; });
    e.respondWith(Promise.race([net, new Promise(r => setTimeout(r, 3000)).then(() => caches.match("index.html")).then(c => c || net)]).then(r => r || caches.match("index.html")).catch(() => caches.match("index.html")));
    return; }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(n => { const cp = n.clone(); caches.open(C).then(c => c.put(e.request, cp)); return n; })).catch(() => caches.match("index.html")));
});
