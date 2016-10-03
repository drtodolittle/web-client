tdapp.directive('authdialog', function() {

  return {
    restrict: 'E',
    templateUrl: 'templates/dialog.html',
    controller: function($scope, $firebaseAuth, $http, $location, $route, localStorageService, backend, $timeout) {

      var auth = $firebaseAuth();

      $scope.resetpwd = function() {

        auth.$sendPasswordResetEmail($scope.email).then(function(){
    			alert("An email is waiting for you to reset your password.");
          $scope.select_login();
    		},function(error){
    			var errmsg = "Password reset error: "+error.message;
    		});

      }

      $scope.register = function() {
    		if( $scope.email==undefined || $scope.password== undefined ) {
    			$scope.errormsg = "Registration-Error: Enter valid data.";
    			return;
    		}
    		var email = $scope.email;
    		var password = $scope.password;
            var auth = firebase.auth()
    		auth.createUserWithEmailAndPassword(email,password)
            .then(function(data){
    		        var user = auth.currentUser;
    				user.sendEmailVerification()
    				.then(function(){
    					// Prepare for work
    					user.getToken().then(function(res){
    						$http.defaults.headers.common['Authorization'] = "Bearer " + res;
    						// Create Welcome-Todo
    						var welcometodo = {};
    						welcometodo.topic = "Welcome to Dr ToDo Little!";
    						welcometodo.done = false;
    						backend.postTodo(welcometodo);
    						// Continue...
    						$scope.filtertag = "All"; // Set filtertag before calling backend.getTodos()
    						$scope.errormsg = "";
    						var msg = ""
    						msg += "Registration successful! \n";
    						msg += "A verification email is waiting for you. \n";
    						msg += "But you can go on using Dr ToDo Little now \n";
    						msg += "for 24 hours without verification.";
    						alert(msg);
                            $scope.close_dialog()
    						$location.path("/")
                            $route.reload();
    					})
    					.catch(function(err){
    						$scope.errormsg = "Registration-Error: " + err.message;
                            alert($scope.errormsg)
    					})
    				})
    				.catch(function(err){
    					$scope.errormsg = "Registration-Error: " + err.message;
                        alert($scope.errormsg)
    				})
    			}
    		).catch(function(err){
    			$scope.errormsg = "Registration-Error: " + err.message;
                alert($scope.errormsg)
    		});
    	}


      $scope.loginWithGoogle = function(){
    		var provider = new firebase.auth.GoogleAuthProvider();
    		firebase.auth().signInWithPopup(provider).then(function(res){
    			var user = firebase.auth().currentUser;
          $scope.close_dialog();
    			if(user){
    				user.getToken().then(function(res){
    					$http.defaults.headers.common['Authorization'] = "Bearer " + res;
              if ($scope.rememberme) {
                localStorageService.set("logintoken", res);
              }
    					$scope.filtertag = "All"; // Set filtertag before calling backend.getTodos()
    					$scope.errormsg = "";
    					$route.reload();
    				}).catch(function(error){
              alert("Error: " + error);
    				});
    			} else {
            alert("Error: " + error);
    			}
    		}).catch(function(error){
          alert("Error: " + error);
    		});
    	}

      $scope.login = function(){
        var auth = $firebaseAuth();

    		var user = $scope.email;
    		var password = $scope.password;
        $scope.close_dialog();
    		auth.$signInWithEmailAndPassword(user,password)
    		.then(function(res){
    			var uid = res.uid;

    				res.getToken().then(function(res){

    					$http.defaults.headers.common['Authorization'] = "Bearer " + res;
              if ($scope.rememberme) {
                localStorageService.set("logintoken", res);
              }
    					$scope.filtertag = "All"; // Set filtertag before calling backend.getTodos()
    					$scope.errormsg = "";
    					$route.reload();
            })
    				.catch(function(error){
              //todo Errorhandling
            });
    		}) // signInWithEmailAndPassword
    		.catch(function(error){
    			//todo Errorhandling
    		});
    	};


      $scope.open_dialog = function() {
        $scope.cdusermodal = true;
        $scope.select_login();
      };

      $scope.select_login = function() {
        $scope.loginselected = true;
        $scope.registerselected = false;
        $scope.resetselected = false;
      };

      $scope.select_register = function() {
        $scope.loginselected = false;
        $scope.registerselected = true;
        $scope.resetselected = false;
      };

      $scope.select_reset = function() {
        $scope.loginselected = false;
        $scope.registerselected = false;
        $scope.resetselected = true;
      };

      $scope.close_dialog = function() {
        $scope.cdusermodal = false;
        $scope.loginselected = false;
        $scope.registerselected = false;
        $scope.resetselected = false;
      };

      $scope.rememberme=true;
    }
  }
});
