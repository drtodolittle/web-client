/*

	Dr ToDo Little
	Navigation controller

*/
tdapp.controller("navigation", function(
    $scope,
    $rootScope,
    $http,
    localStorageService,
    $route,
    $location,
    $timeout,
    $firebaseAuth,
    todoservice
) {

    function cNavbar(){
        if ($('.navbar-toggle').css('display') != 'none') {
            $(".navbar-toggle").trigger("click");
        }
    }

    $scope.logout = function() {
        $('#todoarea').css('visibility',"hidden")
        localStorageService.remove("logintoken");
        $http.defaults.headers.common['Authorization'] = "";
        $scope.password = "";
        cNavbar();
        $firebaseAuth().$signOut().then(function(){
            $location.path("/");
            $rootScope.open_dialog()
            $timeout(function() {
                $('#signin-email').focus()
            }, 256)
        })
    }

    $scope.home = function() {
        $location.path('/todos/open/all')
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
