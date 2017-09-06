/*

	Dr ToDo Little
	The main application (tdapp)

*/
var tdapp = angular.module('tdapp', ['ngRoute', 'firebase', 'LocalStorageModule', 'xeditable'])

tdapp.config(function(
    $routeProvider,
    $locationProvider,
    $compileProvider,
    $httpProvider
) {

    // Routing

    $routeProvider
        .when('/', {
            templateUrl: 'main.html',
            controller: 'mainCtrl'
        })
        .when('/todos/:status/:type/:id', {
            templateUrl: 'main.html',
            controller: 'mainCtrl'
        })
        .when('/todos/:type/:id', {
            templateUrl: 'main.html',
            controller: 'mainCtrl'
        })
        .when('/register', {
            templateUrl: 'register.html',
            controller: 'regCtrl'
        })
        .when('/profile', {
            templateUrl: 'profile.html',
            controller: 'profileCtrl'
        })
        .when('/settings/chpwd', {
            templateUrl: 'chpwd.html',
            controller: 'chpwdCtrl'
        })
        .when('/settings/respwd', {
            templateUrl: 'respwd.html',
            controller: 'respwdCtrl'
        })
        .when('/error', {
            templateUrl: 'error.html'
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

// Check for test envirionment

var serverurl = "https://api.drtodolittle.de/api/todos";
if (window.location.host.startsWith("test")) {
    serverurl = "http://test.drtodolittle.de/api/todos";
}

// Datastore

tdapp.value(
    "appdata", {
        name: "drtodolittle",
        nickname: "derdr",
        cookiename: "derdrcookie",
        localserver: "http://localhost:3000/api/todos",
        server: serverurl,
        rememberme: undefined,
        token: undefined,
        user: undefined,
        lip: undefined,
        errormsg: ""
    }
)

// Angular-xeditable theme

tdapp.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
})
