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

// Глобальні змінні для контролю анімації лінії
let animationProgress = 0;
let animationFrameId = null;
let hasTimelineAnimated = false;
let isRoadmapVisible = false; // Прапорець для відстеження видимості

// Draw roadmap timeline
function drawRoadmapTimeline() {
  const section = document.querySelector('.roadmap-section');
  const container = document.querySelector('.roadmap-container');
  const items = document.querySelectorAll('.roadmap-item');
  const timeline = document.querySelector('.roadmap-timeline');
  const path = document.querySelector('.timeline-path');
  const footerLine = document.querySelector('.footer-line');

  if (!section || !container || items.length < 3 || !timeline || !path) return;

  const img1 = items[0].querySelector('.roadmap-image');
  const img2 = items[1].querySelector('.roadmap-image');
  const img3 = items[2].querySelector('.roadmap-image');

  if (!img1 || !img2 || !img3) return;

  const sectionRect = section.getBoundingClientRect();

  const rect1 = img1.getBoundingClientRect();
  const rect2 = img2.getBoundingClientRect();
  const rect3 = img3.getBoundingClientRect();

  const point1 = {
    x: rect1.left + rect1.width / 2 - sectionRect.left,
    y: rect1.top + rect1.height / 2 - sectionRect.top
  };

  const point2 = {
    x: rect2.left + rect2.width / 2 - sectionRect.left,
    y: rect2.top + rect2.height / 2 - sectionRect.top
  };

  const point3 = {
    x: rect3.left + rect3.width / 2 - sectionRect.left,
    y: rect3.top + rect3.height / 2 - sectionRect.top
  };

  const midY1 = (point1.y + point2.y) / 2;
  const midY2 = (point2.y + point3.y) / 2;

  let pathData = `
    M ${point1.x} ${point1.y}
    Q ${point1.x} ${midY1}, ${(point1.x + point2.x) / 2} ${midY1}
    Q ${point2.x} ${midY1}, ${point2.x} ${point2.y}
    Q ${point2.x} ${midY2}, ${(point2.x + point3.x) / 2} ${midY2}
    Q ${point3.x} ${midY2}, ${point3.x} ${point3.y}
  `;

  if (footerLine) {
    const footerRect = footerLine.getBoundingClientRect();
    const footerPoint = {
      x: footerRect.left + footerRect.width / 2 - sectionRect.left,
      y: footerRect.top - 15 - sectionRect.top
    };

    const verticalDist = footerPoint.y - point3.y;
    const midY3 = point3.y + verticalDist * 0.65;

    pathData += `
      Q ${point3.x} ${midY3}, ${(point3.x + footerPoint.x) / 2} ${midY3}
      Q ${footerPoint.x} ${midY3}, ${footerPoint.x} ${footerPoint.y}
    `;
  }

  path.setAttribute('d', pathData.trim());

  let defs = timeline.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    timeline.insertBefore(defs, timeline.firstChild);
  }

  let mask = defs.querySelector('#timeline-mask');
  if (!mask) {
    mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
    mask.setAttribute('id', 'timeline-mask');
    defs.appendChild(mask);

    const maskPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    maskPath.setAttribute('class', 'mask-path');
    maskPath.setAttribute('fill', 'none');
    maskPath.setAttribute('stroke', '#ffffff');
    maskPath.setAttribute('stroke-width', '6');
    maskPath.setAttribute('stroke-linecap', 'round');
    maskPath.setAttribute('stroke-linejoin', 'round');
    mask.appendChild(maskPath);
  }

  const maskPath = mask.querySelector('.mask-path');
  maskPath.setAttribute('d', pathData.trim());
  path.setAttribute('mask', 'url(#timeline-mask)');

  const oldRects = mask.querySelectorAll('rect');
  oldRects.forEach(r => r.remove());

  [rect1, rect2, rect3].forEach(rect => {
    const maskRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    maskRect.setAttribute('x', rect.left - sectionRect.left);
    maskRect.setAttribute('y', rect.top - sectionRect.top);
    maskRect.setAttribute('width', rect.width);
    maskRect.setAttribute('height', rect.height);
    maskRect.setAttribute('fill', '#000000');
    mask.appendChild(maskRect);
  });

  let glowDot = timeline.querySelector('.timeline-glow-dot');
  if (!glowDot) {
    glowDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glowDot.setAttribute('class', 'timeline-glow-dot');
    glowDot.setAttribute('r', '7');
    glowDot.setAttribute('fill', '#a82bff');
    glowDot.setAttribute('style', 'filter: drop-shadow(0 0 5px #a82bff) drop-shadow(0 0 12px #a82bff); opacity: 0;');
    timeline.appendChild(glowDot);
  }

  const totalLength = maskPath.getTotalLength();

  if (hasTimelineAnimated) {
    maskPath.style.strokeDasharray = totalLength;
    maskPath.style.strokeDashoffset = 0;
    glowDot.style.opacity = 0;
    items.forEach(item => item.classList.add('visible'));
    return;
  }

  // Встановлюємо прихований стан, якщо ми ще не бачимо секцію
  maskPath.style.strokeDasharray = totalLength;
  if (!isRoadmapVisible && animationProgress === 0) {
    maskPath.style.strokeDashoffset = totalLength;
  }

  function runIntroAnimation() {
    const speed = totalLength / 160; 
    animationProgress += speed;

    if (animationProgress > totalLength) {
      animationProgress = totalLength;
    }

    maskPath.style.strokeDasharray = totalLength;
    maskPath.style.strokeDashoffset = totalLength - animationProgress;

    if (animationProgress > 0) {
      try {
        const currentPoint = maskPath.getPointAtLength(animationProgress);
        glowDot.setAttribute('cx', currentPoint.x);
        glowDot.setAttribute('cy', currentPoint.y);

        const inRect1 = currentPoint.x >= rect1.left - sectionRect.left && currentPoint.x <= rect1.right - sectionRect.left && currentPoint.y >= rect1.top - sectionRect.top && currentPoint.y <= rect1.bottom - sectionRect.top;
        const inRect2 = currentPoint.x >= rect2.left - sectionRect.left && currentPoint.x <= rect2.right - sectionRect.left && currentPoint.y >= rect2.top - sectionRect.top && currentPoint.y <= rect2.bottom - sectionRect.top;
        const inRect3 = currentPoint.x >= rect3.left - sectionRect.left && currentPoint.x <= rect3.right - sectionRect.left && currentPoint.y >= rect3.top - sectionRect.top && currentPoint.y <= rect3.bottom - sectionRect.top;

        if (animationProgress >= totalLength || inRect1 || inRect2 || inRect3) {
          glowDot.style.opacity = 0;
        } else {
          glowDot.style.opacity = 1;
        }

        if (currentPoint.y >= point1.y - 20) items[0].classList.add('visible');
        if (currentPoint.y >= point2.y - 20) items[1].classList.add('visible');
        if (currentPoint.y >= point3.y - 20) items[2].classList.add('visible');
      } catch (e) {}
    }

    if (animationProgress < totalLength) {
      animationFrameId = requestAnimationFrame(runIntroAnimation);
    } else {
      hasTimelineAnimated = true;
      glowDot.style.opacity = 0;
    }
  }

  // ЗАПУСКАЄМО АНІМАЦІЮ ТІЛЬКИ ЯКЩО СЕКЦІЯ У ПОЛІ ЗОРУ
  if (isRoadmapVisible && !animationFrameId && !hasTimelineAnimated) {
    animationFrameId = requestAnimationFrame(runIntroAnimation);
  }
}

// Нова логіка відстеження: запускає та скидає анімацію при переходах
const roadmapSectionEl = document.querySelector('.roadmap-section');
if (roadmapSectionEl) {
  const roadmapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Оновлюємо статус видимості
      isRoadmapVisible = entry.isIntersecting; 

      if (entry.isIntersecting) {
        // Користувач зайшов на секцію роадмапу — запускаємо анімацію
        drawRoadmapTimeline();
      } else {
        // Користувач залишив секцію — скидаємо стан
        hasTimelineAnimated = false;
        animationProgress = 0;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }

        // Миттєво ховаємо всі картки
        const items = document.querySelectorAll('.roadmap-item');
        items.forEach(item => item.classList.remove('visible'));

        // Повністю ховаємо пунктирну маску лінії
        const maskPath = document.querySelector('.mask-path');
        if (maskPath) {
          try {
            const totalLength = maskPath.getTotalLength();
            maskPath.style.strokeDashoffset = totalLength;
          } catch (e) {}
        }

        // Прибираємо свічення кульки
        const glowDot = document.querySelector('.timeline-glow-dot');
        if (glowDot) {
          glowDot.style.opacity = 0;
        }
      }
    });
  }, {
    threshold: 0.15 
  });

  roadmapObserver.observe(roadmapSectionEl);
}

// Перерахунок координат при зміні розміру екрана
window.addEventListener('resize', () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  drawRoadmapTimeline();
});

// На старті лише обчислюємо координати, але анімація не почнеться, поки не скролнемо
window.addEventListener('load', drawRoadmapTimeline);

// Image modal functionality
const modal = document.getElementById('imageModal');
const modalImage = modal?.querySelector('.modal-image');
const roadmapImages = document.querySelectorAll('.roadmap-image');

if (modal && modalImage) {
  roadmapImages.forEach((img) => {
    img.addEventListener('click', () => {
      modal.style.display = 'flex';
      modalImage.src = img.src;
      modalImage.alt = img.alt;
      document.body.style.overflow = 'hidden';
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
}

// Fetch total downloads from all releases and set latest release link
async function updateDownloadButton() {
  const downloadButton = document.getElementById('downloadButton');
  const downloadCount = document.getElementById('downloadCount');

  try {
    const response = await fetch('https://api.github.com/repos/jenyok3/AbuseAppUpdates/releases');
    if (!response.ok) return;

    const allReleases = await response.json();
    
    // Calculate total downloads across all assets from all releases
    let totalDownloads = 0;
    allReleases.forEach(release => {
      if (release.assets) {
        totalDownloads += release.assets.reduce((sum, asset) => sum + (asset.download_count || 0), 0);
      }
    });

    // Update download button URL using the latest release (first elements in array)
    const latestRelease = allReleases[0];
    if (latestRelease && latestRelease.assets) {
      const setupAsset = latestRelease.assets.find(asset =>
        asset.name.includes('x64-setup.exe') && asset.name.startsWith('AbuseApp')
      );

      if (setupAsset?.browser_download_url && downloadButton) {
        downloadButton.href = setupAsset.browser_download_url;
      }
    }

    // Update download count display
    if (downloadCount) {
      if (totalDownloads >= 1000) {
        downloadCount.textContent = `${(totalDownloads / 1000).toFixed(1)}k`;
      } else {
        downloadCount.textContent = totalDownloads.toString();
      }
    }
  } catch (error) {
    console.error('Failed to fetch release data:', error);
    if (downloadCount) {
      downloadCount.textContent = '—';
    }
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
    footerText: 'Built for fun',
    telegramLink: 'https://t.me/abuse_app'
  },
  en: {
    download: 'Download',
    roadmap1Title: 'Dashboard',
    roadmap1Desc: 'Mass launch, Calendar>Plans list, Recent actions, Account statistics, Task list',
    roadmap2Title: 'Accounts List',
    scrollSnapStop: 'always',
    roadmap2Desc: 'Add hashtag, notes, name, open/close account',
    roadmap3Title: 'Mass Launch',
    roadmap3Desc: 'Add/delete project, open all at once, "Mix" mode, progress bar, etc..',
    footerText: 'Built for fun',
    telegramLink: 'https://t.me/AbuseApp'
  },
  ru: {
    download: 'Загрузить',
    roadmap1Title: 'Панель управления',
    roadmap1Desc: 'Массовый запуск, Календарь>Список планов, Последние действия, Статистика аккаунтов, Список задач',
    roadmap2Title: 'Список аккаунтов',
    roadmap2Desc: 'Добавить хэштег, заметки, название, открыть/закрыть аккаунт',
    roadmap3Title: 'Массовый запуск',
    roadmap3Desc: 'Добавить проект/удалить, открыть все одновременно, режим "Mix", прогресс бар и т.д..',
    footerText: 'Built for fun',
    telegramLink: 'https://t.me/AbuseAppRu'
  }
};

function applyTranslation(lang) {
  const t = translations[lang];
  if (!t) return;

  const downloadBtn = document.querySelector('#downloadButton span');
  if (downloadBtn) downloadBtn.textContent = t.download;

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

  const footerText = document.querySelector('.footer-text');
  if (footerText) footerText.textContent = t.footerText;

  const telegramLink = document.querySelector('.floating-icons a[aria-label="Telegram"]');
  if (telegramLink && t.telegramLink) telegramLink.href = t.telegramLink;
}

// Language switcher
const languageButton = document.getElementById('languageButton');
const languageDropdown = document.getElementById('languageDropdown');
const languageOptions = document.querySelectorAll('.language-option');
const languageCurrent = document.querySelector('.language-current');

if (languageButton && languageDropdown) {
  languageButton.addEventListener('click', (e) => {
    e.stopPropagation();
    languageButton.classList.toggle('active');
    languageDropdown.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    languageButton.classList.remove('active');
    languageDropdown.classList.remove('active');
  });

  languageOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedLang = option.dataset.lang;

      languageCurrent.textContent = selectedLang.toUpperCase();
      languageOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');

      localStorage.setItem('selectedLanguage', selectedLang);
      applyTranslation(selectedLang);

      languageButton.classList.remove('active');
      languageDropdown.classList.remove('active');
    });
  });

  const savedLang = localStorage.getItem('selectedLanguage') || 'en';
  languageCurrent.textContent = savedLang.toUpperCase();
  languageOptions.forEach(opt => {
    if (opt.dataset.lang === savedLang) {
      opt.classList.add('selected');
    }
  });
  applyTranslation(savedLang);
}