const starsLayers = Array.from(document.querySelectorAll(".stars-layer"));

function generateStars(count, color) {
  const shadows = [];
  for (let i = 0; i < count; i += 1) {
    const x = Math.floor(Math.random() * 4000) - 2000;
    const y = Math.floor(Math.random() * 4000) - 2000;
    shadows.push(`${x}px ${y}px ${color}`);
  }
  return shadows.join(", ");
}

function setupStarsBackground() {
  if (!starsLayers.length) return;

  const layerConfigs = [
    { selector: ".stars-layer-small", count: 1000, color: "rgba(255, 255, 255, 0.92)" },
    { selector: ".stars-layer-medium", count: 400, color: "rgba(255, 255, 255, 0.96)" },
    { selector: ".stars-layer-large", count: 200, color: "rgba(255, 255, 255, 1)" },
  ];

  layerConfigs.forEach(({ selector, count, color }) => {
    const layer = document.querySelector(selector);
    if (!layer) return;
    layer.style.setProperty("--star-shadows", generateStars(count, color));
  });

  const factor = 0.05;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const animate = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    for (const layer of starsLayers) {
      layer.style.setProperty("--stars-offset-x", `${currentX.toFixed(2)}px`);
      layer.style.setProperty("--stars-offset-y", `${currentY.toFixed(2)}px`);
    }

    window.requestAnimationFrame(animate);
  };

  window.addEventListener("mousemove", (event) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    targetX = -(event.clientX - centerX) * factor;
    targetY = -(event.clientY - centerY) * factor;
  });

  window.requestAnimationFrame(animate);
}

setupStarsBackground();

// Topbar scroll effect
const topbar = document.querySelector('.topbar');

if (topbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
  });
}

// Draw roadmap timeline
function drawRoadmapTimeline() {
  const container = document.querySelector('.roadmap-container');
  const items = document.querySelectorAll('.roadmap-item');
  const timeline = document.querySelector('.roadmap-timeline');
  const path = document.querySelector('.timeline-path');
  const footerLine = document.querySelector('.footer-line');

  if (!container || items.length < 3 || !timeline || !path) return;

  const img1 = items[0].querySelector('.roadmap-image');
  const img2 = items[1].querySelector('.roadmap-image');
  const img3 = items[2].querySelector('.roadmap-image');

  if (!img1 || !img2 || !img3) return;

  // Get positions in viewport coordinates
  const rect1 = img1.getBoundingClientRect();
  const rect2 = img2.getBoundingClientRect();
  const rect3 = img3.getBoundingClientRect();

  // Calculate center points for each image
  const point1 = {
    x: rect1.left + rect1.width / 2,
    y: rect1.top + rect1.height / 2
  };

  const point2 = {
    x: rect2.left + rect2.width / 2,
    y: rect2.top + rect2.height / 2
  };

  const point3 = {
    x: rect3.left + rect3.width / 2,
    y: rect3.top + rect3.height / 2
  };

  // Create smooth curved path through all three image centers
  const midY1 = (point1.y + point2.y) / 2;
  const midY2 = (point2.y + point3.y) / 2;

  // Повертаємо стару, ідеально плавну логіку для перших 3 зображень
  let pathData = `
    M ${point1.x} ${point1.y}
    Q ${point1.x} ${midY1}, ${(point1.x + point2.x) / 2} ${midY1}
    Q ${point2.x} ${midY1}, ${point2.x} ${point2.y}
    Q ${point2.x} ${midY2}, ${(point2.x + point3.x) / 2} ${midY2}
    Q ${point3.x} ${midY2}, ${point3.x} ${point3.y}
  `;

  // Плавно доводимо лінію до футера без різких прямих ділянок (без L)
  if (footerLine) {
    const footerRect = footerLine.getBoundingClientRect();
    const footerPoint = {
      x: footerRect.left + footerRect.width / 2,
      y: footerRect.top - 15
    };

    const midY3 = (point3.y + footerPoint.y) / 2;

    // Використовуємо таку ж саму математику кривих (Q), що й вище
    pathData += `
      Q ${point3.x} ${midY3}, ${(point3.x + footerPoint.x) / 2} ${midY3}
      Q ${footerPoint.x} ${midY3}, ${footerPoint.x} ${footerPoint.y}
    `;
  }

  path.setAttribute('d', pathData.trim());
}

// Draw on load, resize, and scroll
if (document.querySelector('.roadmap-section')) {
  window.addEventListener('load', drawRoadmapTimeline);
  window.addEventListener('resize', drawRoadmapTimeline);
  window.addEventListener('scroll', drawRoadmapTimeline);
  setTimeout(drawRoadmapTimeline, 100);
}

// Scroll snap to roadmap section
let isScrolling = false;
let lastScrollY = window.scrollY;
const coverSection = document.querySelector('.cover');
const roadmapSection = document.querySelector('.roadmap-section');

if (coverSection && roadmapSection) {
  // Fix scroll position on resize
  window.addEventListener('resize', () => {
    if (isScrolling) return;

    const currentScrollY = window.scrollY;
    const coverBottom = coverSection.offsetHeight;

    // If we're between sections, snap to the closest one
    if (currentScrollY > coverBottom * 0.1 && currentScrollY < coverBottom * 0.9) {
      if (currentScrollY < coverBottom * 0.5) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        roadmapSection.scrollIntoView({ behavior: 'auto' });
      }
    }
  });

  window.addEventListener('scroll', () => {
    if (isScrolling) return;

    const currentScrollY = window.scrollY;
    const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
    const coverBottom = coverSection.offsetHeight;
    const roadmapTop = roadmapSection.offsetTop;

    // Scrolling down - if past 5% of cover, snap to roadmap
    if (scrollDirection === 'down' && currentScrollY > coverBottom * 0.05 && currentScrollY < coverBottom * 0.95) {
      isScrolling = true;
      roadmapSection.scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => {
        isScrolling = false;
        lastScrollY = window.scrollY;
      }, 1000);
    }
    // Scrolling up - if in first 50% of roadmap, snap to top
    else if (scrollDirection === 'up' && currentScrollY > coverBottom * 0.05 && currentScrollY < roadmapTop + (window.innerHeight * 0.5)) {
      isScrolling = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        isScrolling = false;
        lastScrollY = window.scrollY;
      }, 1000);
    } else {
      lastScrollY = currentScrollY;
    }
  });
}

// Image modal functionality
const modal = document.getElementById('imageModal');
const modalImage = modal?.querySelector('.modal-image');
const roadmapImages = document.querySelectorAll('.roadmap-image');

if (modal && modalImage) {
  // Open modal when clicking on roadmap images
  roadmapImages.forEach((img) => {
    img.addEventListener('click', () => {
      modal.style.display = 'flex';
      modalImage.src = img.src;
      modalImage.alt = img.alt;
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
}

// Fetch latest release from GitHub
async function updateDownloadButton() {
  const downloadButton = document.getElementById('downloadButton');
  if (!downloadButton) return;

  try {
    const response = await fetch('https://api.github.com/repos/jenyok3/AbuseAppUpdates/releases/latest');
    if (!response.ok) return;

    const data = await response.json();
    const setupAsset = data.assets?.find(asset =>
      asset.name.includes('x64-setup.exe') && asset.name.startsWith('AbuseApp')
    );

    if (setupAsset?.browser_download_url) {
      downloadButton.href = setupAsset.browser_download_url;
    }
  } catch (error) {
    console.error('Failed to fetch latest release:', error);
  }
}

updateDownloadButton();

// Translations
const translations = {
  ua: {
    download: 'Завантажити',
    roadmap1Title: 'Панель керування',
    roadmap1Desc: 'Масовий запуск, Календар>Список планів, Останні дії, Статистика акаунтів, Список завдань',
    roadmap2Title: 'Список акаунтів',
    roadmap2Desc: 'Додати хештег, нотатки, назву, відкрити/закрити акаунт',
    roadmap3Title: 'Масовий запуск',
    roadmap3Desc: 'Додати проєкт/видалити, відкрити одночасно всі, режим "Mix", прогрес бар і т.д..',
    footerText: 'Built for fun'
  },
  en: {
    download: 'Download',
    roadmap1Title: 'Dashboard',
    roadmap1Desc: 'Mass launch, Calendar>Plans list, Recent actions, Account statistics, Task list',
    roadmap2Title: 'Accounts List',
    roadmap2Desc: 'Add hashtag, notes, name, open/close account',
    roadmap3Title: 'Mass Launch',
    roadmap3Desc: 'Add/delete project, open all at once, "Mix" mode, progress bar, etc..',
    footerText: 'Built for fun'
  },
  ru: {
    download: 'Загрузить',
    roadmap1Title: 'Панель управления',
    roadmap1Desc: 'Массовый запуск, Календарь>Список планов, Последние действия, Статистика аккаунтов, Список задач',
    roadmap2Title: 'Список аккаунтов',
    roadmap2Desc: 'Добавить хэштег, заметки, название, открыть/закрыть аккаунт',
    roadmap3Title: 'Массовый запуск',
    roadmap3Desc: 'Добавить проект/удалить, открыть все одновременно, режим "Mix", прогресс бар и т.д..',
    footerText: 'Built for fun'
  }
};

function applyTranslation(lang) {
  const t = translations[lang];
  if (!t) return;

  // Download button
  const downloadBtn = document.querySelector('#downloadButton span');
  if (downloadBtn) downloadBtn.textContent = t.download;

  // Roadmap items
  const roadmapItems = document.querySelectorAll('.roadmap-item');
  if (roadmapItems[0]) {
    const title1 = roadmapItems[0].querySelector('h2');
    const desc1 = roadmapItems[0].querySelector('p');
    if (title1) title1.textContent = t.roadmap1Title;
    if (desc1) desc1.textContent = t.roadmap1Desc;
  }
  if (roadmapItems[1]) {
    const title2 = roadmapItems[1].querySelector('h2');
    const desc2 = roadmapItems[1].querySelector('p');
    if (title2) title2.textContent = t.roadmap2Title;
    if (desc2) desc2.textContent = t.roadmap2Desc;
  }
  if (roadmapItems[2]) {
    const title3 = roadmapItems[2].querySelector('h2');
    const desc3 = roadmapItems[2].querySelector('p');
    if (title3) title3.textContent = t.roadmap3Title;
    if (desc3) desc3.textContent = t.roadmap3Desc;
  }

  // Footer
  const footerText = document.querySelector('.footer-text');
  if (footerText) footerText.textContent = t.footerText;
}

// Language switcher
const languageButton = document.getElementById('languageButton');
const languageDropdown = document.getElementById('languageDropdown');
const languageOptions = document.querySelectorAll('.language-option');
const languageCurrent = document.querySelector('.language-current');

if (languageButton && languageDropdown) {
  // Toggle dropdown
  languageButton.addEventListener('click', (e) => {
    e.stopPropagation();
    languageButton.classList.toggle('active');
    languageDropdown.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    languageButton.classList.remove('active');
    languageDropdown.classList.remove('active');
  });

  // Handle language selection
  languageOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedLang = option.dataset.lang;

      // Update UI
      languageCurrent.textContent = selectedLang.toUpperCase();
      languageOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');

      // Store selection
      localStorage.setItem('selectedLanguage', selectedLang);

      // Apply translation
      applyTranslation(selectedLang);

      // Close dropdown
      languageButton.classList.remove('active');
      languageDropdown.classList.remove('active');
    });
  });

  // Load saved language
  const savedLang = localStorage.getItem('selectedLanguage') || 'en';
  languageCurrent.textContent = savedLang.toUpperCase();
  languageOptions.forEach(opt => {
    if (opt.dataset.lang === savedLang) {
      opt.classList.add('selected');
    }
  });
  applyTranslation(savedLang);
}