const MapsAPI = {};

const MAPS_API_KEY = 'AIzaSyCTMqkw3mIZRplHeYQjWMHwLQtQyc-wbHA';
const MAPS_URL = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=visualization&callback=initCorona`;

MapsAPI.loadScript = () => {
  const script = document.createElement('script');
  script.src = MAPS_URL;
  document.body.appendChild(script);
};

MapsAPI.init = (map) => {
  const google = window.google;
  return new google.maps.Map(map, {
    center: {
      lat: 20,
      lng: 0
    },
    scrollwheel: false,
    zoom: 2,
    map_type: google.maps.MapTypeId.ROADMAP
  });
};

MapsAPI.getLayer = (map) => {
  const google = window.google;
  return new google.maps.visualization.HeatmapLayer({
    map,
    radius: 25
  });
};

MapsAPI.getGeoCode = (location) => {
  const google = window.google;
  const geo = new google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geo.geocode({address: location}, (results, status) => {
      if (status !== google.maps.GeocoderStatus.OK ||
          !results.length ||
          !results[0]) {
        resolve(null);
      }

      console.log(results);
      resolve(results[0].geometry.location);
    });
  });
};

export default MapsAPI;
