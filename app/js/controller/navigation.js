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

    function cNavbar(){
        if ($('.navbar-toggle').css('display') != 'none') {
            $(".navbar-toggle").trigger("click");
        }
    }

    $scope.home = function() {
        $location.path('/')
        cNavbar();
    }

    $scope.profile = function() {
        $location.path('/profile')
        cNavbar();
    }

    $scope.changepassword = function() {
        $location.path('/settings/chpwd');
        cNavbar();
    }

    $scope.resetpassword = function() {
        $location.path('/settings/respwd');
        cNavbar();
    }

})
