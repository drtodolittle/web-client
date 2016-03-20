/*

	tdapp_controller_reg.js

*/
var tdapp = require('./tdapp');

tdapp.controller("RegCtrl",function($scope,$http,$window,appdata,CLogger){

	// Register

	$scope.doRegister = function(){
		CLogger.log("Commit register.");
		$http({
			method:"post",
			url: userservice,
			header: "application/json",
			data: $scope.user
		}).then(
			function successCallback(res) {
				CLogger.log("Done.");
				alert("Registration email sent. Please activate your account.");
				$window.location = "/";
			}
			,
			function errorCallback(res){
				CLogger.log("Error! Check console for details.");
				console.log(JSON.stringify(res));			
			}
		);
	}

	// Keyboard
	
	$scope.registerKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			$scope.doRegister();
		}
	}

	// Finish
	
	$(".impressum").css("visibility","visible");
	$(".flash").css("visibility","visible");	
	$("#liusername").focus()		

});
