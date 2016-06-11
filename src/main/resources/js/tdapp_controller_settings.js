/*

	tdapp_controller_settings.js

*/
var tdapp = require('./tdapp');

tdapp.controller("SettingsCtrl",function($scope,$http,$window,$cookies,$timeout,appdata,TDMgr){

	// Get current user

	$http({
		method:"get",
		url: appdata.userservice,
	}).then(
		function successCallback(res) {
			$scope.currentuser = res.data.email;
		}
		,
		function errorCallback(res){
			console.log(JSON.stringify(res));			
			$scope.currentuser = "n/a";
		}
	);

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
		$http({
			method:"put",
			url: appdata.userservice,
			header: "application/json",
			data: $scope.user
		}).then(
			function successCallback(res) {
				$cookies.remove(appdata.cookiename);
				alert("Change password initiated. Please login again.");
				$window.location = "/";
			}
			,
			function errorCallback(res){
				$scope.errormsg = 'Error!';
				console.log(JSON.stringify(res));			
			}
		);
	}

	// Check for login, redirect if not logged in

	if ($cookies.get(appdata.cookiename)==undefined){
		$window.location = "/#/login";
	}
});
