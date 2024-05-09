//@ts-nocheck
import Globe from 'globe.gl';
import globeJson from '../assets/countries_110m.json';
import * as THREE from 'three';
import type { Point } from './types/points';

const ARC_REL_LEN = 1; // relative to whole arc
const FLIGHT_TIME = 500;
const NUM_RINGS = 2;
const RINGS_MAX_R = 6; // deg
const RING_PROPAGATION_SPEED = 1; // deg/sec

const globeContainer = document.getElementById('globeContainer') as HTMLElement;
const stars = [...Array(500).keys()].map(() => ({
    lat: (Math.random() - 1) * 360,
    lng: (Math.random() - 1) * 360,
    altitude: Math.random() * 2,
    size: Math.random() * 0.4,
    color: '#ffffff',
}));

const world = Globe()(globeContainer)
    .hexPolygonsData(globeJson.features)
    .hexPolygonColor((geometry) => {
        return ['#f7f7f7', '#c3c3c3', '#909090', '#5d5d5d'][geometry.properties.abbrev_len % 4];
    })
    .globeMaterial(
        new THREE.MeshPhongMaterial({
            color: '#000011',
            opacity: 0.9,
            transparent: true,
        })
    )
    .atmosphereAltitude(0.1)
    .atmosphereColor('#f7f7f7')
    .customLayerData(stars)
    .customThreeObject((star) => {
        const geometry = new THREE.SphereGeometry(star.size);
        const material = new THREE.MeshBasicMaterial({ color: star.color });
        return new THREE.Mesh(geometry, material);
    })
    .customThreeObjectUpdate((obj, star) => {
        const position = world.getCoords(star.lat, star.lng, star.altitude);
        if (position) {
            obj.position.set(position.x, position.y, position.z);
        }
    })
    .onGlobeReady(() => {
        updateLabelVisibility();
        world.controls().addEventListener('change', updateLabelVisibility);
    });

animateGlobe();

let points: Point[] = [];

function updateLabelVisibility() {
    const pointsOnGlobe = world.pointsData();
    const labelElements = document.querySelectorAll('.custom-pin');

    labelElements.forEach((labelElement) => {
        const labelPointData = labelElement.getAttribute('data-point');
        const labelPoint = JSON.parse(labelPointData);
        const pointOnGlobe = pointsOnGlobe.find(
            (p) => p.lat === labelPoint.lat && p.lng === labelPoint.lng
        );

        if (pointOnGlobe) {
            const threeObj = pointOnGlobe.__threeObj;
            labelElement.classList.toggle('hidden', !threeObj.visible);
        }
    });
}

function animateGlobe() {
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.5;
    world.controls().enableZoom = true;
    requestAnimationFrame(animateGlobe);
}

function createLabelElement(point: Point) {
    const el = document.createElement('div');
    el.className = 'custom-label';
    el.textContent = point.label;
    el.style.marginTop = `-${point.size / 2 + 10}px`;
    return el;
}

function createHtmlElementPins(point: Point) {
    const el = document.createElement('div');
    el.className = 'custom-pin';
    el.setAttribute('data-point', JSON.stringify(point));
    el.appendChild(createLabelElement(point));
    el.style['pointer-events'] = 'auto';
    return el;
}

function updatePoints(newPoints: Point[] | null, animate: boolean = false) {
    points = newPoints || [];

    world
        .htmlElementsData(points)
        .htmlElement((d) => createHtmlElementPins(d))
        .pointsData(points)
        .pointAltitude(0.3)
        .pointColor((point) => point.color);

    if (animate && newPoints.length > 0) {
        const lastPoint = newPoints[newPoints.length - 1];
        focusOnPoint(lastPoint);
    }
}

function clearPoints() {
    window.location.reload();
}

function focusOnPoint(point: Point) {
    const { lat, lng } = point;
    world.controls().autoRotate = false;
    world.pointOfView({ lat, lng, altitude: 2 }, 1000);

    setTimeout(() => {
        world.pointOfView({ lat: 0, lng: 0, altitude: 3 }, 1000);
        setTimeout(() => {
            world.controls().autoRotate = true;
        }, 1000);
    }, 3000);
}

function pulseOnPoint(point: Point) {
    world.ringColor(point.color);
    const srcRing = { lat: point.lat, lng: point.lng };
    globe.ringsData([...globe.ringsData(), srcRing]);
    setTimeout(
        () => globe.ringsData(globe.ringsData().filter((r) => r !== srcRing)),
        FLIGHT_TIME * ARC_REL_LEN
    );
}

function handleFormToggle() {
    const formOverlay = document.querySelector('.form-overlay');
    formOverlay.style.display = formOverlay.style.display === 'block' ? 'none' : 'block';
}

function handleColorChange() {
    updateSettingsUrl();
    world.globeMaterial(
        new THREE.MeshPhongMaterial({
            color: globeColor.value,
            opacity: parseFloat(globeOpacity.value),
            transparent: true,
        })
    );
    world.atmosphereColor(atmosphereColor.value);
    world.atmosphereAltitude(parseFloat(atmosphereAltitude.value));
    world.hexPolygonColor((geometry) => {
        const colors = [
            hexPolygonColor1.value,
            hexPolygonColor2.value,
            hexPolygonColor3.value,
            hexPolygonColor4.value,
        ];
        return colors[geometry.properties.abbrev_len % 4];
    });
    world.customLayerData(!hideStars.checked ? stars : []);

    const backgroundColor = transparentBackground.checked ? 'rgba(0,0,0,0)' : '#00001c';
    document.body.style.backgroundColor = backgroundColor;
    globeContainer.style.backgroundColor = backgroundColor;
    world.backgroundColor(backgroundColor);
}

function copyUrlToClipboard() {
    const settingsUrl = document.getElementById('settingsUrl') as HTMLInputElement;
    settingsUrl.select();
    document.execCommand('copy');
    alert('Settings URL copied to clipboard!');
}

function updateSettingsUrl() {
    const room = document.getElementById('room') as HTMLInputElement;
    const globeColor = document.getElementById('globeColor') as HTMLInputElement;
    const atmosphereColor = document.getElementById('atmosphereColor') as HTMLInputElement;
    const atmosphereAltitude = document.getElementById('atmosphereAltitude') as HTMLInputElement;
    const globeOpacity = document.getElementById('globeOpacity') as HTMLInputElement;
    const hexPolygonColor1 = document.getElementById('hexPolygonColor1') as HTMLInputElement;
    const hexPolygonColor2 = document.getElementById('hexPolygonColor2') as HTMLInputElement;
    const hexPolygonColor3 = document.getElementById('hexPolygonColor3') as HTMLInputElement;
    const hexPolygonColor4 = document.getElementById('hexPolygonColor4') as HTMLInputElement;
    const hideStars = document.getElementById('hideStars') as HTMLInputElement;
    const transparentBackground = document.getElementById(
        'transparentBackground'
    ) as HTMLInputElement;

    const settingsUrl = document.getElementById('settingsUrl') as HTMLInputElement;
    const url = new URL(window.location.href);
    url.searchParams.set('room', room.value);
    url.searchParams.set('globeColor', globeColor.value);
    url.searchParams.set('atmosphereColor', atmosphereColor.value);
    url.searchParams.set('atmosphereAltitude', atmosphereAltitude.value);
    url.searchParams.set('globeOpacity', globeOpacity.value);
    url.searchParams.set('hexPolygonColor1', hexPolygonColor1.value);
    url.searchParams.set('hexPolygonColor2', hexPolygonColor2.value);
    url.searchParams.set('hexPolygonColor3', hexPolygonColor3.value);
    url.searchParams.set('hexPolygonColor4', hexPolygonColor4.value);
    url.searchParams.set('hideStars', hideStars.checked.toString());
    url.searchParams.set('transparentBackground', transparentBackground.checked.toString());
    settingsUrl.value = url.href;
}

document.addEventListener('keydown', (event) => {
    if (event.key === 's' || event.key === 'S') {
        handleFormToggle();
    }
});

document.querySelectorAll('.form-overlay input').forEach((input) => {
    input.addEventListener('change', handleColorChange);
});

document.getElementById('copyUrlButton').addEventListener('click', copyUrlToClipboard);

export { updatePoints, world, clearPoints, handleColorChange, pulseOnPoint };
