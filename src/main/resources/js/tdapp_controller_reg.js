/*

	tdapp_controller_reg.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

tdapp.controller("RegCtrl",function($scope,$http,$window,appdata,Backend){

	// Go login

	$scope.goLogin = function(){
		$window.location = "/#/login";
	}

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
					// Prepare for work
					var msg = ""
					msg += "Registration successful! \n";
					msg += "A verification email is waiting for you. \n";
					msg += "You can go on using Dr ToDo Little now! ";
					alert(msg);					
					user.getToken().then(function(res){
						appdata.token = res;
						appdata.user = user.email;
						appdata.lip = "firebase";
						$http.defaults.headers.common['Authorization'] = "Basic " + res;
						// Create Welcome-Todo
						var welcometodo = {};
						welcometodo.topic = "Welcome to Dr ToDo Little!";
						welcometodo.done = false;
						Backend.postTodo(welcometodo);
						// Continue...
						$scope.filtertag = "All"; // Set filtertag before calling Backend.getTodos()
						$scope.errormsg = "";
						appdata.errormsg = "";
						$window.location = "/#/main"
					})
				})
				.catch(function(err){
					$scope.errormsg = "Registration-Error: " + error.message;
					$scope.$apply();
				})
			}
		).catch(function(error){
			$scope.errormsg = "Registration-Error: " + error.message;
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
