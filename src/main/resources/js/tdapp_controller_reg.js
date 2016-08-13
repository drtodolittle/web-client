/*

	tdapp_controller_reg.js

*/
var tdapp = require('./tdapp');

tdapp.controller("RegCtrl",function($scope,$http,$window,appdata){

	// Register

	/* Old registration
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
	
	// Registration via firebase
	$scope.doRegister = function(){
		// var ref = new Firebase("https://drtodolittle.firebaseio.com");
		var ref = window.fbref;
		ref.createUser({
			email: $scope.user.email,
			password: $scope.user.password
		},function(error, userData){
			if (error) {
				switch (error.code) {
				case "EMAIL_TAKEN":
					console.log("Error: Email already in use.");
					break;
				case "INVALID_EMAIL":
					console.log("Error: Invalid email.");
					break;
				default:
					console.log("Error: ", error);
			}
		  } else {
			console.log("User account created with uid:", userData.uid);
		  }
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
