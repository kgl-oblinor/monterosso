"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

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
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const sun = new THREE.DirectionalLight(0xfff1d8, 1.5);
    sun.position.set(-4, 6, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x9fe0ff, 0.5); // cool bounce from the sea
    fill.position.set(3, -2.5, 2);
    scene.add(fill);

    // ---- materials ----
    const hullMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c2c4a,
      roughness: 0.32,
      metalness: 0.0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1.1,
      side: THREE.DoubleSide,
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
    const redMat = new THREE.MeshStandardMaterial({ color: 0xcf3b3b, roughness: 0.7, side: THREE.DoubleSide });

    const boat = new THREE.Group();

    // ---------- smooth parametric hull ----------
    const STA = 56; // stations along the length
    const SEC = 30; // points across each cross-section
    const xStern = -1.95;
    const xBow = 2.05;
    const pos = [];
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
    hullGeo.setIndex(idx);
    hullGeo.computeVertexNormals();
    boat.add(new THREE.Mesh(hullGeo, hullMat));

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
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.2), redMat);
    flag.position.set(-1.29, 1.08, 0);
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

    // ---------- soft contact shadow ----------
    const sc = document.createElement("canvas");
    sc.width = sc.height = 128;
    const sctx = sc.getContext("2d");
    const grad = sctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    grad.addColorStop(0, "rgba(3,14,22,0.55)");
    grad.addColorStop(1, "rgba(3,14,22,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 2.0),
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
    const P = 40; // daytime loop period
    const Z_NEAR = -2.0;
    const Z_FAR = -16.0;
    const X_AMP = 7.0;
    const TAU = Math.PI * 2;
    const HOME = { x: -6.6, z: -13.5 }; // moorings at the town on the left
    const MOOR_T = 18; // seconds to sail home and moor
    const LAUNCH = 5; // seconds to leave the dock into the loop
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
      sun.intensity = isNight ? 0.3 : 1.5;
      sun.color.set(isNight ? 0xaec6ff : 0xfff1d8);
      fill.intensity = isNight ? 0.2 : 0.5;
      renderer.toneMappingExposure = isNight ? 0.76 : 1.05;
      lantern.material.emissiveIntensity = isNight ? 2.4 : 0;
      lanternLight.intensity = isNight ? 1.7 : 0;
    }

    let mode = "moored"; // 'moored' | 'sailing' | 'mooring'
    let sailStart = 0;
    let moorStart = 0;
    let sailFrom = { x: HOME.x, z: HOME.z };
    let moorFrom = { x: HOME.x, z: HOME.z };
    let lastHeading = 0;
    let requestSail = false;
    let prevTheme = themeRef.current;

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

    // a click anywhere on the scene sends the boat off on its long route
    const onClick = (e) => {
      if (
        e.target &&
        e.target.closest &&
        e.target.closest("button, a, input, select, label, .book-form")
      )
        return;
      requestSail = true;
    };
    addEventListener("click", onClick);

    let raf;
    function frame() {
      raf = requestAnimationFrame(frame);
      const t = clock.getElapsedTime();
      const th = themeRef.current;

      if (th !== prevTheme) {
        prevTheme = th;
        setNight(th === "dark");
        if (th === "dark") startMooring(t); // moon → head home and moor
        else startSailing(t); // sun → off on the route again
      }
      if (requestSail) {
        requestSail = false;
        if (mode !== "sailing") startSailing(t);
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
