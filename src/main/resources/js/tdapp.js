/*

	tdapp.js

*/
var tdapp = angular.module("tdapp",['satellizer','ngCookies','ngRoute']);

tdapp.config(function($authProvider,$routeProvider) {
//tdapp.config(function($authProvider){
	$authProvider.baseUrl='/api/todos/';
	$authProvider.loginUrl='login';
	$routeProvider
            .when('/', {
                templateUrl : 'login.html',
				controller : 'MainCtrl'
            })
			.when('/working', {
                templateUrl : 'working.html',
				controller : 'MainCtrl'
            })		
			.when('/main', {
                templateUrl : 'main.html',
				controller : 'MainCtrl'
            })
			.when('/egg', {
                templateUrl : 'egg.html'
            })
			.when('/register', {
                templateUrl : 'register.html',
				controller : 'MainCtrl'
            })
			.otherwise(
				{redirectTo: '/egg'}
			);
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
