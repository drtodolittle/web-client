/*

	Dr ToDo Little
	Reset password controller

*/
tdapp.controller("respwdCtrl",function($rootScope,$scope,$http,localStorageService,$route,$location){

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

    // Reset it...

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

});
