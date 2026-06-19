"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";

// Procedural varnished mahogany: warm grain running fore-aft with darker
// plank seams stacked around the section.
function makeMahoganyTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#3a1809");
  grad.addColorStop(0.5, "#50220e");
  grad.addColorStop(1, "#270f05");
  g.fillStyle = grad;
  g.fillRect(0, 0, 1024, 512);
  for (let k = 0; k < 240; k++) {
    const y = Math.random() * 512;
    g.strokeStyle =
      Math.random() < 0.5 ? "rgba(36,14,6,0.36)" : "rgba(126,66,36,0.22)";
    g.lineWidth = 0.5 + Math.random() * 1.5;
    const amp = 1.5 + Math.random() * 4;
    const ph = Math.random() * 6.28;
    g.beginPath();
    for (let x = 0; x <= 1024; x += 16) {
      const yy = y + Math.sin(x / 110 + ph) * amp;
      x === 0 ? g.moveTo(x, yy) : g.lineTo(x, yy);
    }
    g.stroke();
  }
  const planks = 10;
  for (let p = 1; p < planks; p++) {
    const y = (512 / planks) * p;
    g.strokeStyle = "rgba(34,16,7,0.55)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(1024, y);
    g.stroke();
    g.strokeStyle = "rgba(132,74,42,0.2)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, y + 1.5);
    g.lineTo(1024, y + 1.5);
    g.stroke();
  }
  return new THREE.CanvasTexture(c);
}

// A realistic low-poly Ligurian gozzo: smooth parametric hull, glossy
// clearcoat paint with environment reflections, white rubrail, cabin,
// bimini canopy. It sails into the scene, turns around in 3D, sails back.
export default function Boat3D({ theme }) {
  const ref = useRef(null);
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = mount.clientWidth || 1;
    let h = mount.clientHeight || 1;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 1.5, 3.6);
    camera.lookAt(0, -0.1, -7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    // environment reflections (studio-ish IBL) for glossy paint & glass
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    // ---- lights ----
    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff1d8, 1.5);
    sun.position.set(-4, 6, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x9fe0ff, 0.5); // cool bounce from the sea
    fill.position.set(3, -2.5, 2);
    scene.add(fill);

    // ---- materials ----
    const woodTex = makeMahoganyTexture();
    woodTex.anisotropy = 4;
    // painted dark-blue topsides on the outside, varnished mahogany inside
    const hullMatOuter = new THREE.MeshPhysicalMaterial({
      color: 0x1e3760, // painted dark Ligurian blue
      roughness: 0.3,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.14,
      envMapIntensity: 0.95,
      side: THREE.FrontSide,
    });
    const hullMatInner = new THREE.MeshPhysicalMaterial({
      color: 0xd07a44,
      map: woodTex,
      roughness: 0.42,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.18,
      envMapIntensity: 0.5,
      side: THREE.BackSide,
    });
    const railMat = new THREE.MeshPhysicalMaterial({
      color: 0xeceadf, roughness: 0.4, clearcoat: 0.5, envMapIntensity: 1.0,
    });
    const whiteMat = new THREE.MeshPhysicalMaterial({
      color: 0xe9eae3, roughness: 0.5, clearcoat: 0.4, envMapIntensity: 0.9,
    });
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x223052, roughness: 0.78, envMapIntensity: 0.6 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x9c6b3f, roughness: 0.85 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x223038, roughness: 0.08, metalness: 0.0, clearcoat: 1.0, envMapIntensity: 1.4,
    });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x2b3a5a, roughness: 0.55, metalness: 0.3, envMapIntensity: 1.0 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xe8772f, roughness: 0.55, envMapIntensity: 0.8 });

    const boat = new THREE.Group();

    // ---------- smooth parametric hull ----------
    const STA = 56; // stations along the length
    const SEC = 30; // points across each cross-section
    const xStern = -1.95;
    const xBow = 2.05;
    const pos = [];
    const uv = [];
    const idx = [];
    const portPts = [];
    const starPts = [];

    for (let i = 0; i <= STA; i++) {
      const u = i / STA; // 0 = stern, 1 = bow
      const x = xStern + (xBow - xStern) * u;

      // half-beam: full amidships, tapering to a fine bow and a slim stern
      let b = 0.72 * Math.pow(Math.sin(Math.PI * u), 0.62);
      if (u < 0.12) b = Math.max(b, 0.2 * (1 - (0.12 - u) / 0.12)); // keep a little transom width

      // sheer (deck edge) — raised toward the bow, slight rise at the stern
      const ys =
        0.16 +
        0.34 * Math.pow(Math.max(0, (u - 0.5) / 0.5), 2.2) +
        0.05 * Math.pow(Math.max(0, (0.12 - u) / 0.12), 2);

      // keel (bottom) — deepest amidships, rockering up at the ends
      const yk = -0.54 + 0.34 * Math.pow(Math.abs(u - 0.46) / 0.54, 1.7);

      for (let j = 0; j <= SEC; j++) {
        const f = j / SEC; // 0 = port, 1 = starboard
        const phi = -Math.PI / 2 + Math.PI * f;
        const z = b * Math.sin(phi);
        const y = ys + (yk - ys) * Math.pow(Math.cos(phi), 1.3);
        pos.push(x, y, z);
        uv.push(u, f);
        if (j === 0) portPts.push(new THREE.Vector3(x, ys, b * Math.sin(-Math.PI / 2)));
        if (j === SEC) starPts.push(new THREE.Vector3(x, ys, b * Math.sin(Math.PI / 2)));
      }
    }
    for (let i = 0; i < STA; i++) {
      for (let j = 0; j < SEC; j++) {
        const a = i * (SEC + 1) + j;
        const c = a + (SEC + 1);
        idx.push(a, c, a + 1, a + 1, c, c + 1);
      }
    }
    const hullGeo = new THREE.BufferGeometry();
    hullGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    hullGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    hullGeo.setIndex(idx);
    hullGeo.computeVertexNormals();
    const hullMesh = new THREE.Mesh(hullGeo, hullMatOuter);
    boat.add(hullMesh);
    const hullInner = new THREE.Mesh(hullGeo, hullMatInner);
    boat.add(hullInner);
    hullMesh.updateMatrixWorld(true);

    // ---------- white rubrail along the whole gunwale ----------
    const railPts = portPts.concat(starPts.slice().reverse());
    const railCurve = new THREE.CatmullRomCurve3(railPts, true, "catmullrom", 0.2);
    const railGeo = new THREE.TubeGeometry(railCurve, 240, 0.038, 10, true);
    boat.add(new THREE.Mesh(railGeo, railMat));

    // ---------- cockpit floor (teak) ----------
    const floor = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.05, 0.96), woodMat);
    floor.position.set(-0.45, 0.02, 0);
    boat.add(floor);

    // ---------- cabin / wheelhouse ----------
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.5, 1.0), whiteMat);
    cabin.position.set(0.6, 0.5, 0);
    boat.add(cabin);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 1.06), whiteMat);
    roof.position.set(0.6, 0.76, 0);
    boat.add(roof);
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.82), glassMat);
    windshield.position.set(1.0, 0.54, 0);
    boat.add(windshield);
    const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.24, 0.02), glassMat);
    sideWin.position.set(0.55, 0.54, 0.505);
    boat.add(sideWin);
    const sideWin2 = sideWin.clone();
    sideWin2.position.z = -0.505;
    boat.add(sideWin2);

    // ---------- bimini canopy on four posts ----------
    const postGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.5, 10);
    [[-0.98, 0.5], [-0.12, 0.5], [-0.98, -0.5], [-0.12, -0.5]].forEach(([px, pz]) => {
      const m = new THREE.Mesh(postGeo, metalMat);
      m.position.set(px, 0.5, pz);
      boat.add(m);
    });
    // gently arched canopy (open cylinder shell segment)
    const canopyGeo = new THREE.CylinderGeometry(1.6, 1.6, 1.12, 40, 1, true, Math.PI / 2 - 0.42, 0.84);
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.rotation.z = Math.PI / 2;
    canopy.position.set(-0.55, -0.84, 0); // radius 1.6 lifts the arc up to ~0.76
    boat.add(canopy);

    // ---------- mast + flag ----------
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 10), metalMat);
    mast.position.set(-1.45, 0.7, 0);
    boat.add(mast);
    // white flag bearing a coral heart with a serif "M" (Monterosso)
    const fc = document.createElement("canvas");
    fc.width = 256;
    fc.height = 168;
    const fx = fc.getContext("2d");
    fx.fillStyle = "#fbf7ef"; // off-white cloth
    fx.fillRect(0, 0, 256, 168);
    const hoist = fx.createLinearGradient(0, 0, 44, 0); // soft shading by the mast
    hoist.addColorStop(0, "rgba(0,0,0,0.12)");
    hoist.addColorStop(1, "rgba(0,0,0,0)");
    fx.fillStyle = hoist;
    fx.fillRect(0, 0, 44, 168);
    const hcx = 152,
      hcy = 86,
      hw = 168,
      hh = 152;
    fx.beginPath();
    fx.moveTo(hcx, hcy + hh * 0.36);
    fx.bezierCurveTo(hcx - hw * 0.5, hcy - hh * 0.12, hcx - hw * 0.52, hcy - hh * 0.54, hcx, hcy - hh * 0.16);
    fx.bezierCurveTo(hcx + hw * 0.52, hcy - hh * 0.54, hcx + hw * 0.5, hcy - hh * 0.12, hcx, hcy + hh * 0.36);
    fx.closePath();
    fx.shadowColor = "rgba(0,0,0,0.22)";
    fx.shadowBlur = 7;
    fx.shadowOffsetY = 2;
    fx.fillStyle = "#dd4b43"; // poster coral-red
    fx.fill();
    fx.shadowColor = "transparent";
    fx.fillStyle = "#fbf7ef";
    fx.font = "italic 700 86px Georgia, 'Times New Roman', serif";
    fx.textAlign = "center";
    fx.textBaseline = "middle";
    fx.fillText("M", hcx, hcy - hh * 0.02);
    const flagTex = new THREE.CanvasTexture(fc);
    flagTex.anisotropy = 8;
    const flagMat = new THREE.MeshStandardMaterial({
      map: flagTex,
      side: THREE.DoubleSide,
      roughness: 0.82,
      metalness: 0,
    });
    // cloth: a plane that ripples more toward the free end (1.5× the old size)
    const FW = 0.48,
      FH = 0.3;
    const flagGeo = new THREE.PlaneGeometry(FW, FH, 28, 2);
    {
      const fp = flagGeo.attributes.position;
      for (let i = 0; i < fp.count; i++) {
        const k = (fp.getX(i) + FW / 2) / FW; // 0 at the hoist, 1 at the fly
        fp.setZ(i, Math.sin(k * Math.PI * 2.2) * 0.04 * k);
      }
      fp.needsUpdate = true;
      flagGeo.computeVertexNormals();
    }
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(-1.21, 1.06, 0); // hoist edge sits on the mast
    boat.add(flag);

    // ---------- lantern (lit only at night) ----------
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0xffe2a0, emissive: 0xffb24a, emissiveIntensity: 0 })
    );
    lantern.position.set(0.6, 0.95, 0);
    boat.add(lantern);
    const lanternLight = new THREE.PointLight(0xffc266, 0, 6, 2);
    lanternLight.position.set(0.6, 1.0, 0);
    boat.add(lanternLight);

    // ---------- orange details ----------
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 12, 24), orangeMat);
    ring.position.set(0.32, 0.46, 0.52);
    boat.add(ring);
    const fender = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.16, 6, 12), orangeMat);
    fender.position.set(-1.2, 0.05, 0.66);
    boat.add(fender);

    // ---------- boat name "Paolona" — hand-painted on the hull, curved to
    //            follow the sheer line, with subtly weathered paint ----------
    const nc = document.createElement("canvas");
    nc.width = 1024;
    nc.height = 384;
    const nctx = nc.getContext("2d");
    const NAME = "Paolona";
    nctx.font = "italic 700 158px Georgia, 'Times New Roman', serif";
    nctx.textAlign = "center";
    nctx.textBaseline = "middle";
    // lay the glyphs along a gentle upward arc, so the name rises toward the
    // ends the way a gozzo's sheer does instead of cutting straight across
    const R = 2600; // gentle radius → a clean, even line with just a hint of curve
    const cx = nc.width / 2;
    const cy = nc.height * 0.54 - R; // arc centre high above → text on the lower arc (a smile)
    const chars = [...NAME];
    const cw = chars.map((c) => nctx.measureText(c).width);
    const span = cw.reduce((a, b) => a + b, 0) + (chars.length - 1) * 4;
    nctx.fillStyle = "#ece2cd"; // sun-faded cream
    nctx.shadowColor = "rgba(0,0,0,0.36)";
    nctx.shadowBlur = 7;
    nctx.shadowOffsetY = 3;
    let along = -span / 2;
    chars.forEach((ch, i) => {
      const a = (along + cw[i] / 2) / R;
      nctx.save();
      nctx.translate(cx + Math.sin(a) * R, cy + Math.cos(a) * R);
      nctx.rotate(a);
      nctx.fillText(ch, 0, 0);
      nctx.restore();
      along += cw[i] + 4;
    });
    // clean, crisp lettering — no weathering (a perfect painted line)
    nctx.shadowColor = "transparent";
    nctx.globalAlpha = 1;

    const nameTex = new THREE.CanvasTexture(nc);
    nameTex.anisotropy = 8;
    const nameMat = new THREE.MeshBasicMaterial({
      map: nameTex,
      transparent: true,
      opacity: 0.94,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -6,
    });
    const nameSize = new THREE.Vector3(2.0, 0.74, 1.0);
    const decalPort = new THREE.Mesh(
      new DecalGeometry(
        hullMesh,
        new THREE.Vector3(0.6, 0.0, 0.5),
        new THREE.Euler(0, 0, 0.05),
        nameSize
      ),
      nameMat
    );
    boat.add(decalPort);
    const decalStar = new THREE.Mesh(
      new DecalGeometry(
        hullMesh,
        new THREE.Vector3(0.6, 0.0, -0.5),
        new THREE.Euler(0, Math.PI, -0.05),
        nameSize
      ),
      nameMat
    );
    boat.add(decalStar);

    // ---------- soft contact shadow ----------
    const sc = document.createElement("canvas");
    sc.width = sc.height = 128;
    const sctx = sc.getContext("2d");
    const grad = sctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    grad.addColorStop(0, "rgba(3,14,22,0.62)");
    grad.addColorStop(0.55, "rgba(3,14,22,0.28)");
    grad.addColorStop(1, "rgba(3,14,22,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 1.8),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.55;

    const fleet = new THREE.Group();
    fleet.add(shadow);
    fleet.add(boat);
    scene.add(fleet);

    // ---------- animation ----------
    const clock = new THREE.Clock();
    const P = 105; // daytime loop period — slower pace, longer voyage
    const Z_NEAR = -2.0;
    const Z_FAR = -22.0;
    const X_AMP = 12.0;
    const TAU = Math.PI * 2;
    const HOME = { x: -14, z: -13.5 }; // moorings at the town on the left
    const MOOR_T = 18; // seconds to sail home and moor
    const LAUNCH = 13; // seconds to leave the dock into the loop (eased to match the slow cruise)
    const lerp = (a, b, k) => a + (b - a) * k;
    const ss = (e) => {
      const c = Math.max(0, Math.min(1, e));
      return c * c * (3 - 2 * c);
    };

    // daytime path: out toward the horizon, sweep across, back
    function pathAt(c) {
      const cc = ((c % 1) + 1) % 1;
      const depth = Z_NEAR + (Z_FAR - Z_NEAR) * (0.5 - 0.5 * Math.cos(TAU * cc));
      const x = X_AMP * Math.sin(TAU * cc);
      return [x, depth];
    }

    function setNight(isNight) {
      sun.intensity = isNight ? 0.28 : 1.5;
      sun.color.set(isNight ? 0xaec6ff : 0xfff1d8);
      fill.intensity = isNight ? 0.16 : 0.5;
      // dim the constant lighting too, or the boat never reads as night:
      ambient.intensity = isNight ? 0.07 : 0.25;
      scene.environmentIntensity = isNight ? 0.26 : 1.0; // IBL reflections
      renderer.toneMappingExposure = isNight ? 0.58 : 1.05;
      lantern.material.emissiveIntensity = isNight ? 2.4 : 0;
      lanternLight.intensity = isNight ? 1.7 : 0;
    }

    // the boat sails on its own from the start; a click pauses / resumes it
    let mode = "sailing"; // 'moored' | 'sailing' | 'mooring'
    let sailStart = 0;
    let moorStart = 0;
    let sailFrom = { x: HOME.x, z: HOME.z };
    let moorFrom = { x: HOME.x, z: HOME.z };
    let lastHeading = 0;
    let prevTheme = themeRef.current;
    let paused = false;
    let pauseStart = 0;
    let pausedAccum = 0;

    fleet.position.set(HOME.x, 0, HOME.z);
    setNight(prevTheme === "dark");

    function startSailing(t) {
      sailStart = t;
      sailFrom = { x: fleet.position.x, z: fleet.position.z };
      mode = "sailing";
    }
    function startMooring(t) {
      moorStart = t;
      moorFrom = { x: fleet.position.x, z: fleet.position.z };
      mode = "mooring";
    }

    function posAt(t) {
      if (mode === "mooring") {
        const p = ss(Math.min(1, (t - moorStart) / MOOR_T));
        return [lerp(moorFrom.x, HOME.x, p), lerp(moorFrom.z, HOME.z, p)];
      }
      if (mode === "sailing") {
        const dt = t - sailStart;
        const [lx, lz] = pathAt((dt % P) / P);
        const b = ss(Math.min(1, dt / LAUNCH));
        return [lerp(sailFrom.x, lx, b), lerp(sailFrom.z, lz, b)];
      }
      return [HOME.x, HOME.z]; // moored, at rest
    }

    // a click anywhere (except on UI controls) pauses or resumes the boat
    const onClick = (e) => {
      if (
        e.target &&
        e.target.closest &&
        e.target.closest("button, a, input, select, label, .book-form")
      )
        return;
      const now = clock.getElapsedTime();
      if (!paused) {
        paused = true;
        pauseStart = now;
      } else {
        paused = false;
        pausedAccum += now - pauseStart;
      }
    };
    addEventListener("click", onClick);

    let raf;
    function frame() {
      raf = requestAnimationFrame(frame);
      if (paused) return; // frozen on the last frame until clicked again
      const t = clock.getElapsedTime() - pausedAccum;
      const th = themeRef.current;

      if (th !== prevTheme) {
        prevTheme = th;
        setNight(th === "dark"); // lighting only — the boat keeps sailing
      }
      if (mode === "mooring" && (t - moorStart) / MOOR_T >= 1) mode = "moored";

      if (!reduce) {
        const [x0, z0] = posAt(t);
        const [x1, z1] = posAt(t + 0.016);
        fleet.position.set(x0, 0, z0);
        const vx = x1 - x0;
        const vz = z1 - z0;
        if (Math.hypot(vx, vz) > 0.0006) lastHeading = Math.atan2(-vz, vx);
        fleet.rotation.y = lastHeading;

        const swell = mode === "sailing" ? 1 : 0.6;
        boat.position.y =
          (Math.sin(t * 0.7) * 0.04 + Math.sin(t * 1.3 + 1) * 0.02) * swell;
        boat.rotation.z = Math.sin(t * 0.6) * 0.04 * swell;
        boat.rotation.x = Math.sin(t * 0.5 + 0.5) * 0.022 * swell;
        flag.rotation.y = Math.sin(t * 4) * 0.25;
      } else {
        fleet.position.set(HOME.x, 0, HOME.z);
      }

      renderer.render(scene, camera);
    }
    frame();

    function onResize() {
      w = mount.clientWidth || 1;
      h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      removeEventListener("click", onClick);
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="boat3d" ref={ref} aria-hidden="true" />;
}
