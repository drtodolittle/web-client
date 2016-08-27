/*

	tdapp_controller_auth.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

tdapp.controller("AuthCtrl",function($scope,$http,$cookies,$window,$timeout,appdata,TDMgr,Backend,Autologin){

	// Injection

	Autologin.setScope($scope);
	Autologin.setHttp($http);
	Backend.setScope($scope);

	// Reset password

	$scope.goResetPwd = function(){
		$window.location = "/#/resetpwd";
	}

	// Remember me
	$scope.doRememberMe = function(){
		var chked =  $('#rememberme').prop('checked');
		if(!chked){
			$('#rememberme').prop("checked", true);
			appdata.rememberme = true;
		} else {
			$('#rememberme').prop("checked", false);
			appdata.rememberme = false;
		}
	}

	// Login

	function goMain(){
		$timeout(function(){
			$window.location = "/#/main";
		},1000);
	}

	$scope.doLogin = function(){
		appdata.rememberme = $('#rememberme').prop('checked');
		$('#libut').blur();
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
				//if(!data.emailVerified){
				//	throw {
				//		message:"Your have to verify you E-Mail-Adress before you can log in."
				//	};
				//}
				appdata.lip = "fbcore";
				appdata.user = data.email;
				data.getToken().then(function(_token){
					// Create cookie
					if(appdata.rememberme){
						var now = new Date();
						var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
						var cookiedata = {
							token : _token,
							user : appdata.user,
							lip : "fbcore"
						};
						$cookies.put(appdata.derdrcookie,JSON.stringify(cookiedata),{expires:exp});
					}
					appdata.token = _token;
					// Modifiy headers
					$http.defaults.headers.common['Authorization'] = "Basic " + _token;
					$scope.filtertag = 'All'; // Set filtertag before calling Backend.getTodos()
					appdata.errormsg = "";
					$scope.errormsg = "";
					goMain();
				}).catch(function(error){
					appdata.errormsg = "Login-Error: " + error.message;
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
			appdata.user = result.user.email;
			appdata.lip = "google";
			var user = firebase.auth().currentUser;
			if(user){
				user.getToken().then(function(_token){
					// Create cookie
					var now = new Date();
					var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
					var tok = _token;
					if(appdata.rememberme){
						var now = new Date();
						var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
						var cookiedata = {
							token : tok,
							user : appdata.user,
							lip : "google"
						};
						console.log(cookiedata);
						$cookies.put(appdata.derdrcookie,JSON.stringify(cookiedata),{expires:exp});
					}
					// Modifiy headers
					$http.defaults.headers.common['Authorization'] = "Basic " + tok;
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
