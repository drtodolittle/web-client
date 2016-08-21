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
				controller : 'MainCtrl'
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
				controller : 'SettingsCtrl'
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
		"errormsg" : ""
	}
);

module.exports = tdapp