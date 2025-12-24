/* ================= Canvas（微信友好） ================= */
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let W, H, DPR;

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1); // ⭐ 限制 DPR
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener("resize", resize);
resize();

/* ================= 参数 ================= */
const CROWN_SCALE = 0.7;
const LAYER_COUNT = 6;              // 📱 手机减少一层
const treeHeight = H * 0.58;
const treeRadius = W * 0.22;
const centerX = W / 2;
const groundY = H * 0.82;

let angle = 0;
let dense = false;                  // 📱 默认稀疏

/* ================= 粒子 ================= */
class Particle {
  constructor(r, y, theta, size, color, type) {
    this.r = r;
    this.y = y;
    this.theta = theta;
    this.size = size;
    this.color = color;
    this.type = type;
  }

  project(rot) {
    const a = this.theta + rot;
    const x3 = Math.cos(a) * this.r;
    const z3 = Math.sin(a) * this.r;
    const scale = 600 / (600 + z3);

    return {
      x: centerX + x3 * scale,
      y: groundY - this.y * scale,
      r: this.size * scale,
      z: z3
    };
  }
}

/* ================= 容器 ================= */
let leaves = [], lights = [], trunk = [];

/* ================= 创建圣诞树 ================= */
function createTree() {
  leaves = [];
  lights = [];
  trunk = [];

  const crownHeight = treeHeight * CROWN_SCALE;

  /* 树冠（分层） */
  for (let layer = 0; layer < LAYER_COUNT; layer++) {
    const lt = layer / (LAYER_COUNT - 1);
    const layerY = lt * crownHeight;
    const layerR = (1 - lt) * treeRadius;
    const count = 220 - layer * 25;   // 📱 数量控制

    for (let i = 0; i < count; i++) {
      leaves.push(new Particle(
        layerR * (0.85 + Math.random() * 0.2),
        layerY + Math.random() * crownHeight / LAYER_COUNT,
        Math.random() * Math.PI * 2,
        Math.random() * 1.3 + 0.6,
        "#2ecc71",
        "leaf"
      ));
    }
  }

  /* 彩灯 */
  const colors = ["#ff6b6b", "#ffd93d", "#4dd2ff"];
  const lightCount = dense ? 80 : 45;

  for (let i = 0; i < lightCount; i++) {
    const t = Math.random() * CROWN_SCALE;
    lights.push(new Particle(
      (1 - t) * treeRadius * 0.9,
      t * treeHeight,
      Math.random() * Math.PI * 2,
      2.5,
      colors[Math.floor(Math.random() * colors.length)],
      "light"
    ));
  }

  /* 树干 */
  const trunkHeight = treeHeight * 0.78;
  const baseRadius = treeRadius * 0.16;

  for (let i = 0; i < 420; i++) {
    const t = Math.random();
    trunk.push(new Particle(
      (1 - t) * baseRadius,
      t * trunkHeight,
      Math.random() * Math.PI * 2,
      Math.random() * 1.4 + 0.7,
      Math.random() < 0.5 ? "#8b5a2b" : "#7a4a24",
      "trunk"
    ));
  }
}

createTree();

/* ================= 星星 ================= */
function drawStar() {
  ctx.save();
  ctx.translate(centerX, groundY - treeHeight * CROWN_SCALE - 26);
  ctx.fillStyle = "#ffe066";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#ffe066";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(0, -12);
    ctx.rotate(Math.PI / 5);
    ctx.lineTo(0, -5);
    ctx.rotate(Math.PI / 5);
  }
  ctx.fill();
  ctx.restore();
}

/* ================= 祝福 ================= */
function drawGreeting() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 28px system-ui";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ffcc66";
  ctx.shadowBlur = 14;
  ctx.fillText("苗老师，圣诞快乐 🎄 Merry Christmas!", centerX, H * 0.16);
  ctx.restore();
}

/* ================= 雪花（轻量） ================= */
let snowflakes = [];

function updateSnow() {
  if (snowflakes.length < 100 && Math.random() < 0.6) {
    snowflakes.push({
      x: Math.random() * W,
      y: -10,
      r: Math.random() * 1.8 + 0.6,
      vy: Math.random() * 0.5 + 0.4,
      sway: Math.random() * Math.PI * 2
    });
  }

  ctx.fillStyle = "#fff";
  snowflakes.forEach(s => {
    s.sway += 0.01;
    s.x += Math.sin(s.sway) * 0.15;
    s.y += s.vy;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  snowflakes = snowflakes.filter(s => s.y < H + 10);
  ctx.globalAlpha = 1;
}

/* ================= 动画 ================= */
function animate() {
  ctx.clearRect(0, 0, W, H);
  angle += 0.0025;   // 📱 慢一点，更稳

  const all = [...trunk, ...leaves, ...lights];
  all.sort((a, b) => a.project(angle).z - b.project(angle).z);

  all.forEach(p => {
    const o = p.project(angle);
    let alpha = 0.6;
    if (p.type === "light") alpha = 0.85;
    if (p.type === "trunk") alpha = o.z > 0 ? 0.9 : 0.65;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  drawStar();
  drawGreeting();
  updateSnow();

  requestAnimationFrame(animate);
}
animate();

/* ================= 触控交互（微信） ================= */
canvas.addEventListener("touchstart", () => {
  dense = !dense;
  createTree();
}, { passive: true });
