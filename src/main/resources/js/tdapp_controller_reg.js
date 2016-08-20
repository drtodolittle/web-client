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
			$scope.user.password== undefined
		){
			$scope.errormsg = "Registration-Error: Enter valid data.";
			return;
		}
		var email = $scope.user.email;
		var password = $scope.user.password;
		firebase.auth().createUserWithEmailAndPassword(email,password).then(
			function(data){
				var user = firebase.auth().currentUser;
				user.sendEmailVerification()
				.then(function(){
					alert('Registration successful. A registration email is waiting for you.');
					$window.location = "/#/login";
				})
				.catch(function(err){
					$scope.errormsg = "Registration-Error: "+error.message;
					$scope.$apply();
				});
			}
		).catch(function(error){
			var errorMessage = error.message;
			$scope.errormsg = "Registration-Error: "+errorMessage;
			$scope.$apply();
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
