/*

	tdapp_controller_resetpwd.js

*/
tdapp.controller("ResetPwdCtrl",function($scope,$location,appdata){

	// Go login

	$scope.goLogin = function(){
		$location.path("/login");
	}

	// Reset password

	$scope.doResetPwd = function(){
		$('#rb').blur();
		$scope.errormsg = "";
		appdata.errormsg = "";
		if($scope.email==undefined){
			$scope.errormsg = "Error: Enter valid data.";
			return;
		}
		var email = $scope.email;
		$location.path("/#/working");
		firebase.auth().sendPasswordResetEmail(email).then(function(){
			alert("An email is waiting for you to reset your password.");
			appdata.errormsg = "";
			autologinservice.doLogout();
		},function(error){
			var errmsg = "Password reset error: "+error.message;
			appdata.errormsg = errmsg;
			$location.path("/resetpwd");
		});
	}

	// Keyboard

	$scope.doResetPwdKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			$scope.doResetPwd();
		}
	}

	// Finish

	$("#liuser").focus();

	$scope.errormsg = appdata.errormsg;
	$scope.email = appdata.tmpuser;

});
