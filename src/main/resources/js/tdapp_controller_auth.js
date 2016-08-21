/*

	tdapp_controller_auth.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

tdapp.controller("AuthCtrl",function($scope,$http,$cookies,$window,$timeout,appdata,TDMgr,Backend,Autologin){

	// Injection

	Autologin.setScope($scope);
	Backend.setScope($scope);
	
	// Login

	function goMain(){
		$timeout(function(){
			$window.location = "/#/main";
		},1000);
	}
	
	$scope.doLogin = function(){
		$scope.errormsg = "";
		if($window.location.host=="localhost"){
			appdata.server = appdata.localserver;
		}
		if(
			$scope.user==undefined ||
			$scope.user.email==undefined ||
			$scope.user.password==undefined
		){
			$scope.errormsg = "Login-Error: Enter a valid E-Mail-Adress and a valid password!";
			return;
		}
		var user = $scope.user.email;
		var password = $scope.user.password;
		$window.location = "/#/working";
		firebase.auth().signInWithEmailAndPassword(user,password).then(
			function(data){
				if(!data.emailVerified){
					throw {
						message:"Your have to verify you E-Mail-Adress before you can log in."
					};
				}
				appdata.fblogin = true;
				appdata.currentuser = data.email;
				var now = new Date();
				var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
				$cookies.put(appdata.usercookie,appdata.currentuser,{expires:exp});
				$cookies.put(appdata.lipcookie,"fbcore",{expires:exp});
				data.getToken().then(function(token){
					// Create cookie
					var now = new Date();
					var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
					$cookies.put(appdata.tokencookie,token,{expires:exp});
					// Modifiy headers
					$http.defaults.headers.common['Authorization'] = "Basic " + token;
					$scope.filtertag = 'All'; // Set filtertag before calling Backend.getTodos()
					appdata.errormsg = "";
					$scope.errormsg = "";
					goMain();
				}).catch(function(error){
					appdata.errormsg = "Login-Error: "+error.message;
					Autologin.doLogout();
				});
			}
		).catch(function(error){
			appdata.errormsg = "Login-Error: "+error.message;
			Autologin.doLogout();
		});
	}

	$scope.doLoginWithGoogle = function(){
		var provider = new firebase.auth.GoogleAuthProvider();
		$window.location = "/#/working";
		firebase.auth().signInWithPopup(provider).then(function(result){
			appdata.currentuser = result.user.email;
			appdata.fblogin = false;			
			var user = firebase.auth().currentUser;
			if(user){
				user.getToken().then(function(token){
					// Create cookie
					var now = new Date();
					var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
					$cookies.put(appdata.tokencookie,token,{expires:exp});
					$cookies.put(appdata.usercookie,appdata.currentuser,{expires:exp});
					$cookies.put(appdata.lipcookie,"google",{expires:exp});
					// Modifiy headers
					$http.defaults.headers.common['Authorization'] = "Basic " + token;
					$scope.filtertag = 'All'; // Set filtertag before calling Backend.getTodos()
					$scope.errormsg = "";
					appdata.errormsg = "";
					goMain();
				}).catch(function(error){
					appdata.errormsg = "Login-Error: "+error.message;
					Autologin.doLogout();
				});
			} else {
				appdata.errormsg = "Login-Error: Not logged in.";
				Autologin.doLogout();
			}
		}).catch(function(error){
			appdata.errormsg = "Login-Error: "+error.message;
			Autologin.doLogout();
		});	
	}	

	// Keyboard

	$scope.loginKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			$scope.doLogin();
		}
	}

	// Register

	$scope.goRegister = function(){
		$window.location = "/#/register";
	};

	// Finish

	$("#liusername").focus();
	$scope.errormsg = appdata.errormsg;
	
	Autologin.check(); // Do automatic login if cookies are available
});
