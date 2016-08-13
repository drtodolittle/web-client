/*

	tdapp_controller_reg.js

*/
var tdapp = require('./tdapp');

tdapp.controller("RegCtrl",function($scope,$http,$window,appdata){

	// Register

	/* Old
	$scope.doRegister = function(){
		$http({
			method:"post",
			url: appdata.userservice,
			header: "application/json",
			data: $scope.user
		}).then(
			function successCallback(res) {
				alert("Registration email sent. Please activate your account.");
				$window.location = "/";
			}
			,
			function errorCallback(res){
				console.log(JSON.stringify(res));			
			}
		);
	}
	*/
	
	// New
	$scope.doRegister = function(){
		window.firebase.auth().createUserWithEmailAndPassword(
			$scope.user.email,
			$scope.user.password
		).then(
			function(data){
				console.log("Registration successful");
				console.log(data);
			}
		).catch(function(error){
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("Error: "+errorCode+": "+errorMessage);
		});	
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

	$("#liusername").focus()		
});
