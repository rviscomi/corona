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

StorageAPI.get = (user, repo) => {};
StorageAPI.set = (user, repo, data, cursor) => {};

export default StorageAPI;
