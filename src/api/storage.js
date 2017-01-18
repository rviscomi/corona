import * as firebase from 'firebase';


const CONFIG = {
  apiKey: 'AIzaSyAhwo55m0H_oTvQgl5N-zwyiIkxCWxtF5A',
  authDomain: 'corona-d8f22.firebaseapp.com',
  databaseURL: 'https://corona-d8f22.firebaseio.com',
  storageBucket: 'corona-d8f22.appspot.com',
};


export function init() {
  firebase.initializeApp(CONFIG);
}
