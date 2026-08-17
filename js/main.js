/*
  SCP-9221 // WHITE LILY
  Divine Punishment chain system

  Здесь нет внешних PNG-цепей:
  звенья создаются SVG через JavaScript.
*/

const DOSSIER_URL = "https://example.com";
const SEAL_DELAY_MS = 3000;

const scene = document.getElementById("scene");
const accessButton = document.getElementById("accessButton");
const buttonLabel = document.getElementById("buttonLabel");
const dossierButton = document.getElementById("dossierButton");
const chainLayer = document.getElementById("chainLayer");
const divineMessage = document.getElementById("divineMessage");
const sealFlash = document.getElementById("sealFlash");
const statusLine = document.getElementById("statusLine");

let activated = false;

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

function makeLink(x, y, rotation, scale = 1) {
  const g = svgEl("g", {
    class: "chain-link-group",
    transform: `translate(${x} ${y}) rotate(${rotation}) scale(${scale})`
  });

  /*
    Крупное угловатое звено:
    визуально ближе к stylized / Helltaker-like chain,
    а не к фотореалистичной цепи.
  */
  const outer = svgEl("path", {
    class: "chain-link",
    d: "M 8,-20 L 35,-24 Q 46,-25 49,-14 L 56,0 Q 59,11 49,19 L 34,28 Q 27,32 18,27 L -5,13 Q -12,8 -8,0 L 0,-13 Q 3,-18 8,-20 Z"
  });

  const inner = svgEl("path", {
    class: "chain-link-inner",
    d: "M 12,-12 L 32,-15 Q 36,-16 39,-10 L 44,0 Q 46,6 40,10 L 28,17 Q 22,20 16,16 L 3,8 Q -1,5 1,0 L 6,-9 Q 8,-12 12,-12 Z"
  });

  g.appendChild(outer);
  g.appendChild(inner);
  return g;
}

function makeChain(points, options = {}) {
  const svg = svgEl("svg", {
    class: "chain-svg",
    width: options.width || 1000,
    height: options.height || 700,
    viewBox: `0 0 ${options.width || 1000} ${options.height || 700}`
  });

  const group = svgEl("g");
  const links = [];

  points.forEach((point, i) => {
    const next = points[i + 1] || point;
    const dx = next.x - point.x;
    const dy = next.y - point.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    const link = makeLink(point.x, point.y, angle + (i % 2 ? 90 : 0), point.scale || 1);
    group.appendChild(link);
    links.push(link);
  });

  svg.appendChild(group);
  chainLayer.appendChild(svg);

  return { svg, links };
}

function getCenter() {
  const rect = scene.getBoundingClientRect();
  return {
    x: rect.width / 2,
    y: rect.height / 2
  };
}

function buildDivineChains() {
  chainLayer.innerHTML = "";

  const { width, height } = scene.getBoundingClientRect();
  const cx = width / 2;
  const cy = height / 2;

  const chains = [];

  function pointsFromLine(x1, y1, x2, y2, count, amplitude = 0) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const baseX = x1 + (x2 - x1) * t;
      const baseY = y1 + (y2 - y1) * t;

      const nx = -(y2 - y1);
      const ny = (x2 - x1);
      const len = Math.hypot(nx, ny) || 1;

      const wave = Math.sin(t * Math.PI * 2) * amplitude;
      pts.push({
        x: baseX + (nx / len) * wave,
        y: baseY + (ny / len) * wave,
        scale: 0.72 + Math.sin(t * Math.PI) * 0.08
      });
    }
    return pts;
  }

  /*
    Четыре основные цепи — из-за краёв к центру.
    Они слегка изогнуты, чтобы не выглядели как прямые PNG-линии.
  */
  chains.push(
    makeChain(
      pointsFromLine(cx - 560, cy - 20, cx - 100, cy, 15, -30),
      { width, height }
    )
  );

  chains.push(
    makeChain(
      pointsFromLine(cx + 560, cy + 20, cx + 100, cy, 15, 30),
      { width, height }
    )
  );

  chains.push(
    makeChain(
      pointsFromLine(cx, cy - 420, cx, cy - 95, 13, 26),
      { width, height }
    )
  );

  chains.push(
    makeChain(
      pointsFromLine(cx, cy + 420, cx, cy + 95, 13, -26),
      { width, height }
    )
  );

  /*
    Диагональные цепи формируют "клетку".
  */
  chains.push(
    makeChain(
      pointsFromLine(cx - 400, cy - 260, cx - 65, cy - 54, 12, 14),
      { width, height }
    )
  );

  chains.push(
    makeChain(
      pointsFromLine(cx + 400, cy - 260, cx + 65, cy - 54, 12, -14),
      { width, height }
    )
  );

  chains.push(
    makeChain(
      pointsFromLine(cx - 400, cy + 260, cx - 65, cy + 54, 12, -14),
      { width, height }
    )
  );

  chains.push(
    makeChain(
      pointsFromLine(cx + 400, cy + 260, cx + 65, cy + 54, 12, 14),
      { width, height }
    )
  );

  return chains;
}

function animateChains(chains) {
  chains.forEach((chain, chainIndex) => {
    chain.links.forEach((link, i) => {
      const delay = chainIndex * 70 + i * 30;

      link.animate(
        [
          {
            opacity: 0,
            transform: "translate(0 0) scale(.25) rotate(-28deg)"
          },
          {
            opacity: 1,
            transform: "translate(0 0) scale(1.04) rotate(8deg)"
          },
          {
            opacity: .96,
            transform: "translate(0 0) scale(1) rotate(0deg)"
          }
        ],
        {
          duration: 900,
          delay,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "forwards"
        }
      );
    });
  });
}

function activate() {
  if (activated) return;
  activated = true;

  accessButton.classList.add("locked");
  buttonLabel.textContent = "CONNECTION LOCKED";
  statusLine.textContent = "SCP-9221 // DIVINE RESPONSE DETECTED";
  scene.classList.add("sealing");

  const chains = buildDivineChains();
  animateChains(chains);

  setTimeout(() => {
    divineMessage.classList.add("show");
  }, 1450);

  setTimeout(() => {
    sealFlash.classList.remove("fire");
    void sealFlash.offsetWidth;
    sealFlash.classList.add("fire");
  }, 2150);

  setTimeout(() => {
    dossierButton.classList.add("visible");
    statusLine.textContent = "ACCESS GRANTED // DOSSIER AVAILABLE";
  }, SEAL_DELAY_MS);
}

accessButton.addEventListener("click", activate);

dossierButton.addEventListener("click", () => {
  window.top.location.href = DOSSIER_URL;
});

window.addEventListener("resize", () => {
  if (!activated) return;
  chainLayer.innerHTML = "";
  const chains = buildDivineChains();
  animateChains(chains);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !activated) {
    activate();
  }
});

/*
  Мягкая очистка при уходе:
  если вернуться на страницу, интерфейс снова будет готов
  только после полного перезапуска страницы.
*/
