// map.js
const map = new maplibregl.Map({
  container: 'map',
  style: `https://api.maptiler.com/maps/streets/style.json?key=${mapToken}`,
  center: coordinates, // [lng, lat]
  zoom: 9
});

// Add a marker
new maplibregl.Marker({ color: 'red' })
  .setLngLat(coordinates)
  .addTo(map);
