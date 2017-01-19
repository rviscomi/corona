import * as firebase from 'firebase';

const StorageAPI = {};
const CONFIG = {
  apiKey: 'AIzaSyAhwo55m0H_oTvQgl5N-zwyiIkxCWxtF5A',
  authDomain: 'corona-d8f22.firebaseapp.com',
  databaseURL: 'https://corona-d8f22.firebaseio.com',
  storageBucket: 'corona-d8f22.appspot.com',
};


StorageAPI.init = () => {
  firebase.initializeApp(CONFIG);
};

StorageAPI.get = (user, repo) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref(`/geocodes/${user}/${repo}`).once('value', snapshot => {
      resolve(snapshot.val() || {});
    }, e => {
      reject(e);
    });
  });
};
StorageAPI.set = (user, repo, geocodes, stars, description, isFork, cursor) => {
  geocodes = StorageAPI.serializeGeocodes(geocodes);
  firebase.database().ref(`/geocodes/${user}/${repo}`).set({
    description,
    stars,
    isFork,
    geocodes,
    cursor
  });
};

StorageAPI.serializeGeocodes = (geocodes) => JSON.parse(JSON.stringify(geocodes));

export default StorageAPI;
