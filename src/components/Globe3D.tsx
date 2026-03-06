"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════════
//  Globe3D — Interactive 3D Globe with Network Connections
//  Scroll-responsive + mouse-interactive
//  Avalanche-themed background animation for Sha(vax)re
// ═══════════════════════════════════════════════════════════════

interface GlobePoint {
    lat: number;
    lng: number;
    mesh?: THREE.Mesh;
}

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

// University/education hub locations worldwide
const EDUCATION_HUBS: GlobePoint[] = [
    { lat: 41.0082, lng: 28.9784 },   // Istanbul
    { lat: 40.7128, lng: -74.006 },    // New York
    { lat: 51.5074, lng: -0.1278 },    // London
    { lat: 48.8566, lng: 2.3522 },     // Paris
    { lat: 35.6762, lng: 139.6503 },   // Tokyo
    { lat: -33.8688, lng: 151.2093 },  // Sydney
    { lat: 1.3521, lng: 103.8198 },    // Singapore
    { lat: 19.4326, lng: -99.1332 },   // Mexico City
    { lat: -23.5505, lng: -46.6333 },  // Sao Paulo
    { lat: 55.7558, lng: 37.6173 },    // Moscow
    { lat: 28.6139, lng: 77.209 },     // New Delhi
    { lat: 37.5665, lng: 126.978 },    // Seoul
    { lat: 39.9042, lng: 116.4074 },   // Beijing
    { lat: -1.2921, lng: 36.8219 },    // Nairobi
    { lat: 30.0444, lng: 31.2357 },    // Cairo
    { lat: 52.52, lng: 13.405 },       // Berlin
    { lat: 43.6532, lng: -79.3832 },   // Toronto
    { lat: 37.7749, lng: -122.4194 },  // San Francisco
    { lat: -34.6037, lng: -58.3816 },  // Buenos Aires
    { lat: 59.3293, lng: 18.0686 },    // Stockholm
];

export default function Globe3D() {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const frameRef = useRef<number>(0);
    const scrollRef = useRef<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // ─── Scene Setup ───
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 4.5;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // ─── Globe Group ───
        const globeGroup = new THREE.Group();
        scene.add(globeGroup);

        // ─── Wireframe Globe ───
        const globeGeometry = new THREE.SphereGeometry(1.5, 36, 36);
        const globeMaterial = new THREE.MeshBasicMaterial({
            color: 0xe84142,
            wireframe: true,
            transparent: true,
            opacity: 0.07,
        });
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        globeGroup.add(globe);

        // ─── Globe Outline Ring ───
        const ringGeometry = new THREE.RingGeometry(1.52, 1.54, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xe84142,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        globeGroup.add(ring);

        // ─── Atmosphere Glow ───
        const atmosphereGeometry = new THREE.SphereGeometry(1.6, 36, 36);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                    gl_FragColor = vec4(0.91, 0.255, 0.259, intensity * 0.4);
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true,
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        globeGroup.add(atmosphere);

        // ─── Education Hub Points ───
        const pointGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const pointMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6b6b,
        });

        const points: THREE.Mesh[] = [];
        EDUCATION_HUBS.forEach((hub) => {
            const point = new THREE.Mesh(pointGeometry, pointMaterial.clone());
            const pos = latLngToVector3(hub.lat, hub.lng, 1.52);
            point.position.copy(pos);
            globeGroup.add(point);
            points.push(point);
            hub.mesh = point;
        });

        // ─── Network Connection Lines ───
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xe84142,
            transparent: true,
            opacity: 0.12,
        });

        const connections: [number, number][] = [
            [0, 2],   // Istanbul - London
            [0, 14],  // Istanbul - Cairo
            [1, 17],  // New York - San Francisco
            [1, 16],  // New York - Toronto
            [1, 2],   // New York - London
            [2, 3],   // London - Paris
            [2, 15],  // London - Berlin
            [3, 15],  // Paris - Berlin
            [4, 11],  // Tokyo - Seoul
            [4, 12],  // Tokyo - Beijing
            [6, 10],  // Singapore - New Delhi
            [7, 8],   // Mexico City - Sao Paulo
            [8, 18],  // Sao Paulo - Buenos Aires
            [10, 12], // New Delhi - Beijing
            [13, 14], // Nairobi - Cairo
            [15, 19], // Berlin - Stockholm
            [9, 15],  // Moscow - Berlin
        ];

        connections.forEach(([i, j]) => {
            const start = latLngToVector3(EDUCATION_HUBS[i].lat, EDUCATION_HUBS[i].lng, 1.52);
            const end = latLngToVector3(EDUCATION_HUBS[j].lat, EDUCATION_HUBS[j].lng, 1.52);

            const mid = new THREE.Vector3()
                .addVectors(start, end)
                .multiplyScalar(0.5)
                .normalize()
                .multiplyScalar(1.52 + start.distanceTo(end) * 0.15);

            const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
            const curvePoints = curve.getPoints(20);
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
            const line = new THREE.Line(lineGeometry, lineMaterial.clone());
            globeGroup.add(line);
        });

        // ─── Floating Particles ───
        const particleCount = 80;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1.7 + Math.random() * 0.8;

            particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            particlePositions[i * 3 + 2] = r * Math.cos(phi);
            particleSizes[i] = Math.random() * 2 + 0.5;
        }

        particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xe84142,
            size: 0.015,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        globeGroup.add(particles);

        // ─── Lighting ───
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        // ─── Mouse Interaction ───
        let mouseX = 0;
        let mouseY = 0;

        const onMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener("mousemove", onMouseMove);

        // ─── Scroll Tracking ───
        const onScroll = () => {
            const heroHeight = window.innerHeight;
            scrollRef.current = Math.min(window.scrollY / heroHeight, 1);
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        // ─── Animation Loop ───
        let time = 0;
        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);
            time += 0.003;

            const scrollProgress = scrollRef.current;

            // Scroll-responsive: globe shifts right and scales down as user scrolls
            const targetX = scrollProgress * 2.5;
            const targetScale = 1 - scrollProgress * 0.3;
            const targetZ = 4.5 + scrollProgress * 2;

            globeGroup.position.x += (targetX - globeGroup.position.x) * 0.05;
            globeGroup.scale.setScalar(
                globeGroup.scale.x + (targetScale - globeGroup.scale.x) * 0.05
            );
            camera.position.z += (targetZ - camera.position.z) * 0.05;

            // Scroll speeds up rotation slightly
            const rotationSpeed = 0.3 + scrollProgress * 0.5;
            globeGroup.rotation.y = time * rotationSpeed + mouseX * 0.15;
            globeGroup.rotation.x = -0.2 + mouseY * 0.1;

            // Pulse education hub points
            points.forEach((point, i) => {
                const scale = 1 + Math.sin(time * 3 + i * 0.5) * 0.4;
                point.scale.setScalar(scale);
                (point.material as THREE.MeshBasicMaterial).opacity =
                    0.6 + Math.sin(time * 2 + i) * 0.4;
            });

            // Rotate particles subtly
            particles.rotation.y = time * 0.05;
            particles.rotation.x = time * 0.02;

            // Fade globe opacity based on scroll
            const fadeOpacity = 1 - scrollProgress * 0.6;
            container.style.opacity = String(Math.max(fadeOpacity, 0.15));

            renderer.render(scene, camera);
        };

        animate();

        // ─── Resize Handler ───
        const onResize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        // ─── Cleanup ───
        return () => {
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="globe-container"
            aria-hidden="true"
        />
    );
}
