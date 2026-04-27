import { useEffect, useRef, useState } from 'react';
import { audio } from '../engine/AudioEngine';

/* ── Sketchfab model IDs ── */
const SCENES = {
    alley: '79e616eab10644f88cb772ddf71bfe0a',
    gallery: 'd81a8b6ddea442e49cce849205c05a64',
    renovation: 'cd3f06f3a5b849a69198980d085a97b7',
    hospital: '9ec46c4d615a4581a235eebfb162f574',
    courtroom: 'b6d2b91c652148479400923a2cabb2d1',
    range: '5b8f1c2bfc8b48518cf733d0da6557e6',
    cockpit: '9e7bfa1049ec44a2a8d8d0bdaf51533c',
    subway: 'ab3df8a4a1024a8ca0458720d0101b79',
    duel: '37668987035a4436b2e731da04dac6cd',
    hogwarts: 'bde62298ac8640588d5a2928b8e113dc',
};

/* ──────────────────────────────────────────────────────
   Per-scene camera waypoints.
   Camera smoothly glides between posA ↔ posB over
   `period` seconds with breathing and look-around.

   useModelDefault: true → posA/targetA are read from
   the Sketchfab model's default camera at load time.
   ────────────────────────────────────────────────────── */
const SCENE_CAMERAS = {
    renovation: {
        posA: [-16.6389, 4.9341, 2.9511],
        posB: [-16.208, 14.0109, 4.8732],
        targetA: [2.0825, 8.6182, 3.7979],
        targetB: [2.0825, 8.6182, 3.7979],
        period: 35,
        breathAmp: 0.02,
        lookSway: 0.08,
    },
    hospital: {
        posA: [-2.6344, -9.2432, 3.1206],
        posB: [6.9573, -5.9367, 3.4123],
        targetA: [-0.508, 0.2422, 2.2641],
        targetB: [-0.508, 0.2422, 2.2641],
        period: 38,
        breathAmp: 0.015,
        lookSway: 0.06,
    },
    gallery: {
        posA: [-8.7333, 0.631, 1.381],
        posB: [1.4003, 3.9251, 1.439],
        targetA: [-3.041, 0.3589, 1.1315],
        targetB: [-3.041, 0.3589, 1.1315],
        period: 40,
        breathAmp: 0.01,
        lookSway: 0.05,
    },
    range: {
        posA: [-0.2196, -10.2848, 2.0823],
        posB: [-0.0396, -8.073, 1.9708],
        targetA: [-0.3987, -6.4584, 1.1346],
        targetB: [-0.1052, -6.3283, 1.7054],
        period: 22,
        breathAmp: 0.008,
        lookSway: 0.04,
        oneWay: true, // Animate to posB once, then stay with look-around only
    },
    courtroom: {
        posA: [5.6051, -0.3216, 2.1405],
        posB: [5.6051, -0.3217, 2.1405],
        targetA: [5.605, -0.3216, 2.1405],
        targetB: [5.605, -0.3216, 2.1405],
        period: 20,
        breathAmp: 0.008,
        lookSway: 0.06,
    },
    subway: {
        posA: [-0.1318, -0.468, 0.2191],
        posB: [-0.0712, -0.0766, 0.1494],
        targetA: [-0.0524, 0.0212, 0.142],
        targetB: [-0.0524, 0.0212, 0.142],
        period: 18,
        breathAmp: 0.003,
        lookSway: 0.015,
    },
    alley: {
        posA: [-2.3826, 25.5993, -5.7947],
        posB: [-2.3826, 20.0, -5.7947],
        targetA: [-1.9724, 21.303, -6.3973],
        targetB: [-1.9724, 15.7, -6.3973],
        period: 30,
        breathAmp: 0.015,
        lookSway: 0.06,
    },
    cockpit: {
        // posA/targetA come from the Sketchfab model's default camera
        useModelDefault: true,
        posB: [-0.2743, 70.4783, 152.5853],
        targetB: [87.2731, 195.771, 27.2758],
        period: 50,
        breathAmp: 0.5,
        lookSway: 2.0,
    },
    duel: {
        // Metal Gear Solid: Duel to the Death
        useModelDefault: true,
        period: 35,
        breathAmp: 0.02,
        lookSway: 0.08,
    },
    hogwarts: {
        // Harry Potter - Hogwarts Great Hall (Animated)
        useModelDefault: true,
        period: 45,
        breathAmp: 0.03,
        lookSway: 0.12,
    },
};

/* ── Cockpit flight-sim exterior environments (random cycle) ── */
const COCKPIT_ENVS = [
    {
        name: 'Clear Day',
        sky: 'linear-gradient(180deg, #0a3d8f 0%, #2a7bd8 30%, #5a9de8 55%, #87c4f7 75%, #c8e6ff 100%)',
    },
    {
        name: 'Sunset',
        sky: 'linear-gradient(180deg, #0f0820 0%, #3d1560 15%, #8b2e6a 30%, #d4548a 45%, #f09040 65%, #f8c860 85%, #fde8a0 100%)',
    },
    {
        name: 'Night',
        sky: 'linear-gradient(180deg, #020208 0%, #060612 40%, #0a0a20 70%, #101030 100%)',
        stars: true,
    },
    {
        name: 'Storm',
        sky: 'linear-gradient(180deg, #0a0e14 0%, #16202e 25%, #28333f 50%, #3a4550 75%, #252a30 100%)',
        lightning: true, rain: true,
    },
    {
        name: 'Overcast',
        sky: 'linear-gradient(180deg, #3a4048 0%, #505860 30%, #687078 55%, #808890 75%, #989ea6 100%)',
        clouds: true,
    },
];

/* ── Utility ── */
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpVec(a, b, t) { return a.map((v, i) => lerp(v, b[i], t)); }


/* ═══════════════════════════════════════════════════════════════
   ProEnvironment
   ═══════════════════════════════════════════════════════════════ */
export default function ProEnvironment({ enableControls = false, sceneKey = 'gallery', drillStatus = null }) {
    const iframeRef = useRef(null);
    const apiRef = useRef(null);
    const [showPanel, setShowPanel] = useState(false);
    const [activeScene, setActiveScene] = useState(sceneKey);

    // ── Staged loading: hide everything until 3D model is ready ──
    const [viewerReady, setViewerReady] = useState(false);

    // ── Camera Telemetry ──
    const [showTelemetry, setShowTelemetry] = useState(false);
    const [cameraPaused, setCameraPaused] = useState(false);
    const cameraPausedRef = useRef(false);
    const [camPos, setCamPos] = useState([0, 0, 0]);
    const [camTarget, setCamTarget] = useState([0, 0, 0]);
    const telemetryIntervalRef = useRef(null);

    // ── Mouse-look with snap-back ──
    const mouseActiveRef = useRef(false);
    const mouseTimeoutRef = useRef(null);

    // ── Cockpit environment cycling ──
    const [cockpitEnvIdx, setCockpitEnvIdx] = useState(0);

    const modelId = SCENES[activeScene] || SCENES.alley;

    // Refs for rAF loop (avoids re-triggering effects)
    const drillStatusRef = useRef(drillStatus);
    useEffect(() => { drillStatusRef.current = drillStatus; }, [drillStatus]);
    useEffect(() => { cameraPausedRef.current = cameraPaused; }, [cameraPaused]);

    // Reset viewerReady when scene changes
    useEffect(() => { setViewerReady(false); }, [modelId]);

    // ── Auto-close panels when drill becomes active ──
    useEffect(() => {
        if (drillStatus && drillStatus !== 'IDLE') {
            setShowPanel(false);
            setShowTelemetry(false);
        }
    }, [drillStatus]);

    /* ── Camera telemetry polling (500ms) ── */
    useEffect(() => {
        if (showTelemetry && apiRef.current) {
            telemetryIntervalRef.current = setInterval(() => {
                if (apiRef.current) {
                    apiRef.current.getCameraLookAt((err, camera) => {
                        if (!err && camera) {
                            setCamPos(camera.position.map(v => +v.toFixed(4)));
                            setCamTarget(camera.target.map(v => +v.toFixed(4)));
                        }
                    });
                }
            }, 500);
        }
        return () => { if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current); };
    }, [showTelemetry]);

    /* ── Cockpit: random flight-sim environment every 40-60s ── */
    useEffect(() => {
        if (activeScene !== 'cockpit') return;
        setCockpitEnvIdx(Math.floor(Math.random() * COCKPIT_ENVS.length));
        let timeoutId = null;
        const scheduleNext = () => {
            timeoutId = setTimeout(() => {
                setCockpitEnvIdx(prev => {
                    let next;
                    do { next = Math.floor(Math.random() * COCKPIT_ENVS.length); } while (next === prev && COCKPIT_ENVS.length > 1);
                    return next;
                });
                scheduleNext();
            }, 40000 + Math.random() * 20000);
        };
        scheduleNext();
        return () => { if (timeoutId) clearTimeout(timeoutId); };
    }, [activeScene]);

    /* ══════════════════════════════════════════════════════
       Sketchfab Viewer Init + Direct-Drive Camera System

       Key to smooth motion: NO Sketchfab easing at all.
       We compute the exact camera position ourselves every
       ~50ms and set it with transition=0 (instant).
       All smoothness comes from continuous sinusoidal math.
       No dispatch intervals, no overlapping ease curves,
       no bumps — just pure fluid motion.
       ══════════════════════════════════════════════════════ */
    useEffect(() => {
        if (!iframeRef.current) return;

        let rafId = null;
        let cancelled = false;

        let script = document.getElementById('sketchfab-api');
        const initViewer = () => {
            const client = new window.Sketchfab(iframeRef.current);
            client.init(modelId, {
                success: (api) => {
                    apiRef.current = api;
                    api.start();
                    api.addEventListener('viewerready', () => {
                        console.log('Viewer ready:', activeScene);

                        // Read the model's default camera position first
                        api.getCameraLookAt((err, defaultCamera) => {
                            if (err || !defaultCamera) return;

                            const cam = SCENE_CAMERAS[activeScene] || SCENE_CAMERAS.alley;

                            // Resolve posA/targetA — from config or model default
                            const posA = cam.useModelDefault ? [...defaultCamera.position] : cam.posA;
                            const targetA = cam.useModelDefault ? [...defaultCamera.target] : cam.targetA;
                            const posB = cam.posB || posA;
                            const targetB = cam.targetB || targetA;

                            // ── KEY: Set linear easing — no acceleration/deceleration ──
                            // Default is easeOutQuad which causes visible
                            // slow-down bumps at transition boundaries.
                            // easeLinear = constant speed = seamless blending.
                            api.setCameraEasing('easeLinear');

                            // Set initial position instantly, THEN reveal
                            api.setCameraLookAt(posA, targetA, 0);
                            setTimeout(() => {
                                if (!cancelled) setViewerReady(true);
                            }, 400);

                            // ── Chained callback camera system ──
                            // Instead of dispatching on a timer (which creates
                            // interruptions), we use setCameraLookAtEndAnimationCallback
                            // to seamlessly chain: each transition starts the
                            // instant the previous one finishes. Zero gap, zero
                            // interruption, zero bumps.
                            const SEGMENT_S = 4.0; // each segment takes 4s
                            const startTime = Date.now();

                            // Has the one-way travel finished?
                            let arrivedAtB = false;

                            const computeNextTarget = () => {
                                const elapsed = (Date.now() - startTime) / 1000;
                                const futureElapsed = elapsed + SEGMENT_S;
                                const period = cam.period || 30;

                                let t, pos, tgt;

                                if (cam.oneWay) {
                                    // One-way: animate to posB over `period` seconds, then stay
                                    const progress = Math.min(1, futureElapsed / period);
                                    // Smooth ease-in-out
                                    t = progress < 0.5
                                        ? 2 * progress * progress
                                        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                                    if (progress >= 1) arrivedAtB = true;
                                    pos = lerpVec(posA, posB, t);
                                    tgt = lerpVec(targetA, targetB, t);
                                } else {
                                    // Oscillate posA ↔ posB
                                    t = (Math.sin(futureElapsed * (2 * Math.PI / period) - Math.PI / 2) + 1) / 2;
                                    pos = lerpVec(posA, posB, t);
                                    tgt = lerpVec(targetA, targetB, t);
                                }

                                // Smooth breathing: gentle sinusoidal rise/fall
                                // 5.5s cycle (~11 breaths/min, restful)
                                pos[2] += Math.sin(futureElapsed * (2 * Math.PI / 5.5)) * cam.breathAmp;

                                // Horizontal weight-shift sway (very slow)
                                pos[0] += Math.sin(futureElapsed * 0.09 + 0.5) * cam.breathAmp * 1.2;

                                // Look-around: multi-frequency target perturbation
                                tgt[0] += Math.sin(futureElapsed * 0.17 + 1.2) * cam.lookSway
                                         + Math.sin(futureElapsed * 0.41 + 3.0) * cam.lookSway * 0.3;
                                tgt[1] += Math.sin(futureElapsed * 0.23 + 2.5) * cam.lookSway * 0.7
                                         + Math.cos(futureElapsed * 0.31 + 1.0) * cam.lookSway * 0.2;
                                tgt[2] += Math.sin(futureElapsed * 0.13 + 0.7) * cam.lookSway * 0.25;

                                return { pos, tgt };
                            };

                            const dispatchNext = () => {
                                if (cancelled) return;
                                // Pause when: telemetry-paused, user mouse-looking, or target is facing
                                const ds = drillStatusRef.current;
                                const frozen = cameraPausedRef.current
                                    || mouseActiveRef.current
                                    || ds === 'RUNNING'
                                    || ds === 'READY_WAIT';
                                if (frozen) {
                                    setTimeout(dispatchNext, 500);
                                    return;
                                }
                                const { pos, tgt } = computeNextTarget();
                                api.setCameraLookAt(pos, tgt, SEGMENT_S);
                            };

                            // When each transition ends, immediately start the next
                            api.setCameraLookAtEndAnimationCallback(() => {
                                dispatchNext();
                            });

                            // Kick off the first transition after viewer settles
                            setTimeout(() => {
                                if (!cancelled) dispatchNext();
                            }, 600);
                        });
                    });
                },
                error: () => console.error('Sketchfab init failed'),
                autostart: 1,
                ui_stop: 0,
                ui_inspector: 0,
                ui_watermark: 0,
                ui_watermark_link: 0,
                ui_hint: 0,
                ui_ar: 0,
                ui_help: 0,
                ui_settings: 0,
                ui_vr: 0,
                ui_fullscreen: 0,
                ui_annotations: 0,
                ui_infos: 0,
                transparent: 1,
                scrollwheel: 1,
                camera: 0,
            });
        };

        if (!script) {
            script = document.createElement('script');
            script.id = 'sketchfab-api';
            script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
            script.onload = initViewer;
            document.body.appendChild(script);
        } else if (window.Sketchfab) {
            initViewer();
        } else {
            script.addEventListener('load', initViewer);
        }

        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [modelId]);

    /* ── Derived ── */
    const cockpitEnv = COCKPIT_ENVS[cockpitEnvIdx] || COCKPIT_ENVS[0];

    /* ══════════════════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════════════════ */
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'auto',
            background: '#020408',
            overflow: 'hidden'
        }}
            onMouseDown={() => {
                mouseActiveRef.current = true;
                if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
            }}
            onMouseUp={() => {
                if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
                mouseTimeoutRef.current = setTimeout(() => { mouseActiveRef.current = false; }, 3000);
            }}
            onTouchStart={() => {
                mouseActiveRef.current = true;
                if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
            }}
            onTouchEnd={() => {
                if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
                mouseTimeoutRef.current = setTimeout(() => { mouseActiveRef.current = false; }, 3000);
            }}
        >

            {/* ══════════════════════════════════════════════════
                 STAGED SCENE — everything fades in together
                 once the Sketchfab viewer is ready.
                 ══════════════════════════════════════════════════ */}
            <div style={{
                position: 'absolute', inset: 0,
                opacity: viewerReady ? 1 : 0,
                transition: 'opacity 0.8s ease',
            }}>

                {/* ── ALLEY: HDR-style sky with volumetric clouds ── */}
                {activeScene === 'alley' && (
                    <>
                        {/* Sky gradient — richer HDR tones */}
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: -3,
                            background: 'linear-gradient(180deg, #062a6e 0%, #0e4fa8 12%, #1a6fc4 25%, #3a96e0 42%, #6ab4f0 58%, #9ad0fa 74%, #c8e6ff 88%, #e8f4ff 100%)',
                        }} />

                        {/* Haze layer — atmospheric depth near horizon */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: '35%', zIndex: -2,
                            background: 'linear-gradient(180deg, transparent 0%, rgba(200,220,245,0.08) 40%, rgba(200,220,245,0.15) 100%)',
                        }} />

                        {/* Sheet cloud layers (parallax scroll) */}
                        <div style={{
                            position: 'absolute', top: '5%', left: 0,
                            width: '300%', height: '40%', zIndex: -2, opacity: 0.55,
                            background: `repeating-linear-gradient(95deg,
                                transparent 0%, rgba(255,255,255,0.06) 3%,
                                rgba(255,255,255,0.14) 6%, rgba(255,255,255,0.08) 9%,
                                transparent 15%, rgba(255,255,255,0.04) 20%,
                                rgba(255,255,255,0.10) 24%, transparent 33.33%)`,
                            animation: 'skyScroll 200s linear infinite',
                        }} />
                        <div style={{
                            position: 'absolute', top: '12%', left: 0,
                            width: '400%', height: '30%', zIndex: -2, opacity: 0.35,
                            background: `repeating-linear-gradient(88deg,
                                transparent 0%, rgba(255,255,255,0.04) 4%,
                                rgba(255,255,255,0.10) 8%, rgba(255,255,255,0.05) 12%,
                                transparent 20%, rgba(255,255,255,0.06) 25%, transparent 28%)`,
                            animation: 'skyScroll2 280s linear infinite',
                        }} />

                        {/* Individual cloud puffs — varying depth, size, speed */}
                        <div style={{ position: 'absolute', inset: 0, zIndex: -2, overflow: 'hidden', pointerEvents: 'none' }}>
                            {Array.from({ length: 14 }).map((_, i) => {
                                const w = 100 + (i * 47) % 180;
                                const h = w * (0.28 + (i % 4) * 0.06);
                                const top = 3 + (i * 11) % 28;
                                const speed = 140 + (i * 31) % 200;
                                const delay = (i * 19) % 80;
                                const opacity = 0.12 + (i % 6) * 0.04;
                                const blur = 10 + (i % 4) * 6;
                                return (
                                    <div key={`cloud-${i}`} style={{
                                        position: 'absolute',
                                        top: `${top}%`,
                                        left: '-200px',
                                        width: w,
                                        height: h,
                                        borderRadius: '50%',
                                        background: `radial-gradient(ellipse at ${40 + (i % 3) * 10}% 50%,
                                            rgba(255,255,255,${0.35 + (i % 3) * 0.1}) 0%,
                                            rgba(255,255,255,0.12) 35%,
                                            transparent 70%)`,
                                        filter: `blur(${blur}px)`,
                                        opacity,
                                        animation: `cloudDrift ${speed}s linear infinite`,
                                        animationDelay: `-${delay}s`,
                                    }} />
                                );
                            })}
                        </div>
                    </>
                )}

                {/* ── COCKPIT: Cycling flight-sim exterior ── */}
                {activeScene === 'cockpit' && (
                    <>
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: -3,
                            background: cockpitEnv.sky,
                            transition: 'background 3s ease',
                        }} />
                        {cockpitEnv.stars && (
                            <div style={{ position: 'absolute', inset: 0, zIndex: -2, overflow: 'hidden', pointerEvents: 'none' }}>
                                {Array.from({ length: 80 }).map((_, i) => (
                                    <div key={`star-${i}`} style={{
                                        position: 'absolute',
                                        left: `${(i * 37 + i * i * 7) % 100}%`,
                                        top: `${(i * 23 + i * i * 3) % 70}%`,
                                        width: 1 + (i % 3),
                                        height: 1 + (i % 3),
                                        borderRadius: '50%',
                                        background: '#fff',
                                        opacity: 0.2 + ((i * 7) % 8) / 10,
                                        animation: `starTwinkle ${2 + (i % 5)}s ease-in-out infinite alternate`,
                                        animationDelay: `${(i * 0.4) % 4}s`,
                                    }} />
                                ))}
                            </div>
                        )}
                        {cockpitEnv.clouds && (
                            <div style={{
                                position: 'absolute', top: '10%', left: 0,
                                width: '400%', height: '50%', zIndex: -2, opacity: 0.6,
                                background: `repeating-linear-gradient(92deg,
                                    transparent 0%, rgba(255,255,255,0.05) 3%,
                                    rgba(255,255,255,0.15) 7%, rgba(255,255,255,0.08) 10%,
                                    transparent 16%, rgba(255,255,255,0.10) 22%, transparent 25%)`,
                                animation: 'skyScroll 80s linear infinite',
                            }} />
                        )}
                        {cockpitEnv.lightning && (
                            <div style={{
                                position: 'absolute', inset: 0, zIndex: -2, pointerEvents: 'none',
                                background: 'rgba(200,210,255,0.15)',
                                animation: 'lightningFlash 8s ease-in-out infinite',
                            }} />
                        )}
                        {cockpitEnv.rain && (
                            <div style={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
                                {Array.from({ length: 100 }).map((_, i) => (
                                    <div key={`crain-${i}`} style={{
                                        position: 'absolute',
                                        left: `${(i * 17) % 100}%`,
                                        top: `-${(i * 7) % 20}%`,
                                        width: 1.5,
                                        height: 18 + (i % 8) * 3,
                                        background: 'linear-gradient(180deg, transparent, rgba(160,180,220,0.3))',
                                        animation: `rainFall ${0.3 + (i % 5) * 0.06}s linear infinite`,
                                        animationDelay: `${(i * 0.13) % 2}s`,
                                        opacity: 0.2 + (i % 4) * 0.08,
                                        transform: `rotate(${-3 + (i % 7)}deg)`,
                                    }} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── SUBWAY: Dark tunnel background (lights are in foreground) ── */}
                {activeScene === 'subway' && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: -3, background: '#060608' }} />
                )}

                {/* ═══ SKETCHFAB IFRAME ═══ */}
                <iframe
                    key={modelId}
                    ref={iframeRef}
                    id="viewer"
                    width="100%"
                    height="100%"
                    allow="fullscreen; xr-spatial-tracking; autoplay"
                    style={{
                        border: 'none',
                        transform: 'scale(1.02)',
                    }}
                    title="3D Environment"
                ></iframe>

                {/* ═══ FOREGROUND EFFECTS (on top of iframe) ═══ */}

                {/* ── COURTROOM: Sunlight entering from upper-left windows ── */}
                {activeScene === 'courtroom' && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
                        {/* Primary beam — strong, from upper-left */}
                        <div style={{
                            position: 'absolute', top: '-15%', left: '5%',
                            width: '25%', height: '130%',
                            background: 'linear-gradient(200deg, rgba(255,220,150,0.12) 0%, rgba(255,210,130,0.06) 30%, transparent 55%)',
                            transform: 'rotate(25deg)',
                            transformOrigin: 'top left',
                            animation: 'sunBeamPulse 8s ease-in-out infinite alternate',
                        }} />
                        {/* Secondary beam — narrower */}
                        <div style={{
                            position: 'absolute', top: '-10%', left: '18%',
                            width: '18%', height: '125%',
                            background: 'linear-gradient(205deg, rgba(255,230,160,0.09) 0%, rgba(255,215,140,0.04) 35%, transparent 55%)',
                            transform: 'rotate(28deg)',
                            transformOrigin: 'top left',
                            animation: 'sunBeamPulse 10s ease-in-out infinite alternate-reverse',
                        }} />
                        {/* Tertiary beam — soft, wide */}
                        <div style={{
                            position: 'absolute', top: '-20%', left: '-3%',
                            width: '14%', height: '135%',
                            background: 'linear-gradient(195deg, rgba(255,225,155,0.06) 0%, rgba(255,220,140,0.03) 30%, transparent 50%)',
                            transform: 'rotate(22deg)',
                            transformOrigin: 'top left',
                            animation: 'sunBeamPulse 12s ease-in-out infinite alternate',
                        }} />
                        {/* Warm glow source — upper-left corner */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: 'radial-gradient(ellipse 60% 50% at 10% 15%, rgba(255,200,100,0.06) 0%, transparent 65%)',
                        }} />
                        {/* Dust motes floating in the light path */}
                        {Array.from({ length: 18 }).map((_, i) => (
                            <div key={`dust-${i}`} style={{
                                position: 'absolute',
                                left: `${5 + (i * 4) % 35}%`,
                                top: `${10 + (i * 7) % 60}%`,
                                width: 2, height: 2, borderRadius: '50%',
                                background: 'rgba(255,220,150,0.4)',
                                animation: `dustFloat ${6 + (i % 4) * 2}s ease-in-out infinite`,
                                animationDelay: `${(i * 0.8) % 6}s`,
                                opacity: 0.3 + (i % 5) * 0.1,
                            }} />
                        ))}
                    </div>
                )}

                {/* ── SUBWAY: Passing tunnel lights (vertical, outside windows) ── */}
                {activeScene === 'subway' && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
                        {/* Left-side window lights */}
                        {Array.from({ length: 6 }).map((_, i) => {
                            const isWarm = i % 2 === 0;
                            const leftPos = 2 + (i * 3) % 12;
                            const w = 1.5 + (i % 3);
                            const duration = 0.3 + (i % 4) * 0.1;
                            const delay = (i * 0.7) % 4;
                            return (
                                <div key={`tl-l-${i}`} style={{
                                    position: 'absolute', left: `${leftPos}%`, top: 0,
                                    width: w, height: '15vh',
                                    background: isWarm
                                        ? 'linear-gradient(180deg, transparent, rgba(255,200,100,0.15), rgba(255,180,80,0.25), rgba(255,200,100,0.15), transparent)'
                                        : 'linear-gradient(180deg, transparent, rgba(120,160,255,0.10), rgba(100,140,240,0.20), rgba(120,160,255,0.10), transparent)',
                                    animation: `trainLightPass ${duration}s linear infinite`,
                                    animationDelay: `${delay}s`,
                                    borderRadius: 2, opacity: 0.6,
                                }} />
                            );
                        })}
                        {/* Right-side window lights */}
                        {Array.from({ length: 6 }).map((_, i) => {
                            const isWarm = i % 2 === 1;
                            const rightPos = 2 + (i * 3) % 12;
                            const w = 1.5 + (i % 3);
                            const duration = 0.3 + (i % 4) * 0.1;
                            const delay = (i * 0.6) % 4;
                            return (
                                <div key={`tl-r-${i}`} style={{
                                    position: 'absolute', right: `${rightPos}%`, top: 0,
                                    width: w, height: '15vh',
                                    background: isWarm
                                        ? 'linear-gradient(180deg, transparent, rgba(255,200,100,0.15), rgba(255,180,80,0.25), rgba(255,200,100,0.15), transparent)'
                                        : 'linear-gradient(180deg, transparent, rgba(120,160,255,0.10), rgba(100,140,240,0.20), rgba(120,160,255,0.10), transparent)',
                                    animation: `trainLightPass ${duration}s linear infinite`,
                                    animationDelay: `${delay}s`,
                                    borderRadius: 2, opacity: 0.6,
                                }} />
                            );
                        })}
                        {/* Periodic station flash */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: 'rgba(255,240,200,0.03)',
                            animation: 'stationFlash 12s ease-in-out infinite',
                        }} />
                    </div>
                )}

            </div>{/* end staged scene */}

            {/* ── Loading indicator (visible while viewer loads) ── */}
            {!viewerReady && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 5,
                }}>
                    <div style={{
                        fontFamily: 'monospace', fontSize: 11,
                        color: '#555', textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}>
                        Loading Environment…
                    </div>
                </div>
            )}


            {/* ═══ CAMERA TELEMETRY HUD (top-left) — hidden during drills ═══ */}
            {(!drillStatus || drillStatus === 'IDLE') && (
            <div style={{
                position: 'absolute', top: 20, left: 20,
                zIndex: 100, pointerEvents: 'auto',
            }}>
                <button
                    onClick={() => setShowTelemetry(!showTelemetry)}
                    style={{
                        background: showTelemetry ? 'rgba(59,130,246,0.3)' : 'rgba(0,0,0,0.7)',
                        border: showTelemetry ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.15)',
                        color: showTelemetry ? '#60a5fa' : '#fff',
                        padding: '8px 14px', borderRadius: 6,
                        cursor: 'pointer', fontSize: 12, fontFamily: 'monospace',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}
                >
                    📐 Camera XYZ
                </button>

                {showTelemetry && (
                    <div style={{
                        position: 'absolute', top: 44, left: 0,
                        background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: 8, padding: 16, minWidth: 280,
                        fontFamily: 'monospace', fontSize: 12,
                    }}>
                        <button
                            onClick={() => setCameraPaused(!cameraPaused)}
                            style={{
                                width: '100%', marginBottom: 12,
                                background: cameraPaused ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                                border: cameraPaused ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(16,185,129,0.4)',
                                color: cameraPaused ? '#f87171' : '#10b981',
                                padding: '8px 12px', borderRadius: 4,
                                cursor: 'pointer', fontSize: 11, fontFamily: 'monospace',
                                textTransform: 'uppercase', letterSpacing: '0.15em',
                            }}
                        >
                            {cameraPaused ? '⏸ PAUSED — Orbit freely' : '▶ AUTO-CAMERA ACTIVE'}
                        </button>
                        <div style={{ marginBottom: 10 }}>
                            <div style={{ color: '#60a5fa', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Camera Position</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: '2px 8px', color: '#ccc' }}>
                                <span style={{ color: '#ef4444' }}>X</span><span>{camPos[0]}</span>
                                <span style={{ color: '#22c55e' }}>Y</span><span>{camPos[1]}</span>
                                <span style={{ color: '#3b82f6' }}>Z</span><span>{camPos[2]}</span>
                            </div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <div style={{ color: '#f59e0b', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Look Target</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: '2px 8px', color: '#ccc' }}>
                                <span style={{ color: '#ef4444' }}>X</span><span>{camTarget[0]}</span>
                                <span style={{ color: '#22c55e' }}>Y</span><span>{camTarget[1]}</span>
                                <span style={{ color: '#3b82f6' }}>Z</span><span>{camTarget[2]}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => { navigator.clipboard.writeText(`Position: [${camPos.join(', ')}]\nTarget: [${camTarget.join(', ')}]`); }}
                            style={{
                                width: '100%', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', color: '#888',
                                padding: '6px 10px', borderRadius: 4, cursor: 'pointer',
                                fontSize: 10, fontFamily: 'monospace',
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                            }}
                        >📋 Copy Coordinates</button>
                    </div>
                )}
            </div>
            )}


            {/* ═══ ENVIRONMENT HUD TRIGGER (bottom-right) — hidden during drills ═══ */}
            {(!drillStatus || drillStatus === 'IDLE') && (
            <>
            <div style={{
                position: 'absolute', bottom: 20, right: 20,
                zIndex: 100, pointerEvents: 'auto',
            }}>
                <button
                    onClick={() => setShowPanel(!showPanel)}
                    style={{
                        background: showPanel ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: showPanel ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.12)',
                        color: showPanel ? '#34d399' : '#d4d4d8',
                        padding: '10px 18px',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'all 0.3s ease',
                    }}
                >
                    <span style={{
                        display: 'inline-block', width: 6, height: 6,
                        background: showPanel ? '#34d399' : '#71717a',
                        boxShadow: showPanel ? '0 0 8px rgba(52,211,153,0.6)' : 'none',
                        transition: 'all 0.3s',
                    }} />
                    Environment
                </button>
            </div>

            {/* ═══ FULL-SCREEN ENVIRONMENT HUD ═══ */}
            {showPanel && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 200,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        animation: 'hudFadeIn 0.25s ease-out',
                        pointerEvents: 'auto',
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowPanel(false); }}
                    onKeyDown={(e) => { if (e.key === 'Escape') setShowPanel(false); }}
                >
                    {/* ── HUD Glass Panel ── */}
                    <div style={{
                        position: 'relative',
                        background: 'rgba(6,10,18,0.88)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        border: '1px solid rgba(16,185,129,0.12)',
                        maxWidth: 680,
                        width: '92vw',
                        padding: '2rem 2.5rem 2rem',
                        overflow: 'hidden',
                    }}>
                        {/* ── Animated scan line ── */}
                        <div style={{
                            position: 'absolute', left: 0, right: 0,
                            height: 1,
                            background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.2), transparent)',
                            animation: 'hudScanLine 4s linear infinite',
                            pointerEvents: 'none',
                        }} />

                        {/* ── Corner accent markers ── */}
                        {/* Top-left */}
                        <div style={{ position: 'absolute', top: -1, left: -1, width: 16, height: 16, borderTop: '2px solid rgba(16,185,129,0.5)', borderLeft: '2px solid rgba(16,185,129,0.5)' }} />
                        {/* Top-right */}
                        <div style={{ position: 'absolute', top: -1, right: -1, width: 16, height: 16, borderTop: '2px solid rgba(16,185,129,0.5)', borderRight: '2px solid rgba(16,185,129,0.5)' }} />
                        {/* Bottom-left */}
                        <div style={{ position: 'absolute', bottom: -1, left: -1, width: 16, height: 16, borderBottom: '2px solid rgba(16,185,129,0.2)', borderLeft: '2px solid rgba(16,185,129,0.2)' }} />
                        {/* Bottom-right */}
                        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 16, height: 16, borderBottom: '2px solid rgba(16,185,129,0.2)', borderRight: '2px solid rgba(16,185,129,0.2)' }} />

                        {/* ── Header row ── */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginBottom: 24, paddingBottom: 16,
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 8, height: 8, background: '#34d399',
                                    boxShadow: '0 0 12px rgba(52,211,153,0.6)',
                                }} />
                                <span style={{
                                    fontFamily: 'monospace', fontSize: 11,
                                    color: '#34d399', textTransform: 'uppercase',
                                    letterSpacing: '0.25em', fontWeight: 700,
                                }}>Environment Control</span>
                            </div>
                            <button
                                onClick={() => setShowPanel(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: '#71717a', padding: '6px 14px',
                                    cursor: 'pointer', fontFamily: 'monospace',
                                    fontSize: 10, textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                                onMouseLeave={(e) => { e.target.style.color = '#71717a'; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                            >ESC ✕</button>
                        </div>

                        {/* ── 3D Stage Grid ── */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{
                                fontFamily: 'monospace', fontSize: 9, color: '#52525b',
                                textTransform: 'uppercase', letterSpacing: '0.3em',
                                marginBottom: 12,
                            }}>3D Stage</div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 6,
                            }}>
                                {Object.keys(SCENES).map(key => {
                                    const isActive = activeScene === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => { setActiveScene(key); setShowPanel(false); }}
                                            style={{
                                                position: 'relative',
                                                background: isActive
                                                    ? 'rgba(16,185,129,0.08)'
                                                    : 'rgba(255,255,255,0.02)',
                                                backdropFilter: 'blur(4px)',
                                                border: isActive
                                                    ? '1px solid rgba(16,185,129,0.35)'
                                                    : '1px solid rgba(255,255,255,0.05)',
                                                color: isActive ? '#34d399' : '#a1a1aa',
                                                padding: '14px 10px',
                                                cursor: 'pointer',
                                                fontFamily: 'monospace',
                                                fontSize: 11,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.12em',
                                                transition: 'all 0.2s ease',
                                                overflow: 'hidden',
                                                textAlign: 'center',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                                    e.currentTarget.style.color = '#e4e4e7';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                                    e.currentTarget.style.color = '#a1a1aa';
                                                }
                                            }}
                                        >
                                            {/* Active top-edge glow */}
                                            {isActive && (
                                                <div style={{
                                                    position: 'absolute', top: 0, left: '10%', right: '10%',
                                                    height: 2,
                                                    background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.6), transparent)',
                                                }} />
                                            )}
                                            {/* Active corner dots */}
                                            {isActive && (
                                                <>
                                                    <div style={{ position: 'absolute', top: 3, left: 3, width: 3, height: 3, background: 'rgba(52,211,153,0.5)' }} />
                                                    <div style={{ position: 'absolute', top: 3, right: 3, width: 3, height: 3, background: 'rgba(52,211,153,0.5)' }} />
                                                </>
                                            )}
                                            {key}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Voice Selection ── */}
                        <div style={{
                            marginBottom: 24, paddingTop: 20,
                            borderTop: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <div style={{
                                fontFamily: 'monospace', fontSize: 9, color: '#52525b',
                                textTransform: 'uppercase', letterSpacing: '0.3em',
                                marginBottom: 12,
                            }}>Range Officer Voice</div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 6,
                            }}>
                                {[
                                    { k: 'male-us', l: 'Male (US)' }, { k: 'female-us', l: 'Female (US)' },
                                    { k: 'male-gb', l: 'Male (UK)' }, { k: 'female-gb', l: 'Female (UK)' },
                                    { k: 'male-au', l: 'Male (AU)' }, { k: 'female-au', l: 'Female (AU)' },
                                ].map(v => {
                                    const isActiveVoice = audio.voice === v.k;
                                    return (
                                        <button
                                            key={v.k}
                                            onClick={() => {
                                                audio.setVoice(v.k);
                                                setActiveScene(prev => prev + ' ');
                                                setTimeout(() => setActiveScene(prev => prev.trim()), 0);
                                            }}
                                            style={{
                                                background: isActiveVoice
                                                    ? 'rgba(16,185,129,0.08)'
                                                    : 'rgba(255,255,255,0.02)',
                                                border: isActiveVoice
                                                    ? '1px solid rgba(16,185,129,0.3)'
                                                    : '1px solid rgba(255,255,255,0.05)',
                                                color: isActiveVoice ? '#34d399' : '#a1a1aa',
                                                padding: '10px 8px',
                                                cursor: 'pointer',
                                                fontFamily: 'monospace',
                                                fontSize: 10,
                                                letterSpacing: '0.08em',
                                                transition: 'all 0.2s ease',
                                                textAlign: 'center',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActiveVoice) {
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                                    e.currentTarget.style.color = '#e4e4e7';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActiveVoice) {
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                                    e.currentTarget.style.color = '#a1a1aa';
                                                }
                                            }}
                                        >{v.l}</button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Cast ── */}
                        <div style={{
                            paddingTop: 16,
                            borderTop: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <button
                                onClick={() => {
                                    if ('presentation' in navigator && navigator.presentation.defaultRequest) {
                                        navigator.presentation.defaultRequest.start().catch(() => {});
                                    } else {
                                        alert('Use your browser\'s Cast button (⋮ → Cast) to stream to Chromecast');
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    color: '#71717a',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    fontFamily: 'monospace',
                                    fontSize: 11,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.2em',
                                    transition: 'all 0.2s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)';
                                    e.currentTarget.style.color = '#34d399';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.color = '#71717a';
                                }}
                            >📺 Cast to TV</button>
                        </div>

                        {/* ── Bottom status bar ── */}
                        <div style={{
                            marginTop: 20, paddingTop: 12,
                            borderTop: '1px solid rgba(255,255,255,0.03)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <span style={{
                                fontFamily: 'monospace', fontSize: 9, color: '#3f3f46',
                                textTransform: 'uppercase', letterSpacing: '0.2em',
                            }}>Active: {activeScene}</span>
                            <span style={{
                                fontFamily: 'monospace', fontSize: 9, color: '#3f3f46',
                                textTransform: 'uppercase', letterSpacing: '0.2em',
                            }}>PRO</span>
                        </div>
                    </div>
                </div>
            )}
            </>
            )}


            {/* ═══ CSS ANIMATIONS ═══ */}
            <style>{`
                @keyframes humanBreathViewport {
                    0%   { transform: scale(1.04) translate3d(0, 0, 0); }
                    50%  { transform: scale(1.04) translate3d(0, -0.5px, 0); }
                    100% { transform: scale(1.04) translate3d(0, 0, 0); }
                }
                @keyframes skyScroll {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                @keyframes cloudDrift {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(calc(100vw + 400px)); }
                }
                @keyframes skyScroll2 {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-25%); }
                }
                @keyframes rainFall {
                    0%   { transform: translateY(0); }
                    100% { transform: translateY(110vh); }
                }
                @keyframes lightningFlash {
                    0%   { opacity: 0; }
                    1%   { opacity: 0.8; }
                    2%   { opacity: 0; }
                    3%   { opacity: 0.5; }
                    4%   { opacity: 0; }
                    50%  { opacity: 0; }
                    51%  { opacity: 0.6; }
                    52%  { opacity: 0; }
                    100% { opacity: 0; }
                }
                @keyframes starTwinkle {
                    0%   { opacity: 0.15; }
                    100% { opacity: 1; }
                }
                @keyframes trainLightPass {
                    0%   { transform: translateY(-15vh); }
                    100% { transform: translateY(110vh); }
                }
                @keyframes stationFlash {
                    0%   { opacity: 0; }
                    8%   { opacity: 1; }
                    12%  { opacity: 0.8; }
                    15%  { opacity: 0; }
                    100% { opacity: 0; }
                }
                @keyframes sunBeamPulse {
                    0%   { opacity: 0.6; }
                    100% { opacity: 1; }
                }
                @keyframes dustFloat {
                    0%   { transform: translate(0, 0); opacity: 0.3; }
                    25%  { transform: translate(3px, -6px); opacity: 0.6; }
                    50%  { transform: translate(-2px, -10px); opacity: 0.4; }
                    75%  { transform: translate(4px, -4px); opacity: 0.7; }
                    100% { transform: translate(0, 0); opacity: 0.3; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
                @keyframes hudFadeIn {
                    0%   { opacity: 0; transform: scale(0.97); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes hudScanLine {
                    0%   { top: -2px; }
                    100% { top: 100%; }
                }
            `}</style>
        </div>
    );
}
