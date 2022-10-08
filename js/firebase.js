// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA-DO1vYjRwAV15gO90mLFiIGplXHzLn1I",
    authDomain: "doodle-jump-scores.firebaseapp.com",
    projectId: "doodle-jump-scores",
    storageBucket: "doodle-jump-scores.appspot.com",
    messagingSenderId: "916676932093",
    appId: "1:916676932093:web:5dc60071d9784415e5e994"
  };
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);

    const myAppDB = app.database();
    const auth = app.auth();