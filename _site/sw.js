const version = '20210114224335';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/people/2020/10/14/Congratulations-Davide/","/people/2020/07/06/Anuva-PPG-MRL-Fellowship/","/people/2020/05/02/Lab-Members-Win-Awards/","/people/2020/04/24/Rachel-Wins-NDSEG-Fellowship/","/people/2020/03/25/Congratulations-Sean/","/people/2020/01/09/Congratulations-Yulia/","/people/2019/06/11/Best-Wishes-for-Zhenyu/","/people/2019/04/10/Congratulations-to-Davide-and-Anuva/","/people/2019/02/05/Good-Luck-Somesh/","/video/2017/11/29/Center-for-Integrated-Quantum-Materials/","/404/","/About/","/People/","/Publications/","/Research/","/Research/STM-Introduction","/Research/Strongly-Correlated-Electrons","/Research/Thin-Film-Growth-and-Manipulation","/Research/Topological-Materials","/Research/TMDCs","/categories/","/blog/","/","/manifest.json","/assets/search.json","/assets/styles.css","/the_lab/","/redirects.json","/blog/page2/","/blog/page3/","/blog/page4/","/blog/page5/","/blog/page6/","/sitemap.xml","/robots.txt","/feed.xml","/_img/homepage/m_lab_logo_3.png", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
