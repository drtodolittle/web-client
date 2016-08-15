/*

	tdapp.js

*/
var tdapp = angular.module('tdapp',['ngCookies','ngRoute']);

tdapp.config(function($routeProvider,$compileProvider) {
	$routeProvider
            .when('/', {
                templateUrl : 'login.html',
				controller : 'AuthCtrl'
            })
			.when('/login', {
                templateUrl : 'login.html',
				controller : 'AuthCtrl'
            })		
			.when('/working', {
                templateUrl : 'working.html'
            })		
			.when('/main', {
                templateUrl : 'main.html',
				controller: 'MainCtrl'
            })
			.when('/register', {
                templateUrl : 'register.html',
				controller : 'RegCtrl'
            })
			.when('/chpwd', {
                templateUrl : 'chpwd.html',
				controller : 'SettingsCtrl'
            })
			.when('/settings', {
                templateUrl : 'settings.html',
				controller : 'SettingsCtrl'
            })
			.when('/error', {
                templateUrl : 'error.html'
            })
			.when('/egg', {
                templateUrl : 'egg.html'
            })
			.otherwise({
				redirectTo: '/error'
			});
	// Performance improvement
	$compileProvider.debugInfoEnabled(false);
})

tdapp.value(
	"appdata",{
		"appname":"drtodolittle",
		"appnickname":"derdr",
		"tokencookie":"derdrtoken",
		"usercookie":"derdruser",
		"lipcookie":"derdrlip",
		"localserver" : "http://localhost:3000/api/todos",
		"server" : window.location.origin + "/api/todos",
		"currentuser" : "n/a",
		"fblogin" : false,
		"fbuser" : undefined
	}
);

module.exports = tdapp