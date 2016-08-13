/*

	tdapp_controller_reg.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

tdapp.controller("RegCtrl",function($scope,$http,$window,appdata){

	// Register
	
	$scope.doRegister = function(){
		firebase.auth().createUserWithEmailAndPassword(
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
