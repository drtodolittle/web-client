/*

	Dr ToDo Little
	Navigation controller

*/
tdapp.controller("navigation", function(
    $scope,
    $http,
    localStorageService,
    $route,
    $location,
    $timeout
) {

    $scope.logout = function() {
        localStorageService.remove("logintoken");
        $http.defaults.headers.common['Authorization'] = "";
        $scope.password = "";
        $location.path("/");
        $route.reload();
    }

    $scope.home = function() {
        $location.path('/');
        $route.reload();
    }

    $scope.profile = function() {
        $location.path('/profile')
    }

    $scope.changepassword = function() {
        $location.path('/settings/chpwd');
    }

    $scope.resetpassword = function() {
        $location.path('/settings/respwd');
    }

})
