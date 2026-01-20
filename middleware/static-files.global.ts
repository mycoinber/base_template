export default defineNuxtRouteMiddleware((to) => {
  // Список расширений статических файлов
  const staticExtensions = [
    '.svg',
    '.json',
    '.ico',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.txt',
    '.xml',
    '.pdf',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.otf'
  ];

  // Проверяем, является ли путь статическим файлом
  const path = to.path.toLowerCase();
  const isStaticFile = staticExtensions.some(ext => path.endsWith(ext));

  if (isStaticFile) {
    // Пропускаем middleware для статических файлов
    return;
  }
});
