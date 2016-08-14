/*

	tdapp_controller_auth.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

//tdapp.controller("AuthCtrl",function($scope,$http,$cookies,$window,$timeout,appdata,TDMgr,Backend,Autologin,$firebaseAuth){
tdapp.controller("AuthCtrl",function($scope,$http,$cookies,$window,$timeout,appdata,TDMgr,Backend,Autologin){

	// Injection

	Autologin.setScope($scope);
	Backend.setScope($scope);
	
	// Login

	function gomain(){
		$timeout(function(){
			$window.location = "/#/main";
		},1000);
	}
	
	$scope.dologin = function(){
		$scope.errormsg = "";
		if($window.location.host=="localhost"){
			appdata.server = appdata.localserver;
		}
		if($scope.user==undefined){
			$scope.errormsg = "Login-Error: Enter a valid E-Mail-Adress and a valid password!";
			return;
		}
		firebase.auth().signInWithEmailAndPassword(
			$scope.user.email,
			$scope.user.password
		).then(
			function(data){
				appdata.fblogin = true;
				appdata.currentuser = data.email;
				var now = new Date();
				var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
				$cookies.put(appdata.usercookie,appdata.currentuser,{expires:exp});
				data.getToken().then(function(token){
					// Create cookie
					var now = new Date();
					var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
					$cookies.put(appdata.tokencookie,token,{expires:exp});
					// Modifiy headers
					$http.defaults.headers.common['Authorization'] = "Basic " + token;
					$scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
					$scope.errormsg = "";
					gomain();
				});
			}
		).catch(function(error){
			$window.location = "/#/login";
			$scope.errormsg = "Login-Error: "+error.message;
			console.log($scope.errormsg);
			$scope.$apply();
		});
	}

	$scope.dologinWithGoogle = function(){
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).then(function(result){
			var token = result.credential.accessToken;
			$scope.email = result.user.email;
			$scope.currentuser = result.user.email;
			// Create cookie
			var now = new Date();
			var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
			$cookies.put(appdata.cookiename,token,{expires:exp});
			// Modifiy headers
			$http.defaults.headers.common['Authorization'] = "Basic " + token;
			$scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
			$scope.errormsg = "";
			gomain();			
		}).catch(function(error){
			$scope.errormsg = "Login-Error: "+error.message;
			console.log($scope.errormsg);
			$scope.$apply();
		});	
	}	
	
	/* Old
	$scope.dologinWithGoogle = function(){
		var auth = $firebaseAuth();
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
	*/

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

	$("#liusername").focus();

	Autologin.check(); // do automatic login if cookie/token is available
});
