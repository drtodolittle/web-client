/*

	tdapp_controller_auth.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

tdapp.controller("AuthCtrl",function($scope,$http,$cookies,$window,$timeout,appdata,TDMgr,Backend,Autologin){

	// Injection

	Autologin.setScope($scope);
	Backend.setScope($scope);

	// Reset password

	$scope.goResetPwd = function(){
		appdata.errormsg = "";
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
		appdata.errormsg = "";
		$timeout(function(){
			$window.location = "/#/main";
		},1000);
	}

	$scope.doLogin = function(){
		$('#libut').blur();
		$scope.errormsg = "";
		appdata.rememberme = $('#rememberme').prop('checked');
		if(
			$scope.email==undefined ||
			$scope.password==undefined
		){
			$scope.errormsg = "Login-Error: Enter a valid E-Mail-Adress and a valid password!";
			return;
		}
		var user = $scope.email;
		appdata.tmpuser = user;
		var password = $scope.password;
		$window.location = "/#/working";
		appdata.lip = "firebase";
		firebase.auth().signInWithEmailAndPassword(user,password)
		.then(function(res){
			var uid = res.uid;
			appdata.user = res.email;
			var continueWithWork = function(){
				res.getToken().then(function(res){
					if(appdata.rememberme){
						var now = new Date();
						var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
						var cookie = {
							token : res,
							user : appdata.user,
							lip : appdata.lip
						}
						$cookies.put(appdata.cookiename,JSON.stringify(cookie),{expires:exp});
					}
					appdata.token = res;
					$http.defaults.headers.common['Authorization'] = "Basic " + res;
					$scope.filtertag = "All"; // Set filtertag before calling Backend.getTodos()
					$scope.errormsg = "";
					appdata.errormsg = "";
					goMain();
				})
				.catch(function(error){
					appdata.errormsg = "Login-Error: " + error.message;
					Autologin.doLogout(); // Will undef appdata
				})
			} // continueWithWork
			if(!res.emailVerified){
				firebase.database().ref('/data/user/'+uid).once('value')
				.then(function(res){
					var update = {};
					update['/data/user/'+uid] = {
						currentdate : firebase.database.ServerValue.TIMESTAMP,
						createdate : res.val().createdate
					};
					firebase.database().ref().update(update)
					.then(function(){
						firebase.database().ref('/data/user/'+uid).once('value')
						.then(function(res){
							var createdate = res.val().createdate;
							var currentdate = res.val().currentdate;
							//if((createdate+1000)<currentdate){ // 1s
							if((createdate+1000*60*60*24)<currentdate){ // 24h
								appdata.errormsg = "Login-Error: You now have to verify your email to use Dr ToDo Little.";
								Autologin.doLogout();
							} else {
								continueWithWork();
							}
						})
						.catch(function(error){
							appdata.errormsg = "Login-Error: " + error.message;
							Autologin.doLogout(); // Will undef appdata
						})
					})
					.catch(function(error){
						appdata.errormsg = "Login-Error: " + error.message;
						Autologin.doLogout(); // Will undef appdata
					})
				}) // emailVerified
				.catch(function(error){
					appdata.errormsg = "Login-Error: " + error.message;
					Autologin.doLogout(); // Will undef appdata
				})
			} else {
				continueWithWork();
			}
		}) // signInWithEmailAndPassword
		.catch(function(error){
			appdata.errormsg = "Login-Error: " + error.message;
			Autologin.doLogout(); // Will undef appdata
		})
	}

	$scope.doLoginWithGoogle = function(){
		$('#libutgoogle').blur();
		appdata.lip = "google";
		var provider = new firebase.auth.GoogleAuthProvider();
		$window.location = "/#/working";
		firebase.auth().signInWithPopup(provider).then(function(res){
			appdata.user = res.user.email;
			appdata.lip = "google";
			var user = firebase.auth().currentUser;
			if(user){
				user.getToken().then(function(res){
					if(appdata.rememberme){
						var now = new Date();
						var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
						var cookiedata = {
							token : res,
							user : appdata.user,
							lip : appdata.lip
						};
						$cookies.put(appdata.cookiename,JSON.stringify(cookiedata),{expires:exp});
					}
					appdata.token = res;
					$http.defaults.headers.common['Authorization'] = "Basic " + res;
					$scope.filtertag = 'All'; // Set filtertag before calling Backend.getTodos()
					$scope.errormsg = "";
					appdata.errormsg = "";
					goMain();
				}).catch(function(error){
					appdata.errormsg = "Login-Error: " + error.message;
					Autologin.doLogout(); // Will undef appdata
				});
			} else {
				appdata.errormsg = "Login-Error: Not logged in.";
				Autologin.doLogout(); // Will undef appdata
			}
		}).catch(function(error){
			appdata.errormsg = "Login-Error: " + error.message;
			Autologin.doLogout(); // Will undef appdata
		});
	}

	// Keyboard

	$scope.loginKeydown = function(e){
		var k = e.keyCode;
		if(k==13){ // Return
			e.preventDefault();
			$scope.doLogin();
		}
	}

	// Register

	$scope.goRegister = function(){
		appdata.errormsg = "";
		$('#libutreg').blur();
		$window.location = "/#/register";
	};

	// Finish

	$scope.errormsg = appdata.errormsg;
	$scope.email = appdata.tmpuser;

	Autologin.check(); // Do automatic login if cookies are available

	$("#liuser").focus();

});
