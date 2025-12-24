/* ================= Canvas ================= */
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ================= 树参数 ================= */
const treeHeight = H * 0.6;
const treeRadius = W * 0.22;
const centerX = W / 2;
const groundY = H * 0.82;

let angle = 0;
let dense = true;

/* ================= 粒子 ================= */
class Particle {
  constructor(r, y, theta, size, color) {
    this.r = r;
    this.y = y;
    this.theta = theta;
    this.size = size;
    this.color = color;
  }

  project(rot) {
    const a = this.theta + rot;
    const x3 = Math.cos(a) * this.r;
    const z3 = Math.sin(a) * this.r;
    const scale = 700 / (700 + z3);

    return {
      x: centerX + x3 * scale,
      y: groundY - this.y * scale,
      r: this.size * scale,
      z: z3
    };
  }
}

/* ================= 粒子容器 ================= */
let leaves = [];
let lights = [];
let trunk = [];

/* ================= 生成圣诞树 ================= */
function createTree() {
  leaves = [];
  lights = [];
  trunk = [];

  /* ===== 树叶（树冠） ===== */
  for (let i = 0; i < 2400; i++) {
    const t = Math.random();                 // 0（顶）→ 1（底）
    leaves.push(new Particle(
      (1 - t) * treeRadius,
      t * treeHeight,
      Math.random() * Math.PI * 2,
      Math.random() * 1.4 + 0.6,
      "#2ecc71"
    ));
  }

  /* ===== 彩灯 ===== */
  const colors = ["#ff4d4d", "#ffd93d", "#4dd2ff"];
  const count = dense ? 120 : 60;
  for (let i = 0; i < count; i++) {
    const t = Math.random();
    lights.push(new Particle(
      (1 - t) * treeRadius,
      t * treeHeight,
      Math.random() * Math.PI * 2,
      2.8,
      colors[Math.floor(Math.random() * colors.length)]
    ));
  }

  /* ===== 树干（真实结构） ===== */
  const trunkHeight = treeHeight * 0.78;   // ⭐ 延伸到树冠中上部
  const baseRadius = treeRadius * 0.20;

  for (let i = 0; i < 520; i++) {
    const t = Math.random();               // 0 底部 → 1 顶部
    const y = t * trunkHeight;

    // 越往上越细
    const r = (1 - t) * baseRadius * 0.6;

    // 树干并非完全圆柱，略有起伏
    const theta = Math.random() * Math.PI * 2;
    const size = Math.random() * 1.6 + 0.8;

    // 木质颜色轻微变化
    const woodColor = Math.random() < 0.5 ? "#8b5a2b" : "#7a4a24";

    trunk.push(new Particle(
      r,
      y,
      theta,
      size,
      woodColor
    ));
  }
}

createTree();

/* ================= 星星 ================= */
function drawStar() {
  ctx.save();
  ctx.translate(centerX, groundY - treeHeight - 30);
  ctx.fillStyle = "#ffe066";
  ctx.shadowColor = "#ffe066";
  ctx.shadowBlur = 25;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(0, -14);
    ctx.rotate(Math.PI / 5);
    ctx.lineTo(0, -6);
    ctx.rotate(Math.PI / 5);
  }
  ctx.fill();
  ctx.restore();
}

/* ================= 中央祝福 ================= */
function drawGreeting() {
  const t = performance.now() * 0.002;
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 36px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ffcc66";
  ctx.shadowBlur = 20 + Math.sin(t) * 6;
  ctx.fillText("苗老师，Merry Christmas!🎄", centerX, H * 0.18);
  ctx.restore();
}

/* ================= 弹幕 ================= */
const messages = [
  "研二也要记得好好睡觉 ☕",
  "实验会出结果的，别急",
  "数据终会收敛，心也会",
  "论文慢慢写，也是在前进",
  "今晚不写代码也没关系",
  "你已经很努力了",
  "祝你顺利毕业 🎓",
  "圣诞夜，允许自己放松一下"
];

let barrages = [];

function spawnBarrage() {
  barrages.push({
    text: messages[Math.floor(Math.random() * messages.length)],
    x: W + 50,
    y: H * (0.25 + Math.random() * 0.45),
    speed: 0.6 + Math.random() * 0.6,
    alpha: 0.6 + Math.random() * 0.4
  });
}

function drawBarrages() {
  ctx.save();
  ctx.font = "16px 'Segoe UI', sans-serif";
  barrages.forEach(b => {
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(b.text, b.x, b.y);
    b.x -= b.speed;
  });
  ctx.restore();
  barrages = barrages.filter(b => b.x > -300);
}

/* ================= 雪花 ================= */
let snowflakes = [];

function spawnSnowflake() {
  snowflakes.push({
    x: Math.random() * W,
    y: -10,
    r: Math.random() * 2 + 0.6,
    vy: Math.random() * 0.6 + 0.4,
    vx: Math.random() * 0.4 - 0.2,
    sway: Math.random() * Math.PI * 2
  });
}

function updateSnow() {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  snowflakes.forEach(s => {
    s.sway += 0.01;
    s.x += Math.sin(s.sway) * 0.2 + s.vx;
    s.y += s.vy;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  snowflakes = snowflakes.filter(s => s.y < H + 20);
  if (snowflakes.length < 160 && Math.random() < 0.7) spawnSnowflake();
}

/* ================= 动画 ================= */
function animate() {
  ctx.clearRect(0, 0, W, H);
  angle += 0.003;

  const all = [...trunk, ...leaves, ...lights];
  all.sort((a, b) => a.project(angle).z - b.project(angle).z);

  all.forEach(p => {
    const o = p.project(angle);
    ctx.beginPath();
    ctx.globalAlpha =
      p.color.includes("#8b") || p.color.includes("#7a") ? 0.95 :
      p.color !== "#2ecc71" ? 0.85 + Math.sin(angle * 6) * 0.15 :
      0.6;

    ctx.fillStyle = p.color;
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  drawStar();
  drawGreeting();

  if (Math.random() < 0.015) spawnBarrage();
  drawBarrages();

  updateSnow();
  requestAnimationFrame(animate);
}

animate();

/* ================= 交互 ================= */
canvas.onclick = () => {
  dense = !dense;
  createTree();
};
