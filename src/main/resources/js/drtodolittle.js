;(function() {
"use strict";

/*

	tdapp.js

*/
var tdapp = angular.module('tdapp',['ngCookies','ngRoute', 'firebase']);

tdapp.config(["$routeProvider", "$locationProvider", "$compileProvider", "$httpProvider", function($routeProvider,$locationProvider,$compileProvider,$httpProvider) {
	// Routing
	$routeProvider
      .when('/', {
        templateUrl : 'main.html',
				controller : 'MainCtrl'
      })
			.when('/login', {
        templateUrl : 'login.html',
				controller : 'AuthCtrl'
      })
			.when('/working', {
        templateUrl : 'working.html'
      })
			.when('/register', {
        templateUrl : 'register.html',
				controller : 'RegCtrl'
      })
			.when('/resetpwd', {
        templateUrl : 'resetpwd.html',
				controller : 'ResetPwdCtrl'
    	})
			.when('/settings', {
        templateUrl : 'settings.html',
				controller : 'SettingsCtrl'
      })
			.when('/chpwd', {
        templateUrl : 'chpwd.html',
				controller : 'SettingsCtrl'
      })
			.when('/egg', {
        templateUrl : 'egg.html'
      })
			.when('/error', {
        templateUrl : 'error.html'
      })
			.otherwise({
				redirectTo: '/error'
			});
	// Performance improvement
	$compileProvider.debugInfoEnabled(false);
	// Disable hashbang urls
	$locationProvider.html5Mode(true);

	$httpProvider.interceptors.push('logininterceptor');
}])

tdapp.value(
	"appdata",{
		name : "drtodolittle",
		nickname : "derdr",
		cookiename : "derdrcookie",
		localserver : "http://localhost:3000/api/todos",
		server : "https://app.drtodolittle.de/api/todos",
		rememberme : undefined,
		token : undefined,
		user : undefined,
		lip : undefined,
		errormsg : ""
	}
);

/*

	tdapp_controller_auth.js

*/
tdapp.controller("AuthCtrl",["$scope", "$http", "$cookies", "$location", "$timeout", "appdata", "autologinservice", function($scope,$http,$cookies,$location,$timeout,appdata,autologinservice){

	// Injection

	autologinservice.setScope($scope);


	// Reset password

	$scope.goResetPwd = function(){
		appdata.errormsg = "";
		$location.path("/resetpwd");
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
			$location.path("/");
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
		$location.path("/working");
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
					$http.defaults.headers.common['Authorization'] = "Bearer " + res;
					$scope.filtertag = "All"; // Set filtertag before calling backend.getTodos()
					$scope.errormsg = "";
					appdata.errormsg = "";
					goMain();
				})
				.catch(function(error){
					appdata.errormsg = "Login-Error: " + error.message;
					autologinservice.doLogout(); // Will undef appdata
				})
			} // continueWithWork
			if(!res.emailVerified){
				firebase.database().ref('/data/reg/'+uid).once('value')
				.then(function(res){
					if(res==null || res==undefined){
						throw { message : 'Invalid userdata on server.' }
					}
					var update = {};
					update['/data/reg/'+uid] = {
						regts : res.val().regts,
						llts : firebase.database.ServerValue.TIMESTAMP
					};
					firebase.database().ref().update(update)
					.then(function(){
						firebase.database().ref('/data/reg/'+uid).once('value')
						.then(function(res){
							var regts = res.val().regts;
							var llts = res.val().llts;
							if((regts+1000*60*60*24)<llts){ // 24h
								appdata.errormsg = "Login-Error: You now have to verify your email to use Dr ToDo Little.";
								autologinservice.doLogout();
							} else {
								continueWithWork();
							}
						})
						.catch(function(error){
							appdata.errormsg = "Login-Error: " + error.message;
							autologinservice.doLogout(); // Will undef appdata
						})
					})
					.catch(function(error){
						appdata.errormsg = "Login-Error: " + error.message;
						autologinservice.doLogout(); // Will undef appdata
					})
				}) // emailVerified
				.catch(function(error){
					appdata.errormsg = "Login-Error: " + error.message;
					autologinservice.doLogout(); // Will undef appdata
				})
			} else {
				continueWithWork();
			}
		}) // signInWithEmailAndPassword
		.catch(function(error){
			appdata.errormsg = "Login-Error: " + error.message;
			autologinservice.doLogout(); // Will undef appdata
		})
	}

	$scope.doLoginWithGoogle = function(){
		$('#libutgoogle').blur();
		appdata.lip = "google";
		var provider = new firebase.auth.GoogleAuthProvider();
		$location.path("/working");
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
					$http.defaults.headers.common['Authorization'] = "Bearer " + res;
					$scope.filtertag = 'All'; // Set filtertag before calling backend.getTodos()
					$scope.errormsg = "";
					appdata.errormsg = "";
					goMain();
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
		$location.path("/register");
	};

	// Finish

	$scope.errormsg = appdata.errormsg;
	$scope.email = appdata.tmpuser;

	autologinservice.check(); // Do automatic login if cookies are available

	$("#liuser").focus();

}]);

/*

	tdapp_controller_main.js

*/
tdapp.controller("MainCtrl",
["$scope", "$timeout", "$interval", "$http", "$cookies", "$location", "$routeParams", "appdata", "todoservice", "backend", "autologinservice", function(
	$scope,
	$timeout,
	$interval,
	$http,
	$cookies,
	$location,
	$routeParams,
	appdata,todoservice,backend,autologinservice)
{

	// Injections

	autologinservice.setScope($scope);
	backend.setScope($scope);

	// General Done Filter

	$scope.showdone = false;
	$scope.showdonetext = "Show Done";

	// Go to settings

	$scope.goSettings = function(){
		$location.path("/settings");
	}

	// Show and hide custommenu (animated via jquery)

	$scope.tmpcustommenu = 0;
	$scope.showcustommenu = function(){
		if($scope.tmpcustommenu==0){
			$scope.tmpcustommenu=1;
			$("#customnavbaricon").attr("src","images/arrow-left-3x.png");
			if(navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {
				$('body').scrollTop(0);
				$(".custommenu").animate({height:"126px"},500);
			} else {
				if($('html').scrollTop()>64){
					$('html').animate({scrollTop:0},500,function(){
						$(".custommenu").animate({height:"126px"},500);
					});
				} else {
					$('html').scrollTop(0);
					$(".custommenu").animate({height:"126px"},500);
				}
			}
		} else {
			$scope.tmpcustommenu=0;
			$("#customnavbaricon").attr("src","images/menu-3x.png");
			$(".custommenu").animate({height:"0px"},500);
			$("#todotxta").focus();
		}
	}

	// Logout

	$scope.doLogout = function(){
		$location.path("/working");
		$timeout(function(){
			autologinservice.doLogout();
		},1000);
	}

	// Keyboard

	$scope.newtodoKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			if($scope.newtodotxt!=""){
				var newtodo = {};
				newtodo.topic = $scope.newtodotxt;
				newtodo.done = false;
				$scope.newtodotxt = "";
				backend.postTodo(newtodo);
				backend.incTodosTotal();
				todoservice.addTodoObj(newtodo);
				if($scope.showdone){
					$scope.showdone = false;
					$scope.showdonetext = "Show Done";
				}
				if(newtodo.tag!=undefined){
					$scope.filtertag = newtodo.tag;
				} else {
					$scope.filtertag = "All";
				}
				$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
				window.scrollTo(0,0);
				$("#todotxta").focus();
			}
		} else
		if(k==9){//tab
			e.preventDefault();
		}
	}

	$scope.todolineKeydown = function(e,id){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			var currentTodo = $('#todoid'+id);
			// Correct contenteditable behaviour
			currentTodo.html(currentTodo.html().replace('<br>',''));
			currentTodo.blur();
			var obj = todoservice.getTodoById(id);
			if(obj!=undefined){
				obj.topic = currentTodo.html();
				backend.putTodo(obj);
				var oldtag = obj.tag;
				todoservice.checkForHashtag(obj);
				if(oldtag!=undefined){
					var ttd = todoservice.getTodosByTag(oldtag);
					if(ttd.length<=0){
						todoservice.tags.splice(todoservice.tags.indexOf(oldtag),1);
					}
				}
				$scope.tags = (todoservice.getTags()).sort();
				$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
			}
		}
	}

	// Todo functions

	$scope.seltodoline = function(id){
		$("#todoid"+id).focus();
	}

	$scope.deltodo = function(obj){ // No animation
		obj.deleted = true;
		backend.delTodo(obj);
		backend.incTodosDeleted();
		todoservice.delTodo(obj);
		$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
	}

	$scope.togDone = function(obj){
		todoservice.togPreDone(obj);
		$timeout(function(){
			todoservice.togDone(obj); // Toggle todo local (within todoservice)
			if(obj.done){ // Toggle Todo on the server
				backend.doneTodo(obj);
				backend.incTodosDone();
			} else {
				backend.undoneTodo(obj);
				backend.incTodosUndone();
			}
			$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
		},1000);
	}

	// Filter function

	$scope.togShowdone = function(){
		$scope.showdone = !$scope.showdone;
		if($scope.showdone){
			$scope.showdonetext = "Show Open";
		} else {
			$scope.showdonetext = "Show Done";
		}
		$scope.todos=todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
	}

	// Tags

	$scope.getTodosByTag = todoservice.getTodosByTag;

	// Finish

	autologinservice.check(); // Do automatic login if cookies are available

	$("#todotxta").focus();

}]);

/*

	tdapp_controller_reg.js

*/
tdapp.controller("RegCtrl",["$scope", "$http", "$location", "appdata", "backend", function($scope,$http,$location,appdata,backend){

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
}]);

/*

	tdapp_controller_resetpwd.js

*/
tdapp.controller("ResetPwdCtrl",["$scope", "$location", "appdata", "autologinservice", function($scope,$location,appdata,autologinservice){

	// Go login

	$scope.goLogin = function(){
		$location.path("/login");
	}

	// Reset password

	$scope.doResetPwd = function(){
		$('#rb').blur();
		$scope.errormsg = "";
		appdata.errormsg = "";
		if($scope.email==undefined){
			$scope.errormsg = "Error: Enter valid data.";
			return;
		}
		var email = $scope.email;
		$location.path("/#/working");
		firebase.auth().sendPasswordResetEmail(email).then(function(){
			alert("An email is waiting for you to reset your password.");
			appdata.errormsg = "";
			autologinservice.doLogout();
		},function(error){
			var errmsg = "Password reset error: "+error.message;
			appdata.errormsg = errmsg;
			$location.path("/resetpwd");
		});
	}

	// Keyboard

	$scope.doResetPwdKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			$scope.doResetPwd();
		}
	}

	// Finish

	$("#liuser").focus();

	$scope.errormsg = appdata.errormsg;
	$scope.email = appdata.tmpuser;

}]);

/*

	tdapp_controller_settings.js

*/
tdapp.controller("SettingsCtrl",["$scope", "$http", "$location", "$cookies", "$timeout", "appdata", "autologinservice", function($scope,$http,$location,$cookies,$timeout,appdata,autologinservice){

	// Go main

	$scope.goMain = function(){
		$location.path("/");
	}

	// Go settings

	$scope.goSettings = function(){
		$location.path("/settings");
	}

	// Change passwrod

	$scope.goChPwd = function(){
		$location.path("/chpwd");
	}

	$scope.doChPwd = function(){
		$scope.errormsg = "";
		var user = firebase.auth().currentUser;
		if(!user){
			autologinservice.doLogout();
		}
		if(
			$scope.oldPassword==undefined ||
			$scope.newPassword==undefined
		){
			$scope.errormsg = "Error: Enter valid data.";
			return;
		}
		$location.path("/working");
		firebase.auth().signInWithEmailAndPassword(
			user.email,
			$scope.oldPassword
		).then(
			function(fbuser){
				fbuser.updatePassword(
					$scope.newPassword
				).then(
					function(){
						alert("Password change done!");
						$location.path("/#/settings");
					}
				).catch(function(error){
					var errmsg = "Error: " + error.message;
					$appdata.errormsg = errmsg;
					autologinservice.doLogout();
				});
			}
		).catch(function(error){
			var errmsg = "Error: " + error.message;
			$appdata.errormsg = errmsg;
			autologinservice.doLogout();
		});
	}

	// Reset password

	$scope.doResetPwd = function(){
		var user = firebase.auth().currentUser;
		if(user){
			$location.path("/working");
			var email = user.email;
			firebase.auth().sendPasswordResetEmail(email).then(function(){
				alert("An email is waiting for you to reset your password.");
				autologinservice.doLogout();
			},function(error){
				alert("Password reset error: "+error.message);
				autologinservice.doLogout();
			});
		} else {
			appdata.errormsg = "An error has occured. Login again!";
			autologinservice.doLogout();
		}
	}

	// Check for login, redirect if not logged in

	if(
		appdata.user==undefined &&
		appdata.token==undefined
	){
		var _dr = $cookies.get(appdata.derdrcookie);
		if (_dr==undefined){
			autologinservice.doLogout();
		} else {
			var dr = JSON.parse(_dr);
			appdata.user = dr.user;
			appdata.token = dr.token;
			appdata.lip = dr.lip;
		}
	}

	$scope.user = appdata.user;
	$scope.lip = appdata.lip;

	$('#oldpassword').focus();

}]);

tdapp.directive('authdialog', function() {

  return {
    restrict: 'E',
    templateUrl: 'templates/dialog.html',
    controller: ["$scope", "$firebaseAuth", "autologinservice", "$http", "appdata", "$location", function($scope, $firebaseAuth, autologinservice, $http, appdata, $location) {
      //$scope.cdusermodal = true;

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
    					$scope.filtertag = "All"; // Set filtertag before calling backend.getTodos()
    					$scope.errormsg = "";
    					appdata.errormsg = "";
    					$location.path("/");
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
    }]
  }
});

/*

	tdapp_service_autologin.js

*/
tdapp.service('autologinservice',
["$http", "$location", "$cookies", "$timeout", "$compile", "$routeParams", "appdata", "todoservice", "backend", function(
	$http,
	$location,
	$cookies,
	$timeout,
	$compile,
	$routeParams,
	appdata,todoservice,backend
){

	// Injection

	var _scope;
	this.setScope = function(scope){
		_scope = scope;
	}

	//  Get todos

	this.getAllTodos = function(){
		_scope.filtertag = 'All'; // Set filtertag before calling Backend.getTodos()
		backend.getTodos(
			function(){
				_scope.tags = (todoservice.getTags()).sort();
				_scope.todos = todoservice.getTodosByTag(_scope.filtertag,_scope.showdone)
				if(
					$routeParams.type!=undefined &&
					$routeParams.id!=undefined &&
					$routeParams.type=="todo"
				){
					var todo = todoservice.getTodoById($routeParams.id)
					if(todo!=undefined){
						var todos = [];
						todos.push(todo);
						_scope.todos = todos;
					} else {
						_scope.todos = [];
					}
				}
				if(
					$routeParams.type!=undefined &&
					$routeParams.id!=undefined &&
					$routeParams.type=="tag"
				){
					_scope.todos = todoservice.getTodosByTag("#"+$routeParams.id,false);
				}
				if(
					$routeParams.type==undefined &&
					$routeParams.id==undefined &&
					$routeParams.type==undefined
				){
					$location.path("/");
				}
				if(typeof window.orientation == 'undefined'){ // Workaround for mobile devices
					$("#todotxta").blur().focus();
				}
			}
		)
	}

	// Logout (with undef appdata)

	this.doLogout = function(){
		$cookies.remove(appdata.cookiename);
		todoservice.clearTodos();
		appdata.user = undefined;
		appdata.lip = undefined;
		appdata.token = undefined;
		appdata.rememberme = undefined;
		$location.path("/login");
		firebase.auth().signOut()
		.catch(function(err){
			console.log("Error: " + err.message);
		})
		$timeout(function(){
			$("#liuser").focus();
		},128);
	}

	// Check (autologin if possible)

	this.check = function(){
//		if($window.location.hostname=="localhost"){
//			appdata.server = appdata.localserver;
//		}
		if(
			appdata.user == undefined &&
			appdata.token == undefined &&
			appdata.lip == undefined
		){
			var drcookie = $cookies.get(appdata.cookiename);
			if(drcookie!=undefined){
				_scope.errormsg = "";
				var dr = JSON.parse(drcookie);
				appdata.token = dr.token;
				appdata.user = dr.user;
				appdata.lip = dr.lip;
				$http.defaults.headers.common['Authorization'] = "Bearer " + appdata.token;
				this.getAllTodos();
			} else {
				$location.path("/login");
			}
		} else {
			$http.defaults.headers.common['Authorization'] = "Bearer " + appdata.token;
			this.getAllTodos();
		}
	}

}]);

/*

	backend.js

*/
tdapp.service('backend',["$http", "$timeout", "$location", "appdata", "todoservice", function($http,$timeout,$location,appdata,todoservice){
	var _scope;
	this.setScope = function(scope){
		_scope = scope;
	}
	this.postTodo = function(obj){
		$http({
			method:"post",
			url: appdata.server,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(res){
				obj.id=res.data.id;
			}
			,
			function errorCallback(res){
				console.log("Error: " + JSON.stringify(res));
			}
		);
	}
	this.putTodo = function(obj){
		$http({
			method:"put",
			url: appdata.server+"/"+obj.id,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(res){
			}
			,
			function errorCallback(res){
				console.log("Error: " + JSON.stringify(res));
			}
		);
	}
	this.delTodo = function(obj){
		$http({
			method:"delete",
			url: appdata.server+"/"+obj.id,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(res) {
			}
			,
			function errorCallback(res){
				console.log("Error: " + JSON.stringify(res));
			}
		);
	}
	this.doneTodo = function(obj){
		$http({
			method:"get",
			url: appdata.server+"/"+obj.id+"/done",
		}).then(
			function successCallback(res){
			}
			,
			function errorCallback(res){
				console.log("Error: " + JSON.stringify(res));
			}
		);
	}
	this.undoneTodo = function(obj){
		$http({
			method:"get",
			url: appdata.server+"/"+obj.id+"/undone",
		}).then(
			function successCallback(res){
			}
			,
			function errorCallback(res){
				console.log("Error: " + JSON.stringify(res));
			}
		);
	}
	this.getTodos = function(_callback){
		$http({
			method:"get",
			url: appdata.server
		}).then(
			function successCallback(res) {
				todoservice.clearTodos();
				res.data.forEach(function(o){
					todoservice.addTodoObj(o);
				});
				_callback();
				/*
				$timeout(function(){
					_scope.tags = todoservice.getTags();
					_scope.todos = todoservice.getTodosByTag(_scope.filtertag);
					$window.location = "/#/main";
				},1000);
				$timeout(function(){
					if(typeof window.orientation == 'undefined'){ // Workaround
						$("#todotxta").blur().focus();
					}
				},1128);
				*/
			}
			,
			function(response) {
				console.log("Error: " + JSON.stringify(response));
				_scope.errormsg="Server not available!";
			}
		);
	}

	// Firebase realtime database

	this.incTodosTotal = function(){
		firebase.database().ref('/data/misc/todos/total').transaction(
			function(data){
				data += 1;
				return data;
			}
		)
		.catch(function(error){
			console.log("Error: " + error.message);
		})
	}
	this.incTodosDeleted = function(){
		firebase.database().ref('/data/misc/todos/deleted').transaction(
			function(data){
				data += 1;
				return data;
			}
		)
		.catch(function(error){
			console.log("Error: " + error.message);
		})
	}
	this.incTodosDone = function(){
		firebase.database().ref('/data/misc/todos/done').transaction(
			function(data){
				data += 1;
				return data;
			}
		)
		.catch(function(error){
			console.log("Error: " + error.message);
		})
	}
	this.incTodosUndone = function(){
		firebase.database().ref('/data/misc/todos/undone').transaction(
			function(data){
				data += 1;
				return data;
			}
		)
		.catch(function(error){
			console.log("Error: " + error.message);
		})
	}


}]);

tdapp.service('logininterceptor', ["$q", "$location", "$scope", function($q, $location, $scope) {
  return {
   'responseError': function(rejection) {
      if (rejection.status == 401) {
        $scope.open_dialog();
      }
      return $q.reject(rejection);
    }
  };
}]);

/*

	routeengine.js

*/
tdapp.service('routeengine',["$location", "$route", function($location, $route){
  var path = $location.path();

  return {
    // optional method
    'request': function(config) {
      // do something on success
      return config;
    },

    // optional method
   'requestError': function(rejection) {
      // do something on error
      if (canRecover(rejection)) {
        return responseOrNewPromise
      }
      return $q.reject(rejection);
    }

  };
}]);  

/*

	tdapp_factories.js

*/

tdapp.service("todoservice",function(){ // ToDoManager
	var fact = {};
	fact.todos = [];
	fact.tags = [];
	fact.checkForHashtag = function(obj){
		if(obj.topic==undefined){
			return;
		}
		obj.tags = [];
		var s = obj.topic.indexOf('#');
		var e = 0;
		while(s>=0){
			e = obj.topic.indexOf(' ',s+1);
			if(e==-1) e=obj.topic.length;
			var tag = obj.topic.substring(s,e);
			if(tag=='#') tag = undefined;
			if(tag!=undefined){
				obj.tags.push(tag);
			}
			if(tag!=undefined && fact.tags.indexOf(tag)<0){
				fact.tags.push(tag);
			}
			s = obj.topic.indexOf('#', s+1);
		}
	}
	fact.getTags = function(){
		return fact.tags;
	}
	fact.getTodos = function(){
		return fact.todos;
	}
	fact.getTodosByTag = function(tag,done){
		if(tag=='' || tag=='All'){
			var ret = [];
			if(done){
				fact.todos.forEach(function(obj){
					if(obj.done){
						ret.push(obj);
					}
				});
			} else {
				fact.todos.forEach(function(obj){
					if(!obj.done){
						ret.push(obj);
					}
				});
			}
			return ret;
		}
		var tagged = [];
		fact.todos.forEach(function(obj){
			if(obj.tags.indexOf(tag)>=0){
				if(done){
					if(obj.done) tagged.push(obj);
				} else {
					if(!obj.done) tagged.push(obj);
				}
			}
		});
		return tagged;
	}
	fact.setTodos = function(todolist){
		if(todolist==undefined) return;
		fact.todos = todolist;
		if(todolist.length>0){
			fact.todos.forEach(function(obj){
				fact.checkForHashtag(obj);
			});
		}
	}
	fact.clearTodos = function(){
		while(fact.todos.length>0){
			fact.todos.pop();
		}
		while(fact.tags.length>0){
			fact.tags.pop();
		}
	}
	fact.getTodoById = function(id){
		var ret = undefined;
		fact.todos.forEach(function(obj){
			if(obj.id==id){
				ret = obj;
			}
		});
		return ret;
	}
	fact.addTodoObj = function(obj){
		obj.predone = obj.done;
		fact.checkForHashtag(obj);
		fact.todos.unshift(obj);
		return obj;
	}
	fact.addTodo = function(topic){
		var obj = {"topic":topic,done:false};
		fact.addTodoObj(obj);
		return obj;
	}
	fact.delTodo = function(item){
		var idx = fact.todos.indexOf(item)
		if(idx>=0){
			var tag = item.tag;
			fact.todos.splice(idx,1);
			if( tag!=undefined ){
				var ttd = fact.getTodosByTag(tag);
				if( ttd.length==0 ){
					fact.tags.splice(fact.tags.indexOf(tag),1);
				}
			}
		}
	}
	fact.togPreDone = function(item){
		var idx = fact.todos.indexOf(item);
		if( idx<0 ) return;
		var todo = fact.todos[idx];
		if(todo.predone){
			todo.predone = false;
		} else {
			todo.predone = true;
		}
	}
	fact.togDone = function(item){
		var idx = fact.todos.indexOf(item);
		if( idx<0 ) return;
		var todo = fact.todos[idx];
		if(todo.done){
			todo.done = false;
			todo.predone = todo.done;
		} else {
			todo.done = true;
			todo.predone = todo.done;
		}
	}
	return fact;
});

/*

	tdapp_firebase.js

*/
var config = {
	apiKey: "AIzaSyCQ3iNEv4gjySzM7EFdpWQ-LOH3KRwh8fc",
	authDomain: "drtodolittle.firebaseapp.com",
	databaseURL: "https://drtodolittle.firebaseio.com",
	storageBucket: ""
};

firebase.initializeApp(config);
}());
