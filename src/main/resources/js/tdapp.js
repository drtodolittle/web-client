/*

	tdapp.js

*/
var tdapp = angular.module("tdapp",['satellizer','ngCookies']);

tdapp.config(function($authProvider) {
	$authProvider.baseUrl='/api/todos/';
	$authProvider.loginUrl='login';
	// Satellizer
	/*
	$authProvider.twitter({
		url: 'http://127.0.0.1:5000/auth/twitter', // Satellizer server component on localhost
		authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
		redirectUri: window.location.origin,
		type: '1.0',
		popupOptions: { width: 495, height: 645 }
	});
	$authProvider.httpInterceptor = false,
	$authProvider.withCredentials = false;
	*/
})

tdapp.value(
	"appdata",{
		"appname":"drtodolittle",
		"appnick":"derdr",
		"cookiename":"derdr",
		"localserver" : "http://localhost:3000/api/todos",
		"server" : window.location.protocol + "/api/todos",
		"userservice" : window.location.protocol + "/api/users"
	}
);

/*
  Server ----------------------------------------
*/
var localserver = "http://localhost:3000/api/todos"; // JSON-Server ressource on localhost 
var server = window.location.protocol + "/api/todos";
var userservice = window.location.protocol + "/api/users";
