/*

	tdapp_controller_settings.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

tdapp.controller("SettingsCtrl",function($scope,$http,$window,$cookies,$timeout,appdata,TDMgr){

	// Get current user
	
	$scope.currentuser = appdata.currentuser;
	$scope.fblogin = appdata.fblogin;
		
	// Go main
	
	$scope.gomain = function(){
		$window.location = "/#/main";
	}

	// Go settings

	$scope.gosettings = function(){
		$window.location = "/#/settings";
	}	
		
	// Change passwrod

	$scope.gochpwd = function(){
		$window.location = "/#/chpwd";
	}

	$scope.doChPwd = function(){
		$scope.errormsg = "";
		if(
			$scope.user==undefined ||
			$scope.user.email==undefined ||
			$scope.user.oldPassword==undefined ||
			$scope.user.newPassword==undefined
		){
			$scope.errormsg = "Error: Enter valid data";
			return;
		}
		firebase.auth().signInWithEmailAndPassword(
			$scope.user.email,
			$scope.user.oldPassword
		).then(
			function(fbuser){
				fbuser.updatePassword(
					$scope.user.newPassword
				).then(
					function(){
						console.log("Password change done!");
						$window.location = "/#/settings";
					}
				).catch(function(error){
					$scope.errormsg = "Error: "+error.message;
					console.log("Error: ", error.message);
					$scope.$apply();			
				});	
			}
		).catch(function(error){
			$scope.errormsg = "Error: "+error.message;
			console.log($scope.errormsg);
			$scope.$apply();
		});		
	}
		
	// Check for login, redirect if not logged in
	
	if ($cookies.get(appdata.tokencookie)==undefined){
		$window.location = "/#/login";
	}
	
	if($cookies.get(appdata.usercookie)!=undefined){
		$scope.currentuser = $cookies.get(appdata.usercookie);
	}
	
});
