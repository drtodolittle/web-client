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
		$location.path('/chpwd');
	}

	$scope.resetpassword = function(){
		$location.path('/respwd');
	}

	$scope.home = function(){
		$location.path('/');
		$route.reload();
	}

	$scope.profile = function(){
		$location.path('/settings')
	}

});
