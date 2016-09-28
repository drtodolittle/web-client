tdapp.directive('authdialog', function() {

  return {
    restrict: 'E',
    templateUrl: 'templates/dialog.html',
    controller: function($scope, $firebaseAuth, $http, appdata, $location, $route, localStorageService) {

      $scope.doLoginWithGoogle = function(){
    		var provider = new firebase.auth.GoogleAuthProvider();
    		firebase.auth().signInWithPopup(provider).then(function(res){
    			appdata.user = res.user.email;
    			appdata.lip = "google";
    			var user = firebase.auth().currentUser;
          $scope.close_dialog();
    			if(user){
    				user.getToken().then(function(res){
              appdata.token = res;
    					$http.defaults.headers.common['Authorization'] = "Bearer " + res;
              if ($scope.rememberme) {
                localStorageService.set("logintoken", res);
              }
    					$scope.filtertag = "All"; // Set filtertag before calling backend.getTodos()
    					$scope.errormsg = "";
    					appdata.errormsg = "";
    					$route.reload();
    				}).catch(function(error){
    					appdata.errormsg = "Login-Error: " + error.message;
    					autologinservice.doLogout(); // Will undef appdata
    				});
    			} else {
    				appdata.errormsg = "Login-Error: Not logged in.";
    				autologinservice.doLogout(); // Will undef appdata
    			}
    		}).catch(function(error){
    			appdata.errormsg = "Login-Error: " + error.message;
    			autologinservice.doLogout(); // Will undef appdata
    		});
    	}

      $scope.doLogin = function(){
        var auth = $firebaseAuth();

    		var user = $scope.email;
    		appdata.tmpuser = user;
    		var password = $scope.password;
        $scope.close_dialog();

    		appdata.lip = "firebase";
    		auth.$signInWithEmailAndPassword(user,password)
    		.then(function(res){
    			var uid = res.uid;
    			appdata.user = res.email;
    				res.getToken().then(function(res){
    					appdata.token = res;
    					$http.defaults.headers.common['Authorization'] = "Bearer " + res;
              if ($scope.rememberme) {
                localStorageService.set("logintoken", res);
              }
    					$scope.filtertag = "All"; // Set filtertag before calling backend.getTodos()
    					$scope.errormsg = "";
    					appdata.errormsg = "";
    					$route.reload();
            })
    				.catch(function(error){
    					appdata.errormsg = "Login-Error: " + error.message;
    					autologinservice.doLogout(); // Will undef appdata
    				});
    		}) // signInWithEmailAndPassword
    		.catch(function(error){
    			appdata.errormsg = "Login-Error: " + error.message;
    			autologinservice.doLogout(); // Will undef appdata
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
