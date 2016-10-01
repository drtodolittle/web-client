/*

	tdapp_controller_settings.js

*/
tdapp.controller("navigation",function($scope,$http,localStorageService, $route){

	$scope.logout = function() {
		localStorageService.remove("logintoken");
		$http.defaults.headers.common['Authorization'] = "";
		$scope.password = "";
		$route.reload();
	}
});
