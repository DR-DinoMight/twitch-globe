import Globe from 'globe.gl';

const ARC_REL_LEN = 0.4; // relative to whole arc
const FLIGHT_TIME = 500;
const NUM_RINGS = 3;
const RINGS_MAX_R = 10; // deg
const RING_PROPAGATION_SPEED = 2; // deg/sec

const globeContainer = document.getElementById('globeContainer') as HTMLElement;

const world = Globe()(globeContainer)
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .arcColor(() => 'darkOrange')
  .arcDashLength(ARC_REL_LEN)
  .arcDashGap(2)
  .arcDashInitialGap(1)
  .arcDashAnimateTime(FLIGHT_TIME)
  .arcsTransitionDuration(0)
  .ringColor(() => (t: number) => `rgba(255,100,50,${1 - t})`)
  .ringMaxRadius(RINGS_MAX_R)
  .ringPropagationSpeed(RING_PROPAGATION_SPEED)
  .ringRepeatPeriod(FLIGHT_TIME * ARC_REL_LEN / NUM_RINGS);
  animateGlobe();

let currentIndex = 0;
let points: Point[] = [];

function animateGlobe() {
  world.controls().autoRotate = true;
  world.controls().autoRotateSpeed = 0.5;
  world.controls().enableZoom = true;
  requestAnimationFrame(animateGlobe);

}
function emitArc() {
  const startLat = points[currentIndex].lat;
  const startLng = points[currentIndex].lng;
  const endLat = points[(currentIndex + 1) % points.length].lat;
  const endLng = points[(currentIndex + 1) % points.length].lng;

  // Add and remove arc after 1 cycle
  const arc = { startLat, startLng, endLat, endLng };
  world.arcsData([...world.arcsData(), arc]);
  setTimeout(() => world.arcsData(world.arcsData().filter(d => d !== arc)), FLIGHT_TIME * 2);

  // Add and remove start rings
  const srcRing = { lat: startLat, lng: startLng };
  world.ringsData([...world.ringsData(), srcRing]);
  setTimeout(() => world.ringsData(world.ringsData().filter(r => r !== srcRing)), FLIGHT_TIME * ARC_REL_LEN);

  // Add and remove target rings
  setTimeout(() => {
    const targetRing = { lat: endLat, lng: endLng };
    world.ringsData([...world.ringsData(), targetRing]);
    setTimeout(() => world.ringsData(world.ringsData().filter(r => r !== targetRing)), FLIGHT_TIME * ARC_REL_LEN);
  }, FLIGHT_TIME);

  // Move to the next point or loop back to the beginning
  currentIndex = (currentIndex + 1) % points.length;
}

function startAnimation() {
  if (points.length > 1) {
    emitArc();
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
  el.appendChild(createPointElement(point));
  el.appendChild(createLabelElement(point));
  return el;
}



// Function to update the points on the globe and start the animation
function updatePoints(newPoints: Point[]) {
  points = newPoints;


  world
  .htmlElementsData(points)
  //@ts-ignore
  .htmlElement(d => {
    //@ts-ignore
    const el = createHtmlElementPins(d);
    return el;
  });
  currentIndex = 0;
  startAnimation();

}
// Example usage
const examplePoints = [
  { lat: 53.3806626, lng: -1.4702278, size: 40, color: '#ffff', label: 'Dr_dinoMight, Sheffield' },
  { lat: 46.7985624, lng: 8.2319736, size: 40, color: '#d12', label: 'Bob, Switzerland' },
  { lat: 40.7127281, lng: -74.0060152, size: 40, color: '#cc1', label: 'Tess, New York' },
];

updatePoints(examplePoints);


type Point = {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
}
