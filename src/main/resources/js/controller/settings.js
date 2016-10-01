/*

	tdapp_controller_settings.js

*/
tdapp.controller("SettingsCtrl",function($scope,$http,$location,$cookies,$timeout,appdata){

	$scope.doChPwd = function(){
		$scope.errormsg = "";
		var user = firebase.auth().currentUser;
		if(!user){
			autologinservice.doLogout();
		}
		if(
			$scope.oldPassword==undefined ||
			$scope.newPassword==undefined
		){
			$scope.errormsg = "Error: Enter valid data.";
			return;
		}
		$location.path("/working");
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
						$location.path("/#/settings");
					}
				).catch(function(error){
					var errmsg = "Error: " + error.message;
					$appdata.errormsg = errmsg;
					autologinservice.doLogout();
				});
			}
		).catch(function(error){
			var errmsg = "Error: " + error.message;
			$appdata.errormsg = errmsg;
			autologinservice.doLogout();
		});
	}

	// Reset password

	$scope.doResetPwd = function(){
		var user = firebase.auth().currentUser;
		if(user){
			$location.path("/working");
			var email = user.email;
			firebase.auth().sendPasswordResetEmail(email).then(function(){
				alert("An email is waiting for you to reset your password.");
				autologinservice.doLogout();
			},function(error){
				alert("Password reset error: "+error.message);
				autologinservice.doLogout();
			});
		} else {
			appdata.errormsg = "An error has occured. Login again!";
			autologinservice.doLogout();
		}
	}

	// Check for login, redirect if not logged in

	if(
		appdata.user==undefined &&
		appdata.token==undefined
	){
		var _dr = $cookies.get(appdata.derdrcookie);
		if (_dr==undefined){
			autologinservice.doLogout();
		} else {
			var dr = JSON.parse(_dr);
			appdata.user = dr.user;
			appdata.token = dr.token;
			appdata.lip = dr.lip;
		}
	}

	$scope.user = appdata.user;
	$scope.lip = appdata.lip;

	$('#oldpassword').focus();

});
