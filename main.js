gsap.registerPlugin(ScrollTrigger);
let paused = false;
gsap.from('.line span', { yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'power4.out' });
gsap.from('.chip, .hero p, .actions', { opacity: 0, y: 24, stagger: 0.12, duration: 0.9, delay: 0.5 });

const blobTweens = [
    gsap.to('#b1', { x: '18vmax', y: '14vmax', duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
    gsap.to('#b2', { x: '-16vmax', y: '-12vmax', duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut' })
];


const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.z = 8;

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(3, 4, 5);
scene.add(sun);

const globe = new THREE.Group();

const glass = new THREE.Mesh(
    new THREE.SphereGeometry(2, 48, 32),
    new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, shininess: 140, specular: 0xffffff })
);

const wireMat = new THREE.LineBasicMaterial({ color: 0xff3d81, transparent: true, opacity: 0.5 });
const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(2.01, 24, 16)), wireMat);

const dotMat = new THREE.PointsMaterial({ color: 0xff3d81, size: 0.1 });
const pts = [];
for (let i = 0; i < 90; i++) {
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    pts.push(Math.cos(a) * r * 2.05, u * 2.05, Math.sin(a) * r * 2.05);
}
const dotGeo = new THREE.BufferGeometry();
dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
const dots = new THREE.Points(dotGeo, dotMat);

const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3d81, transparent: true, opacity: 0.6 });
const ring = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.025, 12, 100), ringMat);
ring.rotation.x = Math.PI / 2.4;

globe.add(glass, wire, dots, ring);
const outer = new THREE.Group();
outer.add(globe);
scene.add(outer);

let wide = true;
function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    wide = innerWidth > 800;
    outer.scale.setScalar(wide ? 1.15 : 0.8);
    
}
addEventListener('resize', resize);
resize();

gsap.ticker.add((t) => {
    if (!paused) {
        globe.rotation.y += 0.004;
        ring.rotation.z += 0.006;
    }
    globe.rotation.x = 0.25 + Math.sin(t * 0.6) * 0.06;
    renderer.render(scene, camera);
});

/* globe travels with the scroll */
const k = () => (wide ? 1 : 0.3);
outer.position.set(2.5 * k(), 0, 0);
gsap.timeline({ scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 } })
    .to(outer.position, { x: () => -2.6 * k(), duration: 1, ease: 'none' }, 0)
    .to(outer.position, { x: () => 2.6 * k(), duration: 1, ease: 'none' }, 1)
    .to(outer.position, { x: 0, duration: 1, ease: 'none' }, 2);

/* colour change per section */
document.querySelectorAll('[data-bg]').forEach((s) => {
    const apply = () => {
        const d = s.dataset;
        const c = new THREE.Color(d.accent);
        gsap.to(document.body, { backgroundColor: d.bg, duration: 0.8, overwrite: 'auto' });
        gsap.to('#b1', { backgroundColor: d.b1, duration: 1, overwrite: 'auto' });
        gsap.to('#b2', { backgroundColor: d.b2, duration: 1, overwrite: 'auto' });
        document.documentElement.style.setProperty('--accent', d.accent);
        [wireMat, dotMat, ringMat].forEach((m) =>
            gsap.to(m.color, { r: c.r, g: c.g, b: c.b, duration: 0.8, overwrite: 'auto' })
        );
    };
    ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onEnter: apply, onEnterBack: apply });
});

/* music cards (sample data) */
const tracks = [
    ['Midnight Sun', '2026', ['#ff3d81', '#ffb347']],
    ['Glass Hearts', '2026', ['#2f6bff', '#8ee3ff']],
    ['Slow Motion', '2025', ['#9b5cff', '#ff9ad5']],
    ['Golden Hour', '2024', ['#ffb800', '#ff5e62']]
];

document.getElementById('cards').innerHTML = tracks.map((t) => `
    <div class="card glass">
        <div class="art" style="background:linear-gradient(135deg,${t[2][0]},${t[2][1]})"></div>
        <h3>${t[0]}</h3>
        <small>${t[1]}</small>
        <div class="pills"><i>Spotify</i><i>YouTube</i><i>Apple</i></div>
    </div>`).join('');

gsap.from('.card', { y: 90, scale: 0.8, rotation: -4, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '#cards', start: 'top 82%' } });

/* shows (sample data) */
const shows = [
    ['NOV 05', 'Neon Arena', 'Lagos, Nigeria'],
    ['NOV 12', 'Sunset Hall', 'Accra, Ghana'],
    ['DEC 08', 'Crystal Dome', 'Nairobi, Kenya'],
    ['DEC 18', 'Aurora Festival', 'Cape Town, South Africa']
];

document.getElementById('shows').innerHTML = shows.map((s) => `
    <div class="row glass">
        <b>${s[0]}</b>
        <div><h3>${s[1]}</h3><small>${s[2]}</small></div>
        <a class="btn" href="#join">Tickets</a>
    </div>`).join('');

gsap.from('.row', { x: -80, opacity: 0, stagger: 0.14, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#shows', start: 'top 82%' } });

gsap.from('#join h2, #join .sub, .signup', { y: 50, opacity: 0, stagger: 0.12, duration: 0.9,
    scrollTrigger: { trigger: '#join', start: 'top 65%' } });

const pauseBtn = document.getElementById('pause');
pauseBtn.addEventListener('click', () => {
    paused = !paused;
    blobTweens.forEach((t) => (paused ? t.pause() : t.resume()));
    pauseBtn.textContent = paused ? 'Play animation' : 'Pause animation';
});