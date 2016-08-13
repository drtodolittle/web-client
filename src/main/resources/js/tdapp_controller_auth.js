/*

	tdapp_controller_auth.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

tdapp.controller("AuthCtrl",function($scope,$http,$auth,$cookies,$window,$timeout,appdata,TDMgr,Backend,Autologin,$firebaseAuth){

	// Injection

	Autologin.setScope($scope);
	Backend.setScope($scope);
	
	// Login

	function gomain(){
		$timeout(function(){
			$window.location = "/#/main";
		},1000);
	}

	function locallogin(){ // No basic authentication (just communicate with localhost)
		$window.location = "/#/working";
		appdata.server = appdata.localserver;
		var now = new Date();
		var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
		$cookies.put(appdata.cookiename,'bla',{expires:exp});
		$scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
		$scope.errormsg = "";
		gomain();
	}

	$scope.dologin = function(){
		if($window.location.host=="localhost"){
			locallogin();
			return;
		}
		firebase.auth().signInWithEmailAndPassword(
			$scope.user.email,
			$scope.user.password
		).then(
			function(data){
				console.log("Login correct!");
				// Create cookie
				var now = new Date();
				var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
				$cookies.put(appdata.cookiename,data.getToken(),{expires:exp});
				// Modifiy headers
				$http.defaults.headers.common['Authorization'] = "Basic " + data.getToken();
				$scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
				$scope.errormsg = "";
				gomain();
			}
		).catch(function(error){
			$scope.errormsg = "Login-Error."
			console.log("Authentication failed: ", error.message);			
		});			
	}

	$scope.dologinWithGoogle = function(){
		var auth = $firebaseAuth();
		// Login with Firebase/Google
		auth.$signInWithPopup("google").then(
			function(firebaseUser){
				console.log("Signed in as: ", firebaseUser.user.email);
				console.log("Credentials: ", firebaseUser.credential);
				$scope.email = firebaseUser.user.email;
				firebaseUser.user.getToken(false).then(function(idToken){
					console.log("Token: ", idToken);			
					// Create cookie
					var now = new Date();
					var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
					$cookies.put(appdata.cookiename,idToken,{expires:exp});
					// Modifiy headers
					$http.defaults.headers.common['Authorization'] = "Basic " + idToken;
					$scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
					$scope.errormsg = "";
					gomain();
				});
			}
		).catch(function(error){
			$scope.errormsg = "Login-Error."
			console.log("Authentication failed: ", error);
		});
	}

	// Keyboard

	$scope.loginKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			$scope.dologin();
		}
	}

	// Register

	$scope.showRegister = function(){
		$window.location = "/#/register";
	};

	// Finish

	$("#liusername").focus()

	Autologin.check(); // do automatic login if cookie/token is available
});
