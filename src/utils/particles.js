export function initParticles(canvasId, theme = 'light') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');

  const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
  resize();

  const color = theme === 'dark' ? 'rgba(255,255,255,' : 'rgba(200,39,45,';

  let particles = [];
  let raf;
  const mouse = { x: null, y: null };

  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };
  const onOut = () => { mouse.x = null; mouse.y = null; };
  canvas.addEventListener('mousemove', onMove);
  window.addEventListener('mouseout', onOut);

  class P {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.r  = Math.random() * 2.2 + 0.8;
      this.dx = (Math.random() - 0.5) * 0.45;
      this.dy = (Math.random() - 0.5) * 0.45;
      this.a  = Math.random() * 0.5 + 0.2;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = color + this.a + ')';
      ctx.fill();
    }
    update() {
      if (this.x < 0 || this.x > canvas.width)  this.dx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.dy *= -1;
      if (mouse.x !== null) {
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 90) { this.x -= dx / 18; this.y -= dy / 18; }
      }
      this.x += this.dx; this.y += this.dy;
      this.draw();
    }
  }

  const build = () => {
    const n = Math.floor((canvas.width * canvas.height) / 8000);
    particles = Array.from({ length: Math.min(n, 120) }, () => new P());
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // connect nearby
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = theme === 'dark' ? (1 - d/110)*0.18 : (1 - d/110)*0.12;
          ctx.strokeStyle = color + alpha + ')';
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
      particles[i].update();
    }
    raf = requestAnimationFrame(draw);
  };

  const onResize = () => { resize(); build(); };
  window.addEventListener('resize', onResize);
  build();
  draw();

  return () => {
    cancelAnimationFrame(raf);
    canvas.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseout', onOut);
    window.removeEventListener('resize', onResize);
  };
}
