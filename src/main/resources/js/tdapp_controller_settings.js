/*

	tdapp_controller_settings.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

tdapp.controller("SettingsCtrl",function($scope,$http,$window,$cookies,$timeout,appdata,TDMgr,Autologin){

	// Go main

	$scope.goMain = function(){
		$window.location = "/#/main";
	}

	// Go settings

	$scope.goSettings = function(){
		$window.location = "/#/settings";
	}

	// Change passwrod

	$scope.goChPwd = function(){
		$window.location = "/#/chpwd";
	}

	$scope.doChPwd = function(){
		$scope.errormsg = "";
		var user = firebase.auth().currentUser;
		if(!user){
			Autologin.doLogout();
		}
		if(
			$scope.oldPassword==undefined ||
			$scope.newPassword==undefined
		){
			$scope.errormsg = "Error: Enter valid data.";
			return;
		}
		$window.location = "/#/working";
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
						$window.location = "/#/settings";
					}
				).catch(function(error){
					var errmsg = "Error: " + error.message;
					$appdata.errormsg = errmsg;
					Autologin.doLogout();
				});
			}
		).catch(function(error){
			var errmsg = "Error: " + error.message;
			$appdata.errormsg = errmsg;
			Autologin.doLogout();
		});
	}

	// Reset password

	$scope.doResetPwd = function(){
		var user = firebase.auth().currentUser;
		if(user){
			$window.location = "/#/working";
			var email = user.email;
			firebase.auth().sendPasswordResetEmail(email).then(function(){
				alert("An email is waiting for you to reset your password.");
				Autologin.doLogout();
			},function(error){
				alert("Password reset error: "+error.message);
				Autologin.doLogout();
			});
		} else {
			appdata.errormsg = "An error has occured. Login again!";
			Autologin.doLogout();
		}
	}

	// Check for login, redirect if not logged in

	if(
		appdata.user==undefined &&
		appdata.token==undefined
	){
		var _dr = $cookies.get(appdata.derdrcookie);
		if (_dr==undefined){
			Autologin.doLogout();
		} else {
			var dr = JSON.parse(_dr);
			appdata.user = dr.user;
			appdata.token = dr.token;
			appdata.lip = dr.lip;
			if(dr.lip=="fbcore"){
				appdata.fblogin = true;
			}
		}
	}

	$scope.user = appdata.user;
	$scope.lip = appdata.lip;

	$('#oldpassword').focus();

});
