/*

	Dr ToDo Little
	Navigation controller

*/
tdapp.controller("navigation",function($scope,$http,localStorageService,$route,$location,$timeout){

	$scope.logout = function() {
		localStorageService.remove("logintoken");
		$http.defaults.headers.common['Authorization'] = "";
		$scope.password = "";
		$route.reload();
	}

	$scope.changepassword = function(){
		console.log('changepassword...');
		$location.path('/chpwd');
	}

	$scope.home = function(){
		console.log('home...');
		$location.path('/');
		$route.reload();
	}

});
