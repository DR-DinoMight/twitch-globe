//@ts-nocheck
import {
    Point,
    updatePoints,
    clearPoints,
    handleColorChange,
    world,
    pulseOnPoint,
    arcBetweeenPoints,
} from './world';
import tmi from 'tmi.js';
import { toSentenceCase } from './utils/stringUtils';

// Example usage
let points: Point[] = [];

updatePoints(points);

//get the query string room parameter and use that as the room to join if not supplied joing 'world'
const roomQs = new URLSearchParams(window.location.search).get('room') ?? 'dr_dinomight';

const client = new tmi.Client({
    connection: {
        reconnect: true,
    },
    channels: [roomQs],
});
client.connect().then(() => {
    client.on('message', async (channel, context, message) => {
        // console.log('channel', {
        //   channel,
        //   user: context.username,
        //   context,
        //   message
        // });

        const badges = context.badges || {};
        const isBroadcaster = badges.broadcaster;
        const isMod = badges.moderator;
        //if message starts with !pin then add point to map
        if (message.startsWith('!pin ')) {
            //check if user exists in points already, if so return
            // if (points.filter(p => p.username === context.username).length > 0) {
            //   // console.log("Already Exits");
            //   return;
            // }

            // take the message and try and call the !pin command parser
            const location = message.toLowerCase().replace('!pin', '');

            const locationResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=1`
            );

            const locationData = await locationResponse.json();

            if (locationData.length > 0) {
                // console.log({"loc": locationData[0]});
                const point: Point = {
                    lat: locationData[0]?.lat,
                    lng: locationData[0]?.lon,
                    size: 40,
                    color: context.color ?? '#fff',
                    label: `${context['display-name']}, ${toSentenceCase(location)}`,
                    username: context?.username,
                };
                // console.log(point);

                points.push(point);
                updatePoints(points, true);
            }
        }
        // if message starts with clear and user is a mod clear pins
        if (message.startsWith('!clear') && (isBroadcaster || isMod)) {
            clearPoints();
            console.log('cleared');
        }
        const point = points.find((point) => point.username === context?.username);
        if (point) {
            // pulse a ring at the points lat long
            // console.log('pulsing point for user', context.username);

            pulseOnPoint(point);
            const mentionedUser = message.toLocaleLowerCase().match(/@(\w+)/)?.[1];
            if (
                mentionedUser &&
                point.username.toLocaleLowerCase() !== mentionedUser.toLocaleLowerCase()
            ) {
                const mentionedPoint = points.find(
                    (p) => p.username === mentionedUser.toLocaleLowerCase()
                );
                if (mentionedPoint) {
                    arcBetweeenPoints(point, mentionedPoint);
                }
            }
            //check if the message contains another users name if that username is pinned then send out an arc
        }
    });
});

// Apply settings from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room') || 'dr_dinomight';
const globeColor = urlParams.get('globeColor') || '#000011';
const atmosphereColor = urlParams.get('atmosphereColor') || '#f7f7f7';
const atmosphereAltitude = urlParams.get('atmosphereAltitude') || '0.1';
const globeOpacity = urlParams.get('globeOpacity') || '0.9';
const hexPolygonColor1 = urlParams.get('hexPolygonColor1') || '#f7f7f7';
const hexPolygonColor2 = urlParams.get('hexPolygonColor2') || '#c3c3c3';
const hexPolygonColor3 = urlParams.get('hexPolygonColor3') || '#909090';
const hexPolygonColor4 = urlParams.get('hexPolygonColor4') || '#5d5d5d';
const hideStars = urlParams.get('hideStars') === 'true';
const transparentBackground = urlParams.get('transparentBackground') === 'true';

// Set form input values based on URL query parameters
(document.getElementById('room') as HTMLInputElement).value = room;
(document.getElementById('globeColor') as HTMLInputElement).value = globeColor;
(document.getElementById('atmosphereColor') as HTMLInputElement).value = atmosphereColor;
(document.getElementById('atmosphereAltitude') as HTMLInputElement).value = atmosphereAltitude;
(document.getElementById('globeOpacity') as HTMLInputElement).value = globeOpacity;
(document.getElementById('hexPolygonColor1') as HTMLInputElement).value = hexPolygonColor1;
(document.getElementById('hexPolygonColor2') as HTMLInputElement).value = hexPolygonColor2;
(document.getElementById('hexPolygonColor3') as HTMLInputElement).value = hexPolygonColor3;
(document.getElementById('hexPolygonColor4') as HTMLInputElement).value = hexPolygonColor4;
(document.getElementById('hideStars') as HTMLInputElement).checked = hideStars;
(document.getElementById('transparentBackground') as HTMLInputElement).checked =
    transparentBackground;

// Trigger color change to apply settings
handleColorChange();

// Fade out the tooltip after 5 seconds
setTimeout(() => {
    const tooltip = document.querySelector('.tooltip');
    tooltip.classList.add('fade-out');
    setTimeout(() => {
        tooltip.parentElement.remove();
    }, 500);
}, 3000);
