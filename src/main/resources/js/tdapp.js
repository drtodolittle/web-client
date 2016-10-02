/*

	Dr ToDo Little
	The main application (tdapp)

*/
var tdapp = angular.module('tdapp',['ngCookies','ngRoute', 'firebase','LocalStorageModule','xeditable']);

tdapp.config(function($routeProvider,$locationProvider,$compileProvider,$httpProvider) {
	// Routing
	$routeProvider
      .when('/', {
        templateUrl : 'main.html',
				controller : 'MainCtrl'
      })
			.when('/working', {
        templateUrl : 'working.html'
      })
			.when('/register', {
        templateUrl : 'register.html',
				controller : 'RegCtrl'
      })
			.when('/resetpwd', {
        templateUrl : 'resetpwd.html',
				controller : 'ResetPwdCtrl'
    	})
			.when('/settings', {
        templateUrl : 'settings.html',
				controller : 'SettingsCtrl'
      })
			.when('/chpwd', {
        templateUrl : 'chpwd.html',
				controller : 'chpwdCtrl'
      })
			.when('/egg', {
        templateUrl : 'egg.html'
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
);
