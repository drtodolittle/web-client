/*

	tdapp_controller_reg.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

tdapp.controller("RegCtrl",function($scope,$http,$window,appdata){

	// Register
	
	$scope.doRegister = function(){
		if(
			$scope.user==undefined ||
			$scope.user.email==undefined ||
			$scope.user.firstname==undefined ||
			$scope.user.lastname==undefined
		){
			$scope.errormsg = "Error: Enter valid data.";
			return;
		}
		firebase.auth().createUserWithEmailAndPassword(
			$scope.user.email,
			$scope.user.password
		).then(
			function(data){
				console.log("Registration successful.");
				alert('Registration successful. Please login.');
				$window.location = "/#/login";
			}
		).catch(function(error){
			var errorMessage = error.message;
			console.log("Error: "+errorMessage);
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
