/*

	Dr ToDo Little
	Reset password controller

*/
tdapp.controller("respwdCtrl",function($rootScope,$scope,$http,localStorageService,$route,$location){

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

    // Change it...

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

    $scope.doResetPwd = function(){
        var user = firebase.auth().currentUser;
		if(user){
			var email = user.email;
			firebase.auth().sendPasswordResetEmail(email).then(function(){
                showSuccess("An email is waiting for you to reset your password.")
			},function(error){
                showError("Password reset error: "+error.message)
			});
		} else {
            showError("Resetting password is not possible at this moment. Please login again.")
		}
    }

    $location.path('/',false)

});
