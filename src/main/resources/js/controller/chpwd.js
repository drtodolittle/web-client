/*

	Dr ToDo Little
	Change password controller

*/
tdapp.controller("chpwdCtrl",function($rootScope,$scope,$http,localStorageService,$route,$location){

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


    $scope.doChPwd = function(){
        if(
			$scope.oldPassword==undefined ||
			$scope.newPassword==undefined
		){
            showError('Enter valid data.')
            return
		}
        var user = firebase.auth().currentUser;
		firebase.auth().signInWithEmailAndPassword(
			user.email,
			$scope.oldPassword
		).then(
			function(fbuser){
				fbuser.updatePassword(
					$scope.newPassword
				).then(
					function(){
                        showSuccess('Password change done!')
					}
				).catch(function(error){
                    showError(error.message)
				})
			}
		).catch(function(error){
            showError(error.message)
		});
    }

    $location.path('/',false)

    $('#oldpassword').focus()
});
