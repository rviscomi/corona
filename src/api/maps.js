const MapsAPI = {};

const MAPS_API_KEY = process.env.REACT_APP_MAPS_API_KEY;
const MAPS_URL = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=visualization&callback=initCorona`;

const QUEUE_DELAY_MS = 1750;
let queueTimeout = null;
let queue = [];

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

MapsAPI.deflateGeocodes = (geocodes) => JSON.stringify(geocodes);
MapsAPI.inflateGeocodes = (geocodes) => {
  const google = window.google;
  return geocodes.map(({lat, lng}) => new google.maps.LatLng(lat, lng));
};

MapsAPI.getLayer = (map) => {
  const google = window.google;
  return new google.maps.visualization.HeatmapLayer({
    map,
    radius: 25
  });
};

MapsAPI.enqueueLocations = (locations) => {
  queue = queue.concat(locations);
};

MapsAPI.startGeocoding = (context, onGeocoded, onComplete, onError) => {
  if (queueTimeout) {
    return;
  }

  queueTimeout = setInterval(() => {
    MapsAPI.getGeocode(queue.shift()).then(geocode => {
      onGeocoded.call(context, geocode);
      return Promise.resolve();
    }).catch(e => {
      onError.call(context, e);
      return Promise.resolve();
    }).then(() => {
      if (!queue.length) {
        clearInterval(queueTimeout);
        queueTimeout = null;
        onComplete.call(context);
      }
    });
  }, QUEUE_DELAY_MS);
};

MapsAPI.getGeocode = (location) => {
  if (!location) {
    return Promise.reject('No location to geocode.');
  }

  const google = window.google;
  const geo = new google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geo.geocode({address: location}, (results, status) => {
      if (status !== google.maps.GeocoderStatus.OK) {
        reject(`Geocoding error. Location "${location}" resulted in the status "${status}".`);
        return;
      }
      if (!results ||
          !results.length ||
          !results[0]) {
        reject('Geocoding error. Invalid results.');
        return;
      }

      resolve(results[0].geometry.location);
    });
  });
};

export default MapsAPI;
