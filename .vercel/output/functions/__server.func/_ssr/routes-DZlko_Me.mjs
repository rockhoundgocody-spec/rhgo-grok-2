import { o as __toESM } from "../_runtime.mjs";
import { n as TRAY, r as mineralById, t as MINERALS } from "./minerals-D9WKu1dv.mjs";
import { t as prefersReducedMotion } from "./perf-GHYxUAE8.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ScanLine, t as Zap } from "../_libs/lucide-react.mjs";
import { a as dayKey, c as useEngine, i as cn, n as Glass, o as formatInt, r as HudCorners, t as BADGE_CATALOG } from "./store-CGtM_-jJ.mjs";
import { n as LAND_LABEL, t as HOTSPOTS } from "./hotspots-C10k2nuG.mjs";
import { i as makeStickerCanvas, n as Specimen, r as makeJewelCanvas, s as specimenChip, t as SPECIMEN_CHIPS } from "./specimen-BAKu1rCm.mjs";
import { t as listWorldScans } from "./world-scans-CGC3fIpS.mjs";
import { a as Mesh, c as PlaneGeometry, d as SRGBColorSpace, f as Scene, g as VideoTexture, h as Vector3, i as LinearFilter, l as Points, m as TorusGeometry, n as BufferAttribute, o as MeshBasicMaterial, p as TextureLoader, r as BufferGeometry, s as PerspectiveCamera, t as WebGLRenderer, u as PointsMaterial } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DZlko_Me.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function bendMaterial(mat, concave, uniformsOut) {
	mat.onBeforeCompile = (shader) => {
		shader.uniforms.uConcave = { value: concave };
		shader.uniforms.uRipple = { value: 0 };
		shader.vertexShader = `uniform float uConcave; uniform float uRipple;\n${shader.vertexShader}`;
		shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      float _d = length(transformed.xy);
      float _hole = 0.255;
      float _well = _d < _hole
        ? -sqrt(max(0.0, _hole * _hole - _d * _d)) * uConcave
        : -0.05 * exp(-(_d - _hole) * 2.1) * uConcave;
      if (uRipple > 0.001) {
        _well += sin(_d * 16.0 - uRipple * 8.5) * exp(-uRipple * 1.65) * 0.05;
      }
      transformed.z += _well;`);
		uniformsOut.push(shader.uniforms);
	};
	mat.customProgramCacheKey = () => `well-${concave}`;
}
function chime() {
	try {
		const ctx = new AudioContext();
		const now = ctx.currentTime;
		const mk = (freq, gain, dur) => {
			const o = ctx.createOscillator();
			const g = ctx.createGain();
			o.type = "sine";
			o.frequency.value = freq;
			g.gain.value = 1e-4;
			o.connect(g);
			g.connect(ctx.destination);
			g.gain.exponentialRampToValueAtTime(gain, now + .03);
			g.gain.exponentialRampToValueAtTime(1e-4, now + dur);
			o.start(now);
			o.stop(now + dur + .05);
		};
		mk(92, .04, .9);
		mk(184, .018, .7);
		setTimeout(() => void ctx.close(), 1200);
	} catch {}
}
function AmethystOrb({ size = 180, className = "", flow }) {
	const wrapRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const jewelsRef = (0, import_react.useRef)(null);
	const pointer = (0, import_react.useRef)({
		x: 0,
		y: 0,
		on: false
	});
	const rippleT = (0, import_react.useRef)(0);
	const playRef = (0, import_react.useRef)(() => {});
	const flowRef = (0, import_react.useRef)({
		minerals: [],
		rate: 8
	});
	flowRef.current = flow ?? flowRef.current;
	const [ripples, setRipples] = (0, import_react.useState)([]);
	const [fallback, setFallback] = (0, import_react.useState)(false);
	const ripple = size * .55;
	(0, import_react.useEffect)(() => {
		const wrap = wrapRef.current;
		const canvas = canvasRef.current;
		const jewels = jewelsRef.current;
		if (!wrap || !canvas) return;
		const reduced = prefersReducedMotion();
		let renderer;
		try {
			renderer = new WebGLRenderer({
				canvas,
				alpha: true,
				antialias: true,
				premultipliedAlpha: false,
				powerPreference: "high-performance"
			});
		} catch {
			setFallback(true);
			return;
		}
		renderer.setClearColor(0, 0);
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.toneMapping = 0;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		const scene = new Scene();
		const camera = new PerspectiveCamera(32, 2.33, .05, 50);
		camera.position.set(0, .05, 2.05);
		const disposables = [];
		const track = (o) => {
			disposables.push(o);
			return o;
		};
		const bendUniforms = [];
		const dustGeo = track(new BufferGeometry());
		const dustN = 90;
		const dustPos = /* @__PURE__ */ new Float32Array(270);
		for (let i = 0; i < dustN; i++) {
			const rho = .4 + Math.pow(Math.random(), .6) * 1.5;
			const ang = Math.random() * Math.PI * 2;
			dustPos[i * 3] = Math.cos(ang) * rho;
			dustPos[i * 3 + 1] = (Math.random() - .5) * .03;
			dustPos[i * 3 + 2] = Math.sin(ang) * rho;
		}
		dustGeo.setAttribute("position", new BufferAttribute(dustPos, 3));
		const dust = new Points(dustGeo, track(new PointsMaterial({
			color: 16767392,
			size: .028,
			sizeAttenuation: true,
			transparent: true,
			opacity: .38,
			depthWrite: false,
			blending: 2,
			toneMapped: false
		})));
		dust.rotation.x = .12;
		dust.renderOrder = 6;
		scene.add(dust);
		const jewelCache = /* @__PURE__ */ new Map();
		const jewelFor = (id) => {
			let chip = jewelCache.get(id);
			if (chip) return chip;
			const mineral = mineralById(id) ?? mineralById("quartz") ?? mineralById(TRAY[0].mineralId);
			if (!mineral) {
				const blank = document.createElement("canvas");
				blank.width = 256;
				blank.height = 256;
				jewelCache.set(id, blank);
				return blank;
			}
			chip = makeStickerCanvas(makeJewelCanvas(mineral, 200), 256);
			jewelCache.set(id, chip);
			const url = specimenChip(id);
			if (url) {
				const img = new Image();
				img.crossOrigin = "anonymous";
				img.onload = () => {
					jewelCache.set(id, makeStickerCanvas(img, 256));
				};
				img.src = url;
			}
			return chip;
		};
		for (const id of Object.keys(SPECIMEN_CHIPS)) jewelFor(id);
		const grains = [];
		let lastPulse = "";
		const tmp = new Vector3();
		const octx = jewels?.getContext("2d") ?? null;
		const stamp = document.createElement("canvas");
		stamp.width = 256;
		stamp.height = 256;
		const sctx = stamp.getContext("2d");
		const birth = (mineralId, outer, pulse = false) => {
			const yours = pulse || (flowRef.current.yours?.includes(mineralId) ?? false);
			const g = {
				mineralId,
				phi: Math.random() * Math.PI * 2,
				r: outer ? 1.72 + Math.random() * .42 : .48 + Math.random() * 1.4,
				yOff: (Math.random() - .5) * .22,
				spin: pulse ? .2 : .08 + Math.random() * .2,
				scale: pulse ? .2 : .11 + Math.random() * .05,
				tumble: Math.random() * Math.PI * 2,
				yours,
				pulse
			};
			grains.push(g);
			return g;
		};
		const torus = new Mesh(track(new TorusGeometry(.262, .008, 14, 180)), track(new MeshBasicMaterial({
			color: 16774364,
			transparent: true,
			opacity: .28,
			blending: 2,
			depthWrite: false,
			toneMapped: false
		})));
		torus.rotation.x = Math.PI / 2 + .11;
		torus.position.z = .01;
		torus.renderOrder = 5;
		scene.add(torus);
		const torus2 = new Mesh(track(new TorusGeometry(.284, .0045, 10, 140)), track(new MeshBasicMaterial({
			color: 16760944,
			transparent: true,
			opacity: .18,
			blending: 2,
			depthWrite: false,
			toneMapped: false
		})));
		torus2.rotation.x = Math.PI / 2 + .11;
		torus2.position.z = .01;
		torus2.renderOrder = 5;
		scene.add(torus2);
		const plateGeo = track(new PlaneGeometry(2.88, 2.88 / 2.33, 80, 36));
		const still = track(new TextureLoader().load("/companion/gargantua.webp"));
		still.colorSpace = SRGBColorSpace;
		still.minFilter = LinearFilter;
		const farMat = track(new MeshBasicMaterial({
			map: still,
			transparent: true,
			opacity: .38,
			depthWrite: false,
			blending: 2,
			toneMapped: false,
			side: 2
		}));
		bendMaterial(farMat, 1.7, bendUniforms);
		const farPlate = new Mesh(plateGeo, farMat);
		farPlate.position.z = -.22;
		farPlate.scale.setScalar(1.04);
		farPlate.renderOrder = 3;
		scene.add(farPlate);
		const heroMat = track(new MeshBasicMaterial({
			map: still,
			transparent: true,
			depthWrite: false,
			toneMapped: false,
			side: 2
		}));
		bendMaterial(heroMat, 1.35, bendUniforms);
		const heroPlate = new Mesh(plateGeo, heroMat);
		heroPlate.position.z = .02;
		heroPlate.renderOrder = 4;
		scene.add(heroPlate);
		const video = document.createElement("video");
		video.src = "/companion/gargantua.mp4";
		video.crossOrigin = "anonymous";
		video.loop = true;
		video.muted = true;
		video.playsInline = true;
		video.preload = "auto";
		video.setAttribute("playsinline", "");
		const vtex = track(new VideoTexture(video));
		vtex.colorSpace = SRGBColorSpace;
		vtex.minFilter = LinearFilter;
		vtex.generateMipmaps = false;
		const nearMat = track(new MeshBasicMaterial({
			map: vtex,
			transparent: true,
			opacity: .55,
			depthWrite: false,
			blending: 2,
			toneMapped: false,
			side: 2
		}));
		bendMaterial(nearMat, 1.28, bendUniforms);
		const nearPlate = new Mesh(plateGeo, nearMat);
		nearPlate.position.z = .04;
		nearPlate.renderOrder = 4;
		scene.add(nearPlate);
		const playVideo = () => {
			if (reduced) return;
			const p = video.play();
			if (p) p.catch(() => {});
		};
		video.addEventListener("canplay", playVideo, { once: true });
		playRef.current = playVideo;
		playVideo();
		const look = new Vector3(0, -.02, 0);
		const mouse = {
			x: 0,
			y: 0
		};
		const resize = () => {
			const w = wrap.clientWidth;
			const h = wrap.clientHeight;
			if (w < 8 || h < 8) return;
			const pr = Math.min(window.devicePixelRatio || 1, 2);
			renderer.setPixelRatio(pr);
			renderer.setSize(w, h, false);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			if (jewels) {
				const jw = jewels.clientWidth || w;
				const jh = jewels.clientHeight || h;
				jewels.width = Math.max(1, Math.round(jw * pr));
				jewels.height = Math.max(1, Math.round(jh * pr));
			}
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(wrap);
		if (jewels) ro.observe(jewels);
		let raf = 0;
		let running = true;
		let last = performance.now();
		const t0 = last;
		const frame = (now) => {
			if (!running) return;
			const dt = Math.min((now - last) / 1e3, .1);
			last = now;
			const t = (now - t0) / 1e3;
			mouse.x += ((pointer.current.on ? pointer.current.x : 0) - mouse.x) * .08;
			mouse.y += ((pointer.current.on ? pointer.current.y : 0) - mouse.y) * .08;
			if (rippleT.current > 0) {
				rippleT.current += dt;
				if (rippleT.current > 1.8) rippleT.current = 0;
			}
			for (const u of bendUniforms) u.uRipple.value = rippleT.current;
			camera.position.x = (reduced ? 0 : Math.sin(t * .22) * .18) + mouse.x * .32;
			camera.position.y = (reduced ? .04 : .04 + Math.cos(t * .18) * .07) + mouse.y * -.18;
			camera.position.z = reduced ? 2.08 : 2.08 + Math.sin(t * .13) * .05;
			camera.lookAt(look);
			dust.rotation.y = reduced ? 0 : t * .11;
			torus.rotation.z = reduced ? 0 : t * .09;
			torus2.rotation.z = reduced ? 0 : -t * .055;
			const flowNow = flowRef.current;
			const catalog = flowNow.minerals.length ? flowNow.minerals : Object.keys(SPECIMEN_CHIPS);
			const yours = flowNow.yours ?? [];
			const rate = Math.max(8, flowNow.rate);
			const cap = Math.min(52, 10 + Math.floor(rate * .62));
			const inspiral = .016 + Math.min(.09, rate * 85e-5);
			if (flowNow.pulse && flowNow.pulse.id !== lastPulse) {
				lastPulse = flowNow.pulse.id;
				birth(flowNow.pulse.mineralId, true, true);
			}
			while (grains.length < cap) birth(catalog[grains.length % catalog.length], grains.length > 10);
			while (grains.length > cap + 8) grains.pop();
			for (let i = grains.length - 1; i >= 0; i--) {
				const g = grains[i];
				g.phi += dt * g.spin * Math.pow(Math.max(g.r, .22), -1.25);
				g.r -= dt * inspiral * (.45 + .9 / Math.max(g.r, .2));
				g.tumble += dt * (.25 + g.spin * .4);
				if (g.r < .255) {
					if (grains.length > cap) {
						grains.splice(i, 1);
						continue;
					}
					const next = catalog[Math.floor(Math.random() * catalog.length)] ?? g.mineralId;
					g.mineralId = next;
					g.r = 1.74 + Math.random() * .4;
					g.phi = Math.random() * Math.PI * 2;
					g.yOff = (Math.random() - .5) * .22;
					g.scale = .11 + Math.random() * .05;
					g.yours = yours.includes(next);
					g.pulse = false;
				}
			}
			if (octx && jewels) {
				const pw = jewels.width;
				const ph = jewels.height;
				octx.clearRect(0, 0, pw, ph);
				const vis = [];
				const pr = pw / Math.max(1, jewels.clientWidth);
				const wellW = wrap.clientWidth * pr;
				const wellH = wrap.clientHeight * pr;
				const ox = (pw - wellW) / 2;
				const oy = (ph - wellH) / 2;
				const px = Math.min(wellW, wellH * 2.15);
				for (const g of grains) {
					const worldZ = Math.sin(g.phi) * g.r;
					tmp.set(Math.cos(g.phi) * g.r, g.yOff + Math.sin(g.phi * 1.7) * .05, worldZ);
					tmp.project(camera);
					if (tmp.z > 1 || tmp.z < -1) continue;
					const front = Math.max(0, Math.min(1, (worldZ + .15) / Math.max(.45, g.r + .2)));
					const fall = Math.max(.18, Math.min(1, (g.r - .255) / 1.35));
					const pop = .7 + 1.55 * Math.pow(front, 1.55);
					const s = g.scale * px * (.4 + .6 * fall) * pop;
					const x = ox + (tmp.x * .5 + .5) * wellW;
					const y = oy + (-tmp.y * .5 + .5) * wellH - front * wellH * .1;
					const heat = Math.max(0, Math.min(1, 1 - (g.r - .255) / 1.15));
					vis.push({
						g,
						x,
						y,
						z: tmp.z,
						s,
						front,
						heat
					});
				}
				vis.sort((a, b) => b.z - a.z);
				for (const v of vis) {
					const img = jewelFor(v.g.mineralId);
					const fade = Math.max(.15, Math.min(1, (v.g.r - .22) / .2));
					if (sctx) {
						sctx.globalCompositeOperation = "source-over";
						sctx.globalAlpha = 1;
						sctx.clearRect(0, 0, 256, 256);
						sctx.drawImage(img, 0, 0, 256, 256);
						sctx.globalCompositeOperation = "multiply";
						sctx.fillStyle = `rgba(${Math.round(255 - v.heat * 8)}, ${Math.round(170 - v.heat * 22)}, ${Math.round(90 + (1 - v.heat) * 80)}, ${.08 + v.heat * .32})`;
						sctx.fillRect(0, 0, 256, 256);
						if (v.g.yours || v.g.pulse) {
							sctx.fillStyle = v.g.pulse ? "rgba(255, 210, 120, 0.38)" : "rgba(210, 180, 255, 0.22)";
							sctx.fillRect(0, 0, 256, 256);
						}
						sctx.globalCompositeOperation = "screen";
						sctx.fillStyle = `rgba(255, 168, 72, ${v.heat * .22})`;
						sctx.fillRect(0, 0, 256, 256);
						sctx.globalCompositeOperation = "source-over";
					}
					octx.save();
					octx.translate(v.x, v.y);
					octx.rotate(v.g.tumble * .18);
					const card = .78 + .22 * Math.cos(v.g.tumble * .55);
					octx.scale(card, 1);
					octx.globalAlpha = fade;
					octx.shadowColor = `rgba(0,0,0,${.3 + v.front * .5})`;
					octx.shadowBlur = 5 + v.front * 18;
					octx.shadowOffsetY = 3 + v.front * 10;
					octx.drawImage(sctx ? stamp : img, -v.s / 2, -v.s / 2, v.s, v.s);
					octx.restore();
				}
			}
			renderer.render(scene, camera);
			if (!reduced) raf = requestAnimationFrame(frame);
		};
		const onVis = () => {
			running = !document.hidden;
			if (document.hidden) video.pause();
			else playVideo();
			if (running && !reduced) {
				last = performance.now();
				cancelAnimationFrame(raf);
				raf = requestAnimationFrame(frame);
			}
		};
		document.addEventListener("visibilitychange", onVis);
		raf = requestAnimationFrame(frame);
		if (reduced) frame(t0);
		return () => {
			running = false;
			cancelAnimationFrame(raf);
			ro.disconnect();
			document.removeEventListener("visibilitychange", onVis);
			video.pause();
			video.removeAttribute("src");
			video.load();
			scene.clear();
			disposables.forEach((d) => d.dispose());
			renderer.dispose();
		};
	}, []);
	const onMove = (e) => {
		const rect = wrapRef.current?.getBoundingClientRect();
		if (!rect) return;
		pointer.current = {
			on: true,
			x: (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2),
			y: (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
		};
	};
	const onTap = (e) => {
		const rect = wrapRef.current?.getBoundingClientRect();
		if (!rect) return;
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const id = Date.now();
		setRipples((r) => [...r, {
			id,
			x,
			y
		}]);
		setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 720);
		rippleT.current = .01;
		playRef.current();
		if (navigator.vibrate) navigator.vibrate(16);
		chime();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("companion-stage w-full", className),
		style: {
			aspectRatio: "21 / 9",
			maxWidth: 560
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: wrapRef,
			className: "companion",
			onPointerMove: onMove,
			onPointerLeave: () => {
				pointer.current.on = false;
			},
			onPointerDown: onTap,
			role: "button",
			tabIndex: 0,
			"aria-label": "Companion singularity",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "companion-bloom",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "companion-hole",
					"aria-hidden": true
				}),
				fallback ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/companion/gargantua.webp",
					alt: "",
					className: "companion-disk",
					draggable: false
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "companion-canvas",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "companion-streak",
					"aria-hidden": true
				}),
				ripples.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointer-events-none absolute rounded-full animate-ripple",
					style: {
						left: r.x,
						top: r.y,
						width: ripple,
						height: ripple,
						marginLeft: -ripple / 2,
						marginTop: -ripple / 2,
						border: "1px solid hsla(40,100%,82%,0.55)"
					},
					"aria-hidden": true
				}, r.id))
			]
		}), fallback ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: jewelsRef,
			className: "companion-jewels",
			"aria-hidden": true
		})]
	});
}
var LEVEL_TITLES = [
	"Pebble Scout",
	"Crystal Apprentice",
	"Vein Walker",
	"Geode Guardian",
	"Field Cartographer",
	"Titan Rockhound",
	"Steward of Stone"
];
var BASE_XP = 1500;
var GROWTH = 1.4;
function levelThreshold(level) {
	if (level <= 1) return 0;
	let total = 0;
	for (let k = 0; k < level - 1; k++) total += BASE_XP * Math.pow(GROWTH, k);
	return Math.round(total);
}
function getLevel(xp) {
	for (let level = LEVEL_TITLES.length; level >= 1; level--) if (xp >= levelThreshold(level)) return level;
	return 1;
}
function getTitle(level) {
	return LEVEL_TITLES[Math.min(Math.max(level, 1) - 1, LEVEL_TITLES.length - 1)];
}
function xpProgress(xp) {
	const level = getLevel(xp);
	if (level >= LEVEL_TITLES.length) return 100;
	const floor = levelThreshold(level);
	const ceil = levelThreshold(level + 1);
	return Math.min(100, Math.max(0, (xp - floor) / (ceil - floor) * 100));
}
function xpToNext(xp) {
	const level = getLevel(xp);
	if (level >= LEVEL_TITLES.length) return 0;
	return levelThreshold(level + 1) - xp;
}
function luckyMineral() {
	const start = new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 0).getTime();
	const day = Math.floor((Date.now() - start) / 864e5);
	return MINERALS[day % MINERALS.length];
}
function Hub() {
	const player = useEngine((s) => s.player);
	const findsAll = useEngine((s) => s.finds);
	const badges = useEngine((s) => s.badges);
	const checkIn = useEngine((s) => s.checkIn);
	const grantXp = useEngine((s) => s.grantXp);
	const finds = (0, import_react.useMemo)(() => findsAll.filter((f) => !f.ephemeral), [findsAll]);
	const [toast, setToast] = (0, import_react.useState)(null);
	const lucky = luckyMineral();
	const resonanceKey = `rhgo_resonance_${dayKey()}`;
	const [claimed, setClaimed] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem(resonanceKey) === "1";
		} catch {
			return false;
		}
	});
	const [world, setWorld] = (0, import_react.useState)({
		scans: [],
		rate24h: 0
	});
	const [boost, setBoost] = (0, import_react.useState)(0);
	const [pulse, setPulse] = (0, import_react.useState)();
	const seenFind = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let live = true;
		const pull = async () => {
			try {
				const next = await listWorldScans();
				if (!live) return;
				setWorld(next);
				setBoost(0);
			} catch {}
		};
		pull();
		const t = window.setInterval(pull, 12e3);
		return () => {
			live = false;
			window.clearInterval(t);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const latest = finds[0];
		if (!latest) return;
		if (seenFind.current === null) {
			seenFind.current = latest.id;
			return;
		}
		if (latest.id !== seenFind.current) {
			seenFind.current = latest.id;
			setPulse({
				id: latest.id,
				mineralId: latest.mineralId
			});
			setBoost((n) => n + 1);
		}
	}, [finds]);
	(0, import_react.useEffect)(() => {
		const r = checkIn();
		if (r) setToast(`Check-in · +${r.gained} XP · streak ${r.streak}`);
	}, [checkIn]);
	const level = getLevel(player.xp);
	const title = getTitle(level);
	const progress = xpProgress(player.xp);
	const remaining = xpToNext(player.xp);
	const hunt = HOTSPOTS[(finds.length + level) % HOTSPOTS.length];
	const last = finds[0];
	const lastMineral = last ? mineralById(last.mineralId) : void 0;
	const localDay = finds.filter((f) => Date.now() - Date.parse(f.at) < 864e5).length;
	const rate = Math.max(world.rate24h + boost, localDay);
	const flowMinerals = (0, import_react.useMemo)(() => {
		const ids = world.scans.map((s) => s.mineralId);
		for (const f of finds.slice(0, 16)) if (!ids.includes(f.mineralId)) ids.push(f.mineralId);
		return ids;
	}, [world.scans, finds]);
	const yours = (0, import_react.useMemo)(() => [...new Set(finds.map((f) => f.mineralId))], [finds]);
	const claimResonance = () => {
		if (claimed) return;
		try {
			localStorage.setItem(resonanceKey, "1");
		} catch {}
		setClaimed(true);
		grantXp(18);
		setToast(`Geode resonance · ${lucky.name} · +18 XP`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-full max-w-lg flex-col px-5 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "rise flex items-center justify-between",
				style: { paddingTop: "max(20px, env(safe-area-inset-top))" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[15px] font-semibold tracking-tight",
					children: ["RockHound-", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "display italic text-amethyst glow-amethyst",
						children: "GO"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid size-10 place-items-center rounded-full text-[11px] font-semibold uppercase text-fg/70",
					style: {
						border: "1px solid hsla(265,40%,70%,0.28)",
						background: "linear-gradient(160deg, hsla(265,40%,40%,0.18), hsla(0,0%,100%,0.03))",
						boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.16)"
					},
					"aria-label": "Profile",
					children: (player.name || "You")[0]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rise rise-1 relative z-10 -mx-5 mt-1 w-[calc(100%+2.5rem)] overflow-visible",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmethystOrb, {
					size: 196,
					level,
					flow: {
						minerals: flowMinerals,
						rate,
						yours,
						pulse
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker mt-1 text-center",
					children: rate > 0 ? `World well · ${formatInt(rate)} / 24h` : "World well"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rise rise-2 mt-3 flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: claimResonance,
					className: "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide transition-transform active:scale-[0.96]",
					style: {
						background: claimed ? "hsla(38,50%,18%,0.45)" : "linear-gradient(135deg, hsla(40,100%,62%,0.28), hsla(28,95%,42%,0.32))",
						border: claimed ? "1px solid hsla(40,50%,50%,0.28)" : "1px solid hsla(40,100%,70%,0.45)",
						color: claimed ? "hsl(40,70%,78%)" : "#ffe9b0",
						boxShadow: claimed ? "none" : "0 0 22px hsla(38,100%,50%,0.22)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
						size: 12,
						className: claimed ? "" : "animate-pulse"
					}), claimed ? "Resonance active" : "Daily challenge"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise rise-3 mt-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display text-[30px] leading-none tracking-tight",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "engine-num text-[11px] text-fg/40",
							children: remaining > 0 ? `${formatInt(remaining)} XP to next` : "Max level"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "xp-track",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "xp-fill",
							style: { width: `${progress}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-fg/35",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Level ", level] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "engine-num",
							children: [formatInt(player.xp), " XP"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rise rise-4 mt-8 flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/scan",
					className: "scan-cta",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, {
						size: 18,
						strokeWidth: 2.5,
						"aria-hidden": true
					}), "Scan"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rise rise-5 mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "kicker mb-2",
					children: "Tonight's ground"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/field",
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
						variant: "hud",
						className: "relative px-4 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudCorners, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "display text-[22px] leading-tight",
								children: hunt.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-[12px] capitalize tracking-wide text-fg/50",
								children: [
									hunt.state,
									" · ",
									LAND_LABEL[hunt.land],
									hunt.land === "protected" ? " · observe only" : ""
								]
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "rise rise-6 mt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
					className: "grid grid-cols-3 divide-x divide-white/10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							k: "Streak",
							v: `${player.streak}d`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							k: "Finds",
							v: String(finds.length)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							k: "Marks",
							v: String(badges.length)
						})
					]
				})
			}),
			last && lastMineral ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "kicker mb-2",
					children: "Last logged"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/dex",
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
						className: "px-3 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Specimen, {
								mineral: lastMineral,
								size: 48
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate font-medium",
										children: last.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "engine-num text-[11px] text-hud",
										children: [Math.round(last.confidence * 100), "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5 font-mono text-[11px] text-faint",
									children: last.formula
								})]
							})]
						})
					})
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-[13px] leading-relaxed text-muted",
				children: "Point the lens, pick a tray stone, or run the bench. First ID never leaves the device."
			}),
			badges.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap gap-1.5",
				children: BADGE_CATALOG.filter((b) => badges.includes(b.id)).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted hairline",
					children: b.name
				}, b.id))
			}) : null,
			toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-[12px] text-hud glow-hud",
				role: "status",
				children: toast
			}) : null
		]
	});
}
function Stat({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "kicker",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "engine-num mt-1 text-[20px]",
			children: v
		})]
	});
}
//#endregion
export { Hub as component };
