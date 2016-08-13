/*

	tdapp_controller_auth.js

*/
var tdapp = require('./tdapp');

tdapp.controller("AuthCtrl",function($scope,$http,$auth,$cookies,$window,$timeout,appdata,TDMgr,Backend,Autologin,$firebaseAuth){

	// Injection

	Autologin.setScope($scope);
	Backend.setScope($scope);


	/* Satellizer
	$scope.authenticate = function(provider){
		$auth.authenticate(provider)
		.then(function(res){
			if($auth.isAuthenticated){
				var dtok = jwt_decode(res.data.token);
				$scope.user = {};
				$scope.user.id = dtok.sub;
			}
		});
	};
	*/
	
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

	/* Old login
	$scope.dologin = function(){
		if($window.location.host=="localhost"){
			locallogin();
			return;
		}
		$auth.login($scope.user)
			.then(function(response){
				$window.location = "/#/working";
				// Create cookie
				var now = new Date();
				var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
				$cookies.put(appdata.cookiename,response.data.token,{expires:exp});
				// Modifiy headers
				$http.defaults.headers.common['Authorization'] = "Basic " + response.data.token;
				$scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
				$scope.errormsg = "";
				gomain();
			})
			.catch(function(error){
				$scope.errormsg = "Login-Error.";
				console.log(error);
			});
	}
	*/

	// Login via firebase
	$scope.dologin = function(){
		if($window.location.host=="localhost"){
			locallogin();
			return;
		}
		var auth = $firebaseAuth();
		firebase.auth().signInWithEmailAndPassword($scope.user.email,$scope.user.password).catch(function(error){
		  var errorCode = error.code;
		  var errorMessage = error.message;
		});
		console.log("Error: "+errorCode+": "+errorMessage);
	}

		/* Old login
		$auth.login($scope.user)
			.then(function(response){
				$window.location = "/#/working";
				// Create cookie
				var now = new Date();
				var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
				$cookies.put(appdata.cookiename,response.data.token,{expires:exp});
				// Modifiy headers
				$http.defaults.headers.common['Authorization'] = "Basic " + response.data.token;
				$scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
				$scope.errormsg = "";
				gomain();
			})
			.catch(function(error){
				$scope.errormsg = "Login-Error.";
				console.log(error);
			});
		*/
	}
		
	$scope.dologinWithGoogle = function(){
		var auth = $firebaseAuth();
		// Login with Firebase/Google
		auth.$signInWithPopup("google").then(function(firebaseUser){
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
		}).catch(function(error){
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
