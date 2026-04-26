// sw.js - Service Worker 推送弹窗文件

const CACHE_NAME = 'push-cache-v1';

// ===== 安装 Service Worker =====
self.addEventListener('install', event => {
  console.log('[SW] 安装完成');
  self.skipWaiting();
});

// ===== 激活 Service Worker =====
self.addEventListener('activate', event => {
  console.log('[SW] 已激活');
  event.waitUntil(clients.claim());
});

// ===== 接收推送消息 =====
self.addEventListener('push', event => {
  console.log('[SW] 收到推送消息');

  let data = {
    title: '新消息',
    body: '你有一条新通知',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/'
  };

  // 解析服务器发来的数据
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ===== 点击通知时跳转页面 =====
self.addEventListener('notificationclick', event => {
  console.log('[SW] 用户点击了通知');
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // 如果已有窗口打开，直接聚焦
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // 否则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
