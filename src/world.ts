import Globe from 'globe.gl';
import globeJson from '../assets/countries_110m.json';
import * as THREE from 'three';


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
}))


const world = Globe()(globeContainer)
  // .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .hexPolygonsData(globeJson.features)
  .hexPolygonColor((geometry) => {
    return ['#f7f7f7', '#c3c3c3', '#909090', '#5d5d5d'][geometry.properties.abbrev_len % 4];
  })
  .globeMaterial(
    (new THREE.MeshPhongMaterial({
      color: '#000011',
      opacity: 0.90,
      transparent: true,
    })))
  .atmosphereAltitude(0.1)
  .atmosphereColor("#f7f7f7")
  .customLayerData(stars)
  .customThreeObject((star) => {
    const geometry = new THREE.SphereGeometry(star.size);
    const material = new THREE.MeshBasicMaterial({ color: star.color });
    // console.log(star,geometry, material)/``
    return new THREE.Mesh(geometry, material);
  })
  .customThreeObjectUpdate((obj, star) => {
    const position = world.getCoords(star.lat, star.lng, star.altitude);
    // console.log(obj, star)
    if (position) {
      obj.position.set(position.x, position.y, position.z);
    }
  }).onGlobeReady(() => {

    updateLabelVisibility();

    // Update label visibility on globe rotation
    world.controls().addEventListener('change', () => {
      updateLabelVisibility();
    });
  });

  animateGlobe();
let currentIndex = 0;
let points: Point[] = [];

function updateLabelVisibility() {
  const pointsOnGlobe = world.pointsData();
  // Get all the label elements
  const labelElements = document.querySelectorAll('.custom-pin');

  labelElements.forEach(labelElement => {
    const labelPointData = labelElement.getAttribute('data-point');
    const labelPoint = JSON.parse(labelPointData);
    //find point position on globe
    const pointOnGlobe = pointsOnGlobe.find(p => p.lat === labelPoint.lat && p.lng === labelPoint.lng);

    if (pointOnGlobe) {
      const threeObj = pointOnGlobe.__threeObj;
      if (threeObj.visible){
        labelElement.classList.remove("hidden");
      }
      else{
        labelElement.classList.add("hidden");
      }
    }

  });
}
function animateGlobe() {
  world.controls().autoRotate = true;
  world.controls().autoRotateSpeed = 0.5;
  world.controls().enableZoom = true;
  requestAnimationFrame(animateGlobe);

}

function startAnimation() {
  if (points.length > 1) {
    setTimeout(startAnimation, FLIGHT_TIME);
  }
}

function createPointElement(point: Point) {
  const el = document.createElement('img');
  el.className = 'custom-point';
  el.src = 'https://avatar.iran.liara.run/public';
  el.style.width = `${point.size}px`;
  el.style.height = `${point.size}px`;
  el.style.borderRadius = '50%';
  return el;
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
  // el.appendChild(createPointElement(point));
  el.appendChild(createLabelElement(point));
  el.style['pointer-events'] = 'auto';
  return el;
}
// Function to update the points on the globe and start the animation
function updatePoints(newPoints: Point[], animate: boolean = false) {
  points = newPoints;
  world
  .htmlElementsData(points)
  //@ts-ignore
  .htmlElement(d => {
    //@ts-ignore
    const el = createHtmlElementPins(d);
    return el;
  })
  .pointsData(points)
  .pointAltitude(0.3)
  .pointColor(point  => point.color)
  currentIndex = 0;

  if (animate && newPoints.length > 0) {
    const lastPoint = newPoints[newPoints.length - 1];
    focusOnPoint(lastPoint);
  }
  startAnimation();

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


export type Point = {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
  altitude?: number;
  username: string;
}

export { updatePoints, world }
