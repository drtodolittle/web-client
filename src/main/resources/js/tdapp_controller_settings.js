/*

	tdapp_controller_settings.js

*/
var tdapp = require('./tdapp');

tdapp.controller("SettingsCtrl",function($scope,$http,$window,$cookies,appdata){

	// Change passwrod

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

	// Finish
	
	$(".flash").css("visibility","visible");	
	$("#liusername").focus()		

});
