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

    $scope.doChPwd = function(){
        console.log('doChPwd...')
        if(
			$scope.oldPassword==undefined ||
			$scope.newPassword==undefined
		){
            console.log('Error: Enter valid data.')
            $route.reload()
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
						alert("Password change done!");
                        $route.reload()
					}
				).catch(function(error){
					var errmsg = "Error: " + error.message;
                    console.log(errmsg)
                    $route.reload()
				})
                $route.reload()
			}
		).catch(function(error){
			var errmsg = "Error: " + error.message;
            console.log(errmsg)
            $route.reload()
		});
    }

    $location.path('/',false)

    $('#oldpassword').focus()
});
