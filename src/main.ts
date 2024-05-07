//@ts-nocheck
import { Point, updatePoints, clearPoints } from './world';
import tmi from "tmi.js";
import { toSentenceCase } from './utils/stringUtils';

// Example usage
let points : Point[] = [
];

updatePoints(points);

//get the query string room parameter and use that as the room to join if not supplied joing 'world'
const roomQs = new URLSearchParams(window.location.search).get('room') ?? 'dr_dinomight';


const client = new tmi.Client({
  connection: {
    reconnect: true
  },
  channels: [
    roomQs
  ]
})
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
    if(message.startsWith('!pin ')) {
      //check if user exists in points already, if so return
      // if (points.filter(p => p.username === context.username).length > 0) {
      //   // console.log("Already Exits");
      //   return;
      // }

      // take the message and try and call the !pin command parser
      const location = message.toLowerCase().replace("!pin", "");

      const locationResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=1`);

      const locationData = await locationResponse.json();

      if(locationData.length > 0) {
        // console.log({"loc": locationData[0]});
        const point : Point = {
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
    if (message.startsWith("!clear") && (isBroadcaster || isMod)) {

      clearPoints();
      console.log('cleared');
    }


  });
});

