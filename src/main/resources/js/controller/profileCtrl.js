/*

	Dr ToDo Little
    Profile controller

*/
tdapp.controller("profileCtrl",function($rootScope,$scope,$http,localStorageService,$route,$location){

    // Modification of $location.path()

    var original = $location.path
    $location.path = function(path,reload){
        if (reload === false){
            var lastRoute = $route.current
            var un = $rootScope.$on('$locationChangeSuccess', function(){
                $route.current = lastRoute
                un()
            });
        }
        return original.apply($location,[path])
    }

    function showError(msg){
        var ee = $('#errtemplate').clone()
        ee.children('#errmsg').html(msg)
        ee.css('visibility','visible')
        $('#nfo').append(ee)
    }

    function showSuccess(msg){
        var ee = $('#successtemplate').clone()
        ee.children('#sucmsg').html(msg)
        ee.css('visibility','visible')
        $('#nfo').append(ee)
    }

    var user = firebase.auth().currentUser
    if(user){
        $scope.user = user.email
    } else {
        showError('Try again later.')
    }

    $location.path('/',false)

});
