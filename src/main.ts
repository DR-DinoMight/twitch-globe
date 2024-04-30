

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import fontJson from 'three/examples/fonts/helvetiker_regular.typeface.json';

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the globe geometry and material
const globeGeometry = new THREE.SphereGeometry(5, 64, 64);
const globeTexture = new THREE.TextureLoader().load('./public/2k_earth_nightmap.jpg');
const globeMaterial = new THREE.MeshBasicMaterial({ map: globeTexture });
const globe = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globe);

// Create the orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 7;
controls.maxDistance = 20;

// Set the camera position
camera.position.set(0, 0, 10);

// Load the built-in "helvetiker" font
const font = new Font(fontJson);
// Add pins to the globe based on latitude, longitude, and username
interface Pin {
  lat: number;
  lng: number;
  username: string;
  pinMesh: THREE.Mesh;
  labelMesh: THREE.Mesh;
}


//https://nominatim.openstreetmap.org/search?q=Switzerland&format=json&limit=1
const pins: Pin[] = [
  { lat: 53.3806626, lng: -1.4702278, username: 'Matt', pinMesh: null, labelMesh: null },

];

const pinGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 32);
const pinMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

const pinGroup = new THREE.Group();
globe.add(pinGroup);

pins.forEach((pin) => {
  const pinMesh = new THREE.Mesh(pinGeometry, pinMaterial);
  const lat = THREE.MathUtils.degToRad(pin.lat);
  const lng = THREE.MathUtils.degToRad(pin.lng);
  const x = Math.cos(lat) * Math.cos(lng) * 5;
  const y = Math.sin(lat) * 5;
  const z = Math.cos(lat) * Math.sin(lng) * 5;
  pinMesh.position.set(x, y, z);

  // Rotate the pin to point up into space
  const pinDirection = new THREE.Vector3(x, y, z).normalize();
  const pinUp = new THREE.Vector3(0, 1, 0);
  const pinQuaternion = new THREE.Quaternion().setFromUnitVectors(pinUp, pinDirection);
  pinMesh.quaternion.copy(pinQuaternion);

  pin.pinMesh = pinMesh;
  pinGroup.add(pinMesh);

  const labelGeometry = new TextGeometry(pin.username, {
    font: font,
    size: 0.2,
    height: 0.01,
  });
  const labelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
  labelMesh.position.set(x, y, z);
  labelMesh.position.add(new THREE.Vector3(0, 0.6, 0));

  // Rotate the label to point up into space
  labelMesh.quaternion.copy(pinQuaternion);

  pin.labelMesh = labelMesh;
  pinGroup.add(labelMesh);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  globe.rotation.y += 0.001;
  renderer.render(scene, camera);
}

animate();
