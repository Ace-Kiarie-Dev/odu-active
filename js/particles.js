/* ============================================================
   ODU ACTIVE — PARTICLES.JS
   Fluid silver particle flow field + cursor repel + orange dot
   Built by Nesture
   ============================================================ */

'use strict';

// ── PARTICLE CANVAS ───────────────────────────────────────
const canvas = document.getElementById('particleCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let mx = -9999, my = -9999;

  const PARTICLE_COUNT = 400;
  const REPEL_RADIUS   = 160;
  const REPEL_FORCE    = 6;
  const CONNECT_DIST   = 110;
  const FLOW_SPEED     = 0.55;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    particles.forEach(p => p.init(true));
  }, { passive: true });

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  // Flow field using trig for smooth organic motion
  function flowAngle(x, y, t) {
    return (
      Math.sin(x * 0.008 + t * 0.4) * Math.PI +
      Math.cos(y * 0.007 + t * 0.3) * Math.PI +
      Math.sin((x + y) * 0.005 + t * 0.2) * Math.PI * 0.5
    );
  }

  class Particle {
    constructor() { this.init(true); }

    init(scatter = false) {
      this.x         = scatter ? Math.random() * W : (Math.random() < 0.5 ? -8 : W + 8);
      this.y         = Math.random() * H;
      this.vx        = 0;
      this.vy        = 0;
      this.size      = 0.8 + Math.random() * 1.8;
      this.baseAlpha = 0.12 + Math.random() * 0.28;
      this.alpha     = this.baseAlpha;
      this.t         = Math.random() * 100;
    }

    update(globalT) {
      const t     = globalT + this.t;
      const angle = flowAngle(this.x, this.y, t);
      const flowVx = Math.cos(angle) * FLOW_SPEED;
      const flowVy = Math.sin(angle) * FLOW_SPEED;

      // Cursor repel
      const dx   = this.x - mx;
      const dy   = this.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let repX = 0, repY = 0;

      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
        repX = (dx / dist) * force;
        repY = (dy / dist) * force;
        this.alpha = Math.min(0.9, this.baseAlpha + (1 - dist / REPEL_RADIUS) * 0.45);
      } else {
        this.alpha += (this.baseAlpha - this.alpha) * 0.04;
      }

      this.vx = this.vx * 0.82 + (flowVx + repX) * 0.18;
      this.vy = this.vy * 0.82 + (flowVy + repY) * 0.18;
      this.x += this.vx;
      this.y += this.vy;

      // Wrap edges
      if (this.x < -12) this.x = W + 12;
      if (this.x > W + 12) this.x = -12;
      if (this.y < -12) this.y = H + 12;
      if (this.y > H + 12) this.y = -12;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190,196,204,${this.alpha})`;
      ctx.fill();
    }
  }

  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CONNECT_DIST * CONNECT_DIST) {
          const alpha = (1 - Math.sqrt(d2) / CONNECT_DIST) * 0.07;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(180,186,194,${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  let globalT = 0;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    globalT += 0.012;
    drawConnections();
    particles.forEach(p => { p.update(globalT); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
}

// ── ORANGE DOT ────────────────────────────────────────────
const dot = document.getElementById('dot');
if (dot) {
  let dotActive = false;
  let hideTimer = null;

  function getRandomPos() {
    const margin = 40;
    const safeX  = window.innerWidth * 0.25;
    const safeW  = window.innerWidth * 0.5;
    let x;
    if (Math.random() < 0.5) {
      x = margin + Math.random() * (safeX - margin * 2);
    } else {
      x = safeX + safeW + margin + Math.random() * (safeX - margin * 2);
    }
    const y = window.innerHeight * 0.15 + Math.random() * (window.innerHeight * 0.7);
    return { x, y };
  }

  function showDot() {
    if (dotActive) return;
    dotActive = true;
    const { x, y } = getRandomPos();
    dot.style.left  = x + 'px';
    dot.style.top   = y + 'px';
    dot.className   = 'dot visible';
    hideTimer = setTimeout(dismissDot, 3500);
  }

  function dismissDot() {
    clearTimeout(hideTimer);
    dot.className = 'dot hiding';
    dot.addEventListener('animationend', onGone, { once: true });
  }

  function onGone() {
    dotActive     = false;
    dot.className = 'dot';
    setTimeout(showDot, 3000 + Math.random() * 4000);
  }

  function spawnEmbers(x, y) {
    const colors = ['#E8440A', '#ff5a1f', '#ffaa44', '#ffffff', '#ff7733'];
    for (let i = 0; i < 30; i++) {
      const el    = document.createElement('div');
      el.classList.add('ember');
      const angle = (Math.PI * 2 / 30) * i + (Math.random() - 0.5) * 0.5;
      const dist  = 50 + Math.random() * 110;
      const size  = 4 + Math.random() * 6;
      const dur   = 0.45 + Math.random() * 0.5;
      el.style.cssText = `
        left:${x - size/2}px; top:${y - size/2}px;
        width:${size}px; height:${size}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        --tx:${Math.cos(angle) * dist}px;
        --ty:${Math.sin(angle) * dist - Math.random() * 30}px;
        --dur:${dur}s;
        box-shadow:0 0 ${size}px #E8440A;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), dur * 1000 + 100);
    }
  }

  dot.addEventListener('click', () => {
    if (!dotActive) return;
    clearTimeout(hideTimer);
    const rect = dot.getBoundingClientRect();
    spawnEmbers(rect.left + rect.width / 2, rect.top + rect.height / 2);
    dot.className = 'dot hit';
    dotActive     = false;
    dot.addEventListener('animationend', () => {
      dot.className = 'dot';
      setTimeout(showDot, 3000 + Math.random() * 4000);
    }, { once: true });
  });

  setTimeout(showDot, 3000);
}
