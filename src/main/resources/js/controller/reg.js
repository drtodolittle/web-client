/*

	tdapp_controller_reg.js

*/
tdapp.controller("RegCtrl",function($scope,$http,$location,appdata,backend){

	// Go login

	$scope.goLogin = function(){
		$location.path("/login");
	}

	// Database

	function saveUser(){
		var uid = firebase.auth().currentUser.uid;
		if(uid!=undefined){
			firebase.database().ref('/data/reg/'+uid).set({
				regts : firebase.database.ServerValue.TIMESTAMP, // Registration timestamp
				llts : 0 // Last login timestamp
			})
			.catch(function(err){
				console.log("Error: " + err.message);
			});
		}
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
					user.getToken().then(function(res){
						appdata.token = res;
						appdata.user = user.email;
						appdata.lip = "firebase";
						$http.defaults.headers.common['Authorization'] = "Basic " + res;
						// Create Welcome-Todo
						var welcometodo = {};
						welcometodo.topic = "Welcome to Dr ToDo Little!";
						welcometodo.done = false;
						backend.postTodo(welcometodo);
						// Continue...
						$scope.filtertag = "All"; // Set filtertag before calling backend.getTodos()
						$scope.errormsg = "";
						appdata.errormsg = "";
						saveUser();
						var msg = ""
						msg += "Registration successful! \n";
						msg += "A verification email is waiting for you. \n";
						msg += "But you can go on using Dr ToDo Little now \n";
						msg += "for 24 hours without verification.";
						alert(msg);
						$location.path("/main")
					})
					.catch(function(err){
						$scope.errormsg = "Registration-Error: " + err.message;
						$scope.$apply()
					})
				})
				.catch(function(err){
					$scope.errormsg = "Registration-Error: " + err.message;
					$scope.$apply()
				})
			}
		).catch(function(err){
			$scope.errormsg = "Registration-Error: " + err.message;
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
