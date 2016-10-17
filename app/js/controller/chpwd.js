/*

	Dr ToDo Little
	Change password controller

*/
tdapp.controller("chpwdCtrl",function($rootScope,$scope,$http,localStorageService,$route,$location){

    // Helper

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

    // Change it...

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

    $('#oldpassword').focus()
});
