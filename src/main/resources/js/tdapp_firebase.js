/*

	tdapp_firebase.js

*/
var config = {
	apiKey: "AIzaSyCQ3iNEv4gjySzM7EFdpWQ-LOH3KRwh8fc",
	authDomain: "drtodolittle.firebaseapp.com",
	databaseURL: "https://drtodolittle.firebaseio.com",
	storageBucket: ""
};
firebase.initializeApp(config);
// window.firebase = firebase;

module.exports = firebase