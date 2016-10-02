;(function() {
"use strict";

/*

	tdapp.js

*/
var tdapp = angular.module('tdapp',['ngCookies','ngRoute', 'firebase','LocalStorageModule','xeditable']);

tdapp.config(["$routeProvider", "$locationProvider", "$compileProvider", "$httpProvider", function($routeProvider,$locationProvider,$compileProvider,$httpProvider) {
	// Routing
	$routeProvider
      .when('/', {
        templateUrl : 'main.html',
				controller : 'MainCtrl'
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

	tdapp_controller_main.js

*/
tdapp.controller("MainCtrl",
["$scope", "$timeout", "$location", "todoservice", function(
	$scope,
	$timeout,
	$location,
	todoservice)
{

	// General Done Filter
	$scope.showdone = false;
	$scope.showdonetext = "Show Done";

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
				todoservice.create(newtodo);
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
				todoservice.update(obj);
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

	$scope.displaytodos = function(tag) {
		$scope.filtertag = tag;
		$scope.todos = todoservice.getTodosByTag(tag,$scope.showdone);
	}

	// Todo functions
	$scope.seltodoline = function(id){
		$("#todoid"+id).focus();
	}

	$scope.deltodo = function(obj){ // No animation
		obj.deleted = true;
		todoservice.delTodo(obj);
		$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
	}

	$scope.togDone = function(obj){
		todoservice.togPreDone(obj);
		$timeout(function(){
			todoservice.togDone(obj); // Toggle todo local (within todoservice)
			$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
		},1000);
	}

	$scope.saveedittodo = function(todo){
		$scope.showedit = false;
		todoservice.update(todo);
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
	todoservice.getTodos().then(function(todos) {
		$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
		$scope.tags = todoservice.getTags();
	});

	// Finish
	$("#todotxta").focus();

}]);

/*

	tdapp_controller_settings.js

*/
tdapp.controller("navigation",["$scope", "$http", "localStorageService", "$route", function($scope,$http,localStorageService, $route){

	$scope.logout = function() {
		localStorageService.remove("logintoken");
		$http.defaults.headers.common['Authorization'] = "";
		$scope.password = "";
		$route.reload();
	}
}]);

/*

	tdapp_controller_reg.js

*/
tdapp.controller("RegCtrl",["$scope", "$http", "$location", "appdata", "backend", function($scope,$http,$location,appdata,backend){

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

	tdapp_controller_settings.js

*/
tdapp.controller("SettingsCtrl",["$scope", "$http", "$location", "$cookies", "$timeout", "appdata", function($scope,$http,$location,$cookies,$timeout,appdata){

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
    controller: ["$scope", "$firebaseAuth", "$http", "$location", "$route", "localStorageService", function($scope, $firebaseAuth, $http, $location, $route, localStorageService) {

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
    		auth.createUserWithEmailAndPassword(email,password)
          .then( function(data) {
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
    						$location.path("/");
    					})
    					.catch(function(err){
    						$scope.errormsg = "Registration-Error: " + err.message;
    						$scope.$apply();
    					})
    				})
    				.catch(function(err){
    					$scope.errormsg = "Registration-Error: " + err.message;
    					$scope.$apply();
    				})
    			}
    		).catch(function(err){
    			$scope.errormsg = "Registration-Error: " + err.message;
    			$scope.$apply();
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
    }]
  }
});

/*

	backend.js

*/
tdapp.service('backend',["$http", "appdata", "localStorageService", function($http,appdata,localStorageService){

	var token = localStorageService.get("logintoken");
	if (token != undefined) {
		$http.defaults.headers.common['Authorization'] = "Bearer " + token;
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
	this.getTodos = function(){
		return $http({
			method:"get",
			url: appdata.server
		});
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

tdapp.service('logininterceptor', ["$q", "$rootScope", "localStorageService", function($q, $rootScope, localStorageService) {
  return {
   'responseError': function(rejection) {
      if (rejection.status == 401) {
        if (localStorageService.get("logintoken") != undefined) {
          localStorageService.remove("logintoken");
        }
        $rootScope.open_dialog();
      }
      return $q.reject(rejection);
    }
  };
}]);

/*

	tdapp_factories.js

*/

tdapp.service("todoservice",["backend", "$q", function(backend, $q){ // ToDoManager
	var fact = {};
	fact.todos = [];
	fact.tags = [];

	fact.create = function(newtodo) {
		backend.postTodo(newtodo);
		backend.incTodosTotal();
	  fact.addTodoObj(newtodo);
	}

	fact.update = function(todo) {
		backend.putTodo(todo);
	}

	fact.checkForHashtag = function(todo){
		if(todo.topic==undefined){
			return;
		}
		todo.tags = [];
		var s = todo.topic.indexOf('#');
		var e = 0;
		while(s>=0){
			e = todo.topic.indexOf(' ',s+1);
			if(e==-1) e=todo.topic.length;
			var tag = todo.topic.substring(s,e);
			if(tag=='#') tag = undefined;
			if(tag!=undefined){
				todo.tags.push(tag);
			}
			if(tag!=undefined && fact.tags.indexOf(tag)<0){
				fact.tags.push(tag);
			}
			s = todo.topic.indexOf('#', s+1);
		}
	}
	fact.getTags = function(){
		return fact.tags;
	}
	fact.getTodos = function(){
		return $q(function(resolve, reject) {
			backend.getTodos().then(function(response) {
				fact.clearTodos();
				response.data.forEach(function(todo){
					fact.addTodoObj(todo);
				});
				resolve(fact.todos);
			});
		});
	}
	fact.getTodosByTag = function(tag,done){
		if(tag=='' || tag=='All' || tag == undefined){
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
		backend.delTodo(item);
		backend.incTodosDeleted();

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
		if(item.done){ // Toggle Todo on the server
			backend.doneTodo(item);
			backend.incTodosDone();
		} else {
			backend.undoneTodo(item);
			backend.incTodosUndone();
		}
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
}]);

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
