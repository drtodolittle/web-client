/*

	Dr ToDo Little
	The main application (tdapp)

*/
var tdapp = angular.module('tdapp',['ngRoute', 'firebase','LocalStorageModule','xeditable']);

tdapp.config(function($routeProvider,$locationProvider,$compileProvider,$httpProvider) {

	// Routing
	$routeProvider
	.when('/', {
        templateUrl : 'main.html',
		controller : 'MainCtrl'
    })
	.when('/register', {
        templateUrl : 'register.html',
		controller : 'RegCtrl'
    })
	.when('/respwd', {
    	templateUrl : 'respwd.html',
		controller : 'respwdCtrl'
    })
	.when('/profile', {
        templateUrl : 'profile.html',
		controller : 'profileCtrl'
    })
	.when('/chpwd', {
        templateUrl : 'chpwd.html',
		controller : 'chpwdCtrl'
    })
	.when('/error', {
    	templateUrl : 'error.html'
    })
	.otherwise({
		redirectTo: '/error'
	});

	// Performance improvement

	$compileProvider.debugInfoEnabled(false);

	// Disable hashbang urls

	$locationProvider.html5Mode(true);

	// Interceptor

	$httpProvider.interceptors.push('logininterceptor');
})

tdapp.value(
	"appdata",{
		name : "drtodolittle",
		nickname : "derdr",
		cookiename : "derdrcookie",
		localserver : "http://localhost:3000/api/todos",
		server : "https://app.drtodolittle.de/api/todos",
		rememberme : undefined,
		token : undefined,
		user : undefined,
		lip : undefined,
		errormsg : ""
	}
)
