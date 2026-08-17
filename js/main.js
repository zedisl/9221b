/*
  SCP-9221 — «БЕЛАЯ ЛИЛИЯ»
  Версия с фиксированной геометрией для Google Sites / iframe.
*/

const DOSSIER_URL = "https://sites.google.com/view/scp9221/hub";
const FINAL_DELAY = 3000;

const scene = document.getElementById("scene");
const accessButton = document.getElementById("accessButton");
const accessLabel = document.getElementById("accessLabel");
const chainLayer = document.getElementById("chainLayer");
const punishment = document.getElementById("punishment");
const flash = document.getElementById("flash");
const finalScene = document.getElementById("finalScene");
const dossierButton = document.getElementById("dossierButton");

let activated = false;
const NS = "http://www.w3.org/2000/svg";

function makeSvg(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function createLink(x, y, angle, scale, delay) {
  const g = makeSvg("g", {
    transform: `translate(${x} ${y}) rotate(${angle}) scale(${scale})`,
    opacity: "0"
  });

  const outer = makeSvg("path", {
    class: "chain-link",
    d: "M -44 -19 L -25 -31 L 25 -28 Q 41 -27 48 -13 L 53 1 Q 58 16 46 26 L 19 39 Q 5 45 -10 35 L -43 14 Q -53 6 -50 -6 Q -48 -15 -44 -19 Z"
  });

  const inner = makeSvg("path", {
    class: "chain-inner",
    d: "M -31 -11 L -17 -20 L 21 -18 Q 29 -17 33 -9 L 37 1 Q 40 9 32 15 L 12 25 Q 3 29 -6 22 L -28 8 Q -35 3 -32 -4 Q -32 -8 -31 -11 Z"
  });

  const highlight = makeSvg("path", {
    class: "chain-highlight",
    d: "M -34 -16 L -22 -23 L 19 -21 Q 29 -20 35 -10"
  });

  g.append(outer, inner, highlight);

  g.animate(
    [
      {
        opacity: 0,
        transform: `translate(${x} ${y}) rotate(${angle - 25}deg) scale(.08)`
      },
      {
        opacity: 1,
        transform: `translate(${x} ${y}) rotate(${angle + 10}deg) scale(1.13)`
      },
      {
        opacity: 1,
        transform: `translate(${x} ${y}) rotate(${angle}deg) scale(1)`
      }
    ],
    {
      duration: 690,
      delay,
      easing: "cubic-bezier(.16,1,.3,1)",
      fill: "forwards"
    }
  );

  return g;
}

function bezierPoints(p0, p1, p2, p3, count, scale, phase) {
  const points = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const m = 1 - t;

    const x =
      m*m*m*p0.x +
      3*m*m*t*p1.x +
      3*m*t*t*p2.x +
      t*t*t*p3.x;

    const y =
      m*m*m*p0.y +
      3*m*m*t*p1.y +
      3*m*t*t*p2.y +
      t*t*t*p3.y +
      Math.sin(t * Math.PI * 2 + phase) * 4;

    points.push({
      x,
      y,
      scale: scale + Math.sin(t * Math.PI) * .06
    });
  }

  return points;
}

function addChain(svgRoot, points, startDelay) {
  const group = makeSvg("g");

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[i + 1] || current;

    const angle =
      Math.atan2(next.y - current.y, next.x - current.x) * 180 / Math.PI +
      (i % 2 ? 90 : 0);

    group.appendChild(
      createLink(
        current.x,
        current.y,
        angle,
        current.scale,
        startDelay + i * 34
      )
    );
  }

  svgRoot.appendChild(group);
}

function buildChains() {
  chainLayer.innerHTML = "";

  const rect = scene.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const cx = width / 2;
  const cy = height / 2;

  const svgRoot = makeSvg("svg", {
    class: "chain-svg",
    width,
    height,
    viewBox: `0 0 ${width} ${height}`
  });

  addChain(
    svgRoot,
    bezierPoints(
      {x: -280, y: cy + 110},
      {x: width * .18, y: cy + 210},
      {x: width * .31, y: cy + 70},
      {x: cx - 100, y: cy + 25},
      15, .72, 0
    ),
    0
  );

  addChain(
    svgRoot,
    bezierPoints(
      {x: width + 280, y: cy - 110},
      {x: width * .82, y: cy - 210},
      {x: width * .69, y: cy - 70},
      {x: cx + 100, y: cy - 25},
      15, .72, 1.5
    ),
    55
  );

  addChain(
    svgRoot,
    bezierPoints(
      {x: cx - 110, y: -300},
      {x: cx - 210, y: height * .22},
      {x: cx - 55, y: height * .36},
      {x: cx - 25, y: cy - 112},
      15, .70, 2
    ),
    110
  );

  addChain(
    svgRoot,
    bezierPoints(
      {x: cx + 110, y: height + 300},
      {x: cx + 210, y: height * .78},
      {x: cx + 55, y: height * .64},
      {x: cx + 25, y: cy + 112},
      15, .70, 3.4
    ),
    165
  );

  /* Короткая внутренняя перемычка */
  addChain(
    svgRoot,
    bezierPoints(
      {x: -120, y: cy - 210},
      {x: width * .2, y: cy - 125},
      {x: width * .32, y: cy - 70},
      {x: cx - 56, y: cy - 22},
      9, .62, .5
    ),
    220
  );

  addChain(
    svgRoot,
    bezierPoints(
      {x: width + 120, y: cy - 210},
      {x: width * .8, y: cy - 125},
      {x: width * .68, y: cy - 70},
      {x: cx + 56, y: cy - 22},
      9, .62, 2
    ),
    255
  );

  chainLayer.appendChild(svgRoot);
}

function activate() {
  if (activated) return;
  activated = true;

  accessLabel.textContent = "ДОСТУП ЗАПЕЧАТАН";
  accessButton.classList.add("locked");

  buildChains();

  setTimeout(() => {
    punishment.classList.add("show");
  }, 1050);

  setTimeout(() => {
    flash.classList.remove("fire");
    void flash.offsetWidth;
    flash.classList.add("fire");
  }, 2050);

  setTimeout(() => {
    scene.classList.add("final");
    finalScene.classList.add("show");
    finalScene.setAttribute("aria-hidden", "false");
    dossierButton.focus({preventScroll: true});
  }, FINAL_DELAY);
}

accessButton.addEventListener("click", activate);

dossierButton.addEventListener("click", () => {
  window.top.location.href = DOSSIER_URL;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !activated) {
    activate();
  }
});
