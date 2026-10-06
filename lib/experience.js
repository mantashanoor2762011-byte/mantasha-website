// All the 3D + scroll animation logic. Runs only in the browser.
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import Lenis from "lenis";

export function startExperience() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => window.innerWidth <= 820;
  const R = Math.random;
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---- bookkeeping so everything can be removed again ----
  const listeners = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    listeners.push(() => target.removeEventListener(type, fn, opts));
  };
  const timers = [];
  let stopped = false;
  let rafMain = 0;
  let rafUi = 0;
  let rafLenis = 0;

  document.body.classList.add("locked");

  // ---- DOM ----
  const chapters = [...document.querySelectorAll(".chapter")];
  const N = chapters.length;
  const says = [...document.querySelectorAll(".says")];
  const navBtns = [...document.querySelectorAll("#chapNav button")];
  const heroInner = document.querySelector(".hero-inner");
  const railFill = document.getElementById("railFill");
  const chNo = document.getElementById("chNo");
  const chName = document.getElementById("chName");
  const h1 = document.querySelector(".hero h1");

  let lenis = null;
  function go(i) {
    i = Math.max(0, Math.min(N - 1, i));
    const el = i === 0 ? chapters[0] : chapters[i].querySelector(".details");
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.8 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
  document.querySelectorAll("[data-go]").forEach((a) =>
    on(a, "click", (e) => {
      e.preventDefault();
      go(Number(a.dataset.go));
    })
  );

  // ---- renderer ----
  const canvas = document.getElementById("gl");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  const PR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(PR);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  // ---- particle shapes ----
  const COUNT = mobile() ? 8000 : 16000;
  function shape(fn) {
    const a = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const p = fn(i);
      a[i * 3] = p[0];
      a[i * 3 + 1] = p[1];
      a[i * 3 + 2] = p[2];
    }
    return a;
  }
  // 0 Intro: sphere
  const S0 = shape((i) => {
    const k = i + 0.5;
    const phi = Math.acos(1 - (2 * k) / COUNT);
    const th = Math.PI * (1 + Math.sqrt(5)) * k;
    const r = 2.3 * (0.82 + 0.18 * Math.pow(R(), 0.5));
    return [Math.cos(th) * Math.sin(phi) * r, Math.sin(th) * Math.sin(phi) * r, Math.cos(phi) * r];
  });

  // 1..4: icons drawn on a canvas, then sampled into particles
  function fromCanvas(draw, width) {
    const W = 400, H = 300;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const c = cv.getContext("2d");
    c.fillStyle = "#fff";
    c.strokeStyle = "#fff";
    c.lineCap = "round";
    c.lineJoin = "round";
    draw(c, W, H);
    const d = c.getImageData(0, 0, W, H).data;
    const px = [];
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 128) px.push(x, y);
    const n = px.length / 2;
    if (!n) return S0.slice();
    const sc = width / W;
    return shape(() => {
      const k = ((R() * n) | 0) * 2;
      const x = (px[k] - W / 2 + R() * 2) * sc;
      const y = -(px[k + 1] - H / 2 + R() * 2) * sc;
      return [x, y, (R() - 0.5) * 0.35 - x * x * 0.04];
    });
  }
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(S0.slice(), 3));
  for (let i = 0; i < 5; i++) geo.setAttribute("p" + i, new THREE.BufferAttribute(S0.slice(), 3));
  const rnd = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) rnd[i] = R();
  geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));

  function buildIcons() {
    if (stopped) return;
    const icons = [
      // About: person
      fromCanvas((c, W) => {
        c.beginPath(); c.arc(W / 2, 95, 55, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(W / 2, 265, 115, 95, 0, Math.PI, 0); c.fill();
      }, 4.0),
      // Projects: browser window
      fromCanvas((c) => {
        c.lineWidth = 12; roundRect(c, 20, 30, 360, 240, 22); c.stroke(); c.fillRect(20, 78, 360, 10);
        [52, 82, 112].forEach((x) => { c.beginPath(); c.arc(x, 55, 9, 0, Math.PI * 2); c.fill(); });
        c.fillRect(55, 115, 130, 120);
        [120, 150, 180, 210].forEach((y, i) => c.fillRect(210, y, i % 2 ? 95 : 135, 12));
      }, 4.6),
      // Services: code brackets
      fromCanvas((c, W, H) => {
        c.font = '800 210px Syne, "Arial Black", sans-serif';
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText("</>", W / 2, H / 2 + 8);
      }, 4.8),
      // Contact: envelope
      fromCanvas((c, W) => {
        c.lineWidth = 14; roundRect(c, 35, 55, 330, 200, 20); c.stroke();
        c.beginPath(); c.moveTo(45, 70); c.lineTo(W / 2, 175); c.lineTo(355, 70); c.stroke();
      }, 4.4),
    ];
    icons.forEach((arr, i) => {
      const at = geo.getAttribute("p" + (i + 1));
      at.array.set(arr);
      at.needsUpdate = true;
    });
  }
  const fontReady =
    document.fonts && document.fonts.load
      ? Promise.race([document.fonts.load("800 100px Syne"), new Promise((r) => timers.push(setTimeout(r, 1500)))])
      : Promise.resolve();
  fontReady.then(buildIcons, buildIcons);

  const uniforms = {
    uProg: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: mobile() ? 34 : 30 },
    uPR: { value: PR },
    uMouse: { value: new THREE.Vector2() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: /* glsl */ `
      attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4;
      attribute float aRand;
      uniform float uProg, uTime, uSize, uPR; uniform vec2 uMouse;
      varying float vHeat; varying float vRand; varying float vDepth;
      vec3 pick(float i){ if(i<.5) return p0; if(i<1.5) return p1; if(i<2.5) return p2; if(i<3.5) return p3; return p4; }
      void main(){
        float f = clamp(uProg + (aRand-.5)*.35*step(.001,uProg)*step(uProg,3.999), 0., 4.);
        float i0 = floor(f); float t = smoothstep(0.,1.,fract(f)); if(i0>=4.){ i0=4.; t=0.; }
        vec3 pos = mix(pick(i0), pick(min(i0+1.,4.)), t);
        float heat = sin(t*3.14159);
        vec3 drift = vec3(sin(aRand*61.+uTime*.9), cos(aRand*47.+uTime*.7), sin(aRand*29.+uTime*1.1));
        pos += drift*heat*1.6;
        pos += .035*vec3(sin(uTime*.8+pos.y*2.3+aRand*6.), cos(uTime*.7+pos.x*2.1), sin(uTime*.6+pos.x+pos.y));
        vec4 mv = modelViewMatrix*vec4(pos,1.);
        vec2 m = uMouse*vec2(3.,2.);
        float d = length(mv.xy-m); mv.xy += normalize(mv.xy-m+.0001)*smoothstep(1.4,0.,d)*.35;
        gl_Position = projectionMatrix*mv;
        gl_PointSize = uSize*uPR*(.35+aRand*.9)*(1./-mv.z)*(1.+heat*.6);
        vHeat = heat; vRand = aRand; vDepth = -mv.z;
      }`,
    fragmentShader: /* glsl */ `
      varying float vHeat; varying float vRand; varying float vDepth;
      void main(){
        vec2 c = gl_PointCoord-.5; float d = length(c); if(d>.5) discard;
        float a = smoothstep(.5,0.,d); a *= a;
        vec3 white = vec3(.97,.98,1.); vec3 sky = vec3(.36,.56,.98); vec3 blue = vec3(.15,.39,.92);
        vec3 col = mix(sky, white, smoothstep(.25,.75,vRand));
        col = mix(col, blue, step(.9,vRand));
        col = mix(col, blue, vHeat*.85*step(.45,vRand));
        float fade = clamp(1.3-(vDepth-6.)*.18, .25, 1.);
        gl_FragColor = vec4(col, a*.95*fade);
      }`,
  });
  const pts = new THREE.Points(geo, mat);
  const world = new THREE.Group();
  world.add(pts);
  scene.add(world);

  // orbit rings
  const orbit = new THREE.Group();
  world.add(orbit);
  const ringDefs = [
    [3.1, 0xf8fafc, 0.5, [1.2, 0, 0.3]],
    [3.5, 0x2563eb, 0.95, [0.4, 0.9, 0]],
    [3.9, 0x1e40af, 0.8, [-0.6, 0.2, 0.8]],
  ];
  const rings = ringDefs.map(([r, c, o, rot]) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.012, 8, 200),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o })
    );
    m.rotation.set(rot[0], rot[1], rot[2]);
    const sat = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 16),
      new THREE.MeshBasicMaterial({ color: c === 0x2563eb ? 0x60a5fa : 0xffffff })
    );
    sat.position.x = r;
    m.add(sat);
    orbit.add(m);
    return m;
  });

  // chapter shockwave
  const shock = new THREE.Mesh(
    new THREE.RingGeometry(0.96, 1, 128),
    new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
  );
  world.add(shock);
  let shockT = 1;

  // floating wireframe shards
  const shards = [];
  const shardGeos = [new THREE.OctahedronGeometry(0.35), new THREE.IcosahedronGeometry(0.3), new THREE.TetrahedronGeometry(0.38)];
  for (let i = 0; i < (mobile() ? 6 : 12); i++) {
    const m = new THREE.Mesh(
      shardGeos[i % 3],
      new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? 0x2563eb : 0x475569, wireframe: true, transparent: true, opacity: 0.5 })
    );
    m.position.set((R() - 0.5) * 16, (R() - 0.5) * 9, -3 - R() * 6);
    m.userData = { s: 0.2 + R() * 0.5, o: R() * 6 };
    scene.add(m);
    shards.push(m);
  }

  // dust backdrop
  const dustN = mobile() ? 600 : 1400;
  const dustPos = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    dustPos[i * 3] = (R() - 0.5) * 40;
    dustPos[i * 3 + 1] = (R() - 0.5) * 26;
    dustPos[i * 3 + 2] = -4 - R() * 25;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.045, transparent: true, opacity: 0.35, depthWrite: false })
  );
  scene.add(dust);

  // bloom
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), mobile() ? 0.45 : 0.7, 0.55, 0.6));
  composer.addPass(new OutputPass());

  // ---- scroll mapping ----
  let target = 0, prog = 0, chapterIdx = 0, mx = 0, my = 0, smx = 0, smy = 0, lastCh = -1;
  function measure() {
    const sy = window.scrollY, vh = window.innerHeight, mid = sy + vh * 0.5;
    let i = 0;
    for (let k = 0; k < N; k++) if (chapters[k].offsetTop <= mid) i = k;
    chapterIdx = i;
    if (i === 0) target = 0;
    else {
      const st = chapters[i].querySelector(".statement");
      const span = Math.max(1, st.offsetHeight * 0.45);
      const f = Math.max(0, Math.min(1, (sy - chapters[i].offsetTop + vh * 0.6) / span));
      target = i - 1 + f;
    }
    // word-by-word reveal
    says.forEach((el) => {
      const st = el.closest(".statement");
      const r = st.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (-r.top + vh * 0.25) / (st.offsetHeight - vh * 1.15)));
      const ws = el.querySelectorAll(".w");
      const count = Math.floor(p * (ws.length + 1));
      ws.forEach((w, idx) => w.classList.toggle("on", idx < count));
    });
    if (heroInner) heroInner.style.opacity = String(1 - Math.min(1, sy / (vh * 0.7)));
    const total = document.documentElement.scrollHeight - vh;
    if (railFill) railFill.style.width = (sy / Math.max(1, total)) * 100 + "%";
    if (chNo) chNo.textContent = String(i + 1).padStart(2, "0");
    if (chName) chName.textContent = chapters[i].dataset.name;
    navBtns.forEach((b, k) => b.classList.toggle("on", k === i));
    if (i !== lastCh) {
      if (lastCh !== -1) shockT = 0;
      lastCh = i;
    }
  }
  on(window, "scroll", measure, { passive: true });
  on(window, "pointermove", (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = -((e.clientY / window.innerHeight) * 2 - 1);
  });
  on(window, "resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    measure();
  });

  // ---- render loop ----
  let last = performance.now();
  const startT = last;
  function frame(now) {
    if (stopped) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const t = (now - startT) / 1000;
    prog += (target - prog) * (reduce ? 1 : Math.min(1, dt * 2.6));
    smx = lerp(smx, mx, dt * 3);
    smy = lerp(smy, my, dt * 3);
    uniforms.uProg.value = prog;
    uniforms.uTime.value = reduce ? 0 : t;
    uniforms.uMouse.value.set(smx, smy);

    const k = Math.min(1, prog);
    if (mobile()) {
      world.position.set(0, lerp(0, 1.55, k), 0);
      world.scale.setScalar(lerp(0.85, 0.62, k));
    } else {
      world.position.set(lerp(0, 2.5, k), lerp(0, 0.1, k), 0);
      world.scale.setScalar(lerp(1.05, 0.86, k));
    }
    if (chapterIdx === 0) world.scale.multiplyScalar(1 + Math.min(1, window.scrollY / window.innerHeight) * 0.25);
    const spin = reduce ? 0 : t * 0.12;
    const sw = Math.max(0, 1 - prog * 1.5);
    world.rotation.y = spin * sw + (reduce ? 0 : Math.sin(t * 0.5) * 0.18) * (1 - sw) - (mobile() ? 0 : 0.22) * (1 - sw) + smx * 0.3;
    world.rotation.x = -smy * 0.18;

    if (!reduce) {
      dust.rotation.y = t * 0.01;
      dust.position.y = Math.sin(t * 0.2) * 0.3;
    }
    const ringVis = prog < 0.8 ? 1 - prog * 0.6 : prog > 3.2 ? Math.min(0.6, (prog - 3.2) * 1.2) : 0.2;
    rings.forEach((r, i) => {
      r.rotation.z = (reduce ? 0 : t) * (0.25 + i * 0.12) * (i % 2 ? -1 : 1);
      r.material.opacity = ringDefs[i][2] * ringVis;
      r.scale.setScalar(0.85 + ringVis * 0.15);
    });
    orbit.rotation.y = (reduce ? 0 : t) * 0.05;
    if (shockT < 1) {
      shockT = Math.min(1, shockT + dt * 0.9);
      shock.scale.setScalar(0.5 + shockT * 6);
      shock.material.opacity = (1 - shockT) * 0.8;
      shock.rotation.x = -0.3;
    }
    if (!reduce) {
      shards.forEach((m) => {
        m.rotation.x += dt * m.userData.s;
        m.rotation.y += dt * m.userData.s * 0.7;
        m.position.y += Math.sin(t * 0.5 + m.userData.o) * 0.003;
      });
    }
    camera.position.z = 9 - Math.sin((prog * Math.PI) / 2.5) * 0.9;
    camera.position.x = smx * 0.4;
    camera.position.y = smy * 0.3;
    camera.lookAt(world.position.x * 0.35, world.position.y * 0.35, 0);
    if (!reduce) camera.rotateZ(Math.sin(prog * 1.3) * 0.035);

    composer.render();
    rafMain = requestAnimationFrame(frame);
  }

  // ---- intro ----
  const intro = document.getElementById("intro");
  const countEl = document.getElementById("count");
  const choices = document.getElementById("choices");
  let cnt = 0;
  const iv = setInterval(() => {
    cnt = Math.min(100, cnt + Math.ceil(R() * 9) + 2);
    if (countEl) countEl.textContent = String(cnt);
    if (cnt >= 100) {
      clearInterval(iv);
      if (choices) {
        choices.classList.add("ready");
        const btn = choices.querySelector("button");
        if (btn) btn.focus();
      }
    }
  }, reduce ? 10 : 45);

  if (choices) {
    choices.querySelectorAll("button").forEach((b) =>
      on(b, "click", () => {
        intro.classList.add("gone");
        document.body.classList.remove("locked");
        timers.push(setTimeout(() => document.documentElement.classList.add("revealed"), 250));
        if (!reduce && !lenis) {
          lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
          lenis.on("scroll", measure);
          const raf = (time) => {
            if (stopped || !lenis) return;
            lenis.raf(time);
            rafLenis = requestAnimationFrame(raf);
          };
          rafLenis = requestAnimationFrame(raf);
        }
      })
    );
  }

  // ---- 3D tilt cards ----
  const tilted = [...document.querySelectorAll(".work, .abil > div")];
  tilted.forEach((el) => {
    el.classList.add("tilt");
    if (reduce) return;
    on(el, "pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateZ(6px)`;
    });
    on(el, "pointerleave", () => {
      el.style.transform = "";
    });
  });

  // ---- custom cursor + hero tilt ----
  const cur = document.getElementById("cur");
  const curR = document.getElementById("curR");
  let cx = -100, cy = -100, rx = -100, ry = -100;
  on(window, "pointermove", (e) => {
    cx = e.clientX;
    cy = e.clientY;
    if (cur) cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  });
  document.querySelectorAll("a, button").forEach((el) => {
    on(el, "pointerenter", () => curR && curR.classList.add("big"));
    on(el, "pointerleave", () => curR && curR.classList.remove("big"));
  });
  function uiLoop() {
    if (stopped) return;
    rx += (cx - rx) * 0.15;
    ry += (cy - ry) * 0.15;
    if (curR) curR.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    if (!reduce && h1) h1.style.transform = `perspective(1000px) rotateX(${smy * 8}deg) rotateY(${smx * 12}deg)`;
    rafUi = requestAnimationFrame(uiLoop);
  }

  measure();
  prog = target;
  rafMain = requestAnimationFrame(frame);
  rafUi = requestAnimationFrame(uiLoop);

  // ---- cleanup ----
  return function cleanup() {
    stopped = true;
    cancelAnimationFrame(rafMain);
    cancelAnimationFrame(rafUi);
    cancelAnimationFrame(rafLenis);
    clearInterval(iv);
    timers.forEach((id) => clearTimeout(id));
    listeners.forEach((off) => off());
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
    tilted.forEach((el) => {
      el.classList.remove("tilt");
      el.style.transform = "";
    });
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    composer.dispose();
    renderer.dispose();
    document.body.classList.remove("locked");
  };
}
