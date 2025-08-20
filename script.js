// --- Yıldızlar ve mouse etkileşimi ---
const canvas = document.getElementById('stars-bg');
const ctx = canvas.getContext('2d');
let stars = [];
const STAR_COUNT = 300;
const STAR_RADIUS = 1.2;
const STAR_CONNECT_DIST = 120;
let mouse = { x: -1000, y: -1000 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function randomStar() {
  // Z ekseniyle yıldızlara derinlik veriyoruz, renkli yıldızlar için hue ekle
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    z: Math.random() * canvas.width,
    speed: 0.8 + Math.random() * 1.2,
    hue: Math.random() < 0.7 ? 0 : Math.floor(Math.random() * 360) // %30 renkli yıldız
  };
}

function createStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(randomStar());
  }
}
createStars();

canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
canvas.addEventListener('mouseleave', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw stars
  ctx.save();
  ctx.fillStyle = '#fff';
  for (const s of stars) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, STAR_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Draw lines if mouse is near a star
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const distToMouse = Math.hypot(s.x - mouse.x, s.y - mouse.y);
    if (distToMouse < 60) {
      for (let j = 0; j < stars.length; j++) {
        if (i === j) continue;
        const s2 = stars[j];
        const dist = Math.hypot(s.x - s2.x, s.y - s2.y);
        if (dist < STAR_CONNECT_DIST) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,255,0.18)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s2.x, s2.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }
}

function updateStars() {
  for (const s of stars) {
    s.z -= s.speed;
    if (s.z <= 0) {
      // Yıldız ekranın önünden çıkınca yeniden başlat
      s.x = Math.random() * canvas.width;
      s.y = Math.random() * canvas.height;
      s.z = canvas.width;
      s.speed = 0.8 + Math.random() * 1.2;
    }
    // Perspektif projeksiyon
    const k = canvas.width / s.z;
    s.sx = (s.x - canvas.width / 2) * k + canvas.width / 2;
    s.sy = (s.y - canvas.height / 2) * k + canvas.height / 2;
  }
}

// --- Meteor Efekti ---
const METEOR_COUNT = 6;
let meteors = [];
function randomMeteor() {
  // Meteorlar ekranın üstünden veya solundan başlar, sağ alta doğru kayar
  const fromTop = Math.random() < 0.5;
  const x = fromTop ? Math.random() * canvas.width : -60;
  const y = fromTop ? -60 : Math.random() * canvas.height;
  const angle = Math.PI / 3 + (Math.random() - 0.5) * 0.3; // 60 derece civarı
  const speed = 2.5 + Math.random() * 2.5; // DAHA YAVAŞ: 2.5 - 5 arası
  const len = 120 + Math.random() * 60;
  return {
    x, y, angle, speed, len,
    alpha: 0.7 + Math.random() * 0.3,
    hasWhooshed: false
  };
}
function createMeteors() {
  meteors = [];
  for (let i = 0; i < METEOR_COUNT; i++) {
    meteors.push(randomMeteor());
  }
}
createMeteors();

function updateMeteors() {
  for (const m of meteors) {
    m.x += Math.cos(m.angle) * m.speed;
    m.y += Math.sin(m.angle) * m.speed;
    if (!m.hasWhooshed && (m.x > canvas.width * 0.7 || m.y > canvas.height * 0.7)) {
      // Ekranın ortasını geçince bir kez whoosh çal
      // whoosh.currentTime = 0; // Removed
      // whoosh.volume = 0.18 + Math.random() * 0.08; // Removed
      // whoosh.play(); // Removed
      m.hasWhooshed = true;
    }
    if (m.x > canvas.width + 100 || m.y > canvas.height + 100) {
      // Yeniden başlat
      Object.assign(m, randomMeteor());
    }
  }
}

function drawMeteors() {
  for (const m of meteors) {
    // Kuyruk için degrade ve incelen çizgi
    const tailLen = m.len;
    const tailX = m.x - Math.cos(m.angle) * tailLen;
    const tailY = m.y - Math.sin(m.angle) * tailLen;
    const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.3, 'rgba(173,216,255,0.7)');
    grad.addColorStop(1, 'rgba(0,0,32,0)');
    ctx.save();
    ctx.globalAlpha = m.alpha;
    ctx.strokeStyle = grad;
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 16;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
    ctx.restore();
    // Kuyruğun ortasına doğru inceltme efekti
    ctx.save();
    ctx.globalAlpha = m.alpha * 0.5;
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - Math.cos(m.angle) * (tailLen * 0.7), m.y - Math.sin(m.angle) * (tailLen * 0.7));
    ctx.stroke();
    ctx.restore();
    // Baş kısmında parlak bir daire
    ctx.save();
    ctx.globalAlpha = m.alpha;
    const radgrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 7);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.95)');
    radgrad.addColorStop(0.5, 'rgba(173,216,255,0.5)');
    radgrad.addColorStop(1, 'rgba(0,0,32,0)');
    ctx.beginPath();
    ctx.arc(m.x, m.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = radgrad;
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  }
}

// --- Gezegen ve Nebula Efekti ---
// drawPlanetAndNebula fonksiyonu ve çağrısı kaldırıldı
function drawMovingStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  for (const s of stars) {
    // Renkli yıldız efekti: bazıları beyaz, bazıları renkli
    const r = STAR_RADIUS * (canvas.width / s.z) * (1.2 + Math.random() * 0.5);
    const alpha = 0.7 + Math.random() * 0.3;
    let grad;
    if (s.hue && s.hue !== 0) {
      grad = ctx.createRadialGradient(s.sx, s.sy, 0, s.sx, s.sy, r);
      grad.addColorStop(0, `hsla(${s.hue},100%,85%,${alpha})`);
      grad.addColorStop(0.3, `hsla(${s.hue},100%,70%,${alpha * 0.7})`);
      grad.addColorStop(0.7, `hsla(${s.hue},100%,60%,0.18)`);
      grad.addColorStop(1, 'rgba(0,0,32,0)');
    } else {
      grad = ctx.createRadialGradient(s.sx, s.sy, 0, s.sx, s.sy, r);
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(0.25, `rgba(255,255,255,${alpha * 0.7})`);
      grad.addColorStop(0.7, 'rgba(180,200,255,0.18)');
      grad.addColorStop(1, 'rgba(0,0,32,0)');
    }
    ctx.beginPath();
    ctx.arc(s.sx, s.sy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = s.hue && s.hue !== 0 ? `hsl(${s.hue},100%,85%)` : '#fff';
    ctx.shadowBlur = 8;
    ctx.fill();
  }
  ctx.restore();
  drawMeteors(); // Meteorları yıldızlardan sonra çiz
  // Draw lines if mouse is near a star
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const distToMouse = Math.hypot(s.sx - mouse.x, s.sy - mouse.y);
    if (distToMouse < 60) {
      for (let j = 0; j < stars.length; j++) {
        if (i === j) continue;
        const s2 = stars[j];
        const dist = Math.hypot(s.sx - s2.sx, s.sy - s2.sy);
        if (dist < STAR_CONNECT_DIST) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,255,0.18)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(s.sx, s.sy);
          ctx.lineTo(s2.sx, s2.sy);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }
}

function animateStars() {
  updateStars();
  updateMeteors();
  drawMovingStars();
  requestAnimationFrame(animateStars);
}
animateStars();

// --- Ortada dönen RGB 3D Kare ve üstünde yazı ---
const textCanvas = document.getElementById('cube-canvas');
const textCtx = textCanvas.getContext('2d');
const displayText = 'NOWA & KİİWAS & ORİONSS';

function drawStaticText() {
  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  const cx = textCanvas.width / 2;
  const cy = textCanvas.height / 2;
  textCtx.save();
  textCtx.font = `bold 48px 'SF Pro Display', 'San Francisco', 'system-ui', Arial, sans-serif`;
  textCtx.textAlign = 'center';
  textCtx.textBaseline = 'middle';
  // Uzay temalı renkli glow katmanları
  const glows = [
    { color: '#6cf', blur: 48 }, // mavi
    { color: '#fff', blur: 24 }, // beyaz
    { color: '#a0f', blur: 32 }, // mor
    { color: '#0ff', blur: 16 }, // camgöbeği
    { color: '#fff', blur: 8 }   // hafif beyaz
  ];
  for (const glow of glows) {
    textCtx.shadowColor = glow.color;
    textCtx.shadowBlur = glow.blur;
    textCtx.globalAlpha = 1;
    textCtx.fillStyle = '#fff';
    textCtx.fillText(displayText, cx, cy);
  }
  // Ana metin
  textCtx.shadowColor = '#fff';
  textCtx.shadowBlur = 0;
  textCtx.globalAlpha = 1;
  textCtx.fillStyle = '#fff';
  textCtx.fillText(displayText, cx, cy);
  textCtx.restore();
}
drawStaticText();

// (ambience ve whoosh ile ilgili kodlar kaldırıldı)
