/*

	tdapp_controller_resetpwd.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

tdapp.controller("ResetPwdCtrl",function($scope,$window,appdata,Autologin){

	// Go login
	
	$scope.goLogin = function(){
		$window.location = "/#/login";
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
		$window.location = "/#/working";
		firebase.auth().sendPasswordResetEmail(email).then(function(){
			alert("An email is waiting for you to reset your password.");
			appdata.errormsg = "";
			Autologin.doLogout();
		},function(error){
			var errmsg = "Password reset error: "+error.message;
			appdata.errormsg = errmsg;
			$window.location = "/#/resetpwd";
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

	$("#liusername").focus();
	$scope.errormsg = appdata.errormsg;
	
});
