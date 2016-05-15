/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*

		tdapp_all.js
		
	*/
	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(8);


/***/ },
/* 1 */
/***/ function(module, exports) {

	/*

		tdapp.js

	*/
	var tdapp = angular.module('tdapp',['satellizer','ngCookies','ngRoute']);

	tdapp.config(function($authProvider,$routeProvider,$compileProvider) {
		$authProvider.baseUrl='/api/todos/';
		$authProvider.loginUrl='login';
		$routeProvider
	            .when('/', {
	                templateUrl : 'login.html',
					controller : 'AuthCtrl'
	            })
				.when('/login', {
	                templateUrl : 'login.html',
					controller : 'AuthCtrl'
	            })		
				.when('/working', {
	                templateUrl : 'working.html'
	            })		
				.when('/main', {
	                templateUrl : 'main.html',
					controller: 'MainCtrl'
	            })
				.when('/register', {
	                templateUrl : 'register.html',
					controller : 'RegCtrl'
	            })
				.when('/chpwd', {
	                templateUrl : 'chpwd.html',
					controller : 'SettingsCtrl'
	            })			
				.when('/error', {
	                templateUrl : 'error.html'
	            })
				.when('/egg', {
	                templateUrl : 'egg.html'
	            })
				.otherwise({
					redirectTo: '/error'
				});
		// Performance improvement
		$compileProvider.debugInfoEnabled(false);
		// Satellizer
		/*
		$authProvider.twitter({
			url: 'http://127.0.0.1:5000/auth/twitter', // Satellizer server component on localhost
			authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
			redirectUri: window.location.origin,
			type: '1.0',
			popupOptions: { width: 495, height: 645 }
		});
		$authProvider.httpInterceptor = false,
		$authProvider.withCredentials = false;
		*/
	})

	tdapp.value(
		"appdata",{
			"appname":"drtodolittle",
			"appnick":"derdr",
			"cookiename":"derdr",
			"localserver" : "http://localhost:3000/api/todos",
			"server" : window.location.origin + "/api/todos",
			"userservice" : window.location.origin + "/api/users"
		}
	);

	module.exports = tdapp

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*

		tdapp_factories.js

	*/
	var tdapp = __webpack_require__(1);

	tdapp.factory("TDMgr",function(){ // ToDoManager
		var fact = {};
		fact.todos = [];
		fact.tags = [];
		fact.checkForHashtag = function(obj){
			if(obj.topic==undefined){
				return;
			}
			if(obj.topic.indexOf('#')>=0){
				var s = obj.topic.indexOf('#');
				if(s==-1) e=obj.topic.length;			
				var e = obj.topic.indexOf(' ',s+1);
				if(e==-1) e=obj.topic.length;
				var tag = obj.topic.substring(s,e);
				if(tag=='#') tag = undefined;
				obj.tag = tag;
				if(tag!=undefined && fact.tags.indexOf(tag)<0){
					fact.tags.push(tag);
				}
			} else {
				obj.tag = undefined;
			}
		}
		fact.getTags = function(){
			return fact.tags;
		}
		fact.getTodos = function(){
			return fact.todos;
		}
		/* 16.04.2016 _ Old getTodosByTag (Backup)
		fact.getTodosByTag = function(tag){
			if(tag=='' || tag=='All'){
				return fact.todos;
			} else
			if(tag=='Open'){
				var tds = [];
				fact.todos.forEach(function(todo){
					if(!todo.done){
						tds.push(todo);
					};				
				});
				return tds;
			} else
			if(tag=='Done'){
				var dtd = [];
				fact.todos.forEach(function(todo){
					if(todo.done) dtd.push(todo);
				});
				return dtd;
			} else {
				var tagged = [];
				fact.todos.forEach(function(obj){
					if(obj.tag!=undefined && obj.tag==tag){
						tagged.push(obj);
					}
				});
				return tagged;
			}
		}
		*/
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
				if(obj.tag!=undefined && obj.tag==tag){
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*

		tdapp_service_autologin.js

	*/
	var tdapp = __webpack_require__(1);

	tdapp.service('Autologin',function($http,$window,$location,$cookies,appdata,TDMgr,Backend){
		var _scope;
		this.setScope = function(scope){
			_scope = scope;
		}
		this.check = function(){
			var token = $cookies.get(appdata.cookiename);
			if (token!=undefined){
				$location = "/#/working";
				_scope.errormsg = "";
				$http.defaults.headers.common['Authorization'] = "Basic " + token;
				if($window.location.hostname=="localhost"){
					appdata.server = appdata.localserver;
				}			
				_scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
				Backend.getTodos();
				$location = "/#/main";
			} else {
				if($location.$$url=="/main") $window.location = "/#/login";
			}	
		}
	});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*

		tdapp_service_backend.js

	*/
	var tdapp = __webpack_require__(1);

	tdapp.service('Backend',function($http,$timeout,$window,$location,appdata,TDMgr){
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
					console.log("Error:"+JSON.stringify(res));			
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
					console.log("Error:"+JSON.stringify(res));			
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
					console.log("Error:"+JSON.stringify(res));			
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
					console.log("Error:"+JSON.stringify(res));			
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
					console.log("Error:"+JSON.stringify(res));			
				}
			);
		}
		this.getTodos = function(){
			$http({
				method:"get",
				url: appdata.server
			}).then(
				function successCallback(res) {
					TDMgr.clearTodos();
					res.data.forEach(function(o){
						TDMgr.addTodoObj(o);
					});
					$timeout(function(){
						_scope.tags = TDMgr.getTags();
						_scope.todos = TDMgr.getTodosByTag(_scope.filtertag);
						$window.location = "/#/main";
					},1000);
					$timeout(function(){
						if(typeof window.orientation == 'undefined'){ // Workaround
							$("#todotxta").blur().focus();
						}
					},1128);
				}
				,
				function(res) {
					console.log("Error:"+JSON.stringify(res));
					_scope.errormsg="Server not available!";
					_scope.dologout();
				}
			);
		}	
	});


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*

		tdapp_controller_reg.js

	*/
	var tdapp = __webpack_require__(1);

	tdapp.controller("RegCtrl",function($scope,$http,$window,appdata){

		// Register

		$scope.doRegister = function(){
			$http({
				method:"post",
				url: appdata.userservice,
				header: "application/json",
				data: $scope.user
			}).then(
				function successCallback(res) {
					alert("Registration email sent. Please activate your account.");
					$window.location = "/";
				}
				,
				function errorCallback(res){
					console.log(JSON.stringify(res));			
				}
			);
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
		
		$(".impressum").css("visibility","visible");
		$(".flash").css("visibility","visible");	
		$("#liusername").focus()		

	});


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*

		tdapp_controller_settings.js

	*/
	var tdapp = __webpack_require__(1);

	tdapp.controller("SettingsCtrl",function($scope,$http,$window,$cookies,appdata){

		// Change passwrod

		$scope.doChPwd = function(){
			$http({
				method:"put",
				url: appdata.userservice,
				header: "application/json",
				data: $scope.user
			}).then(
				function successCallback(res) {
					$cookies.remove(appdata.cookiename);
					alert("Change password initiated. Please login again.");
					$window.location = "/";
				}
				,
				function errorCallback(res){
					$scope.errormsg = 'Error!';
					console.log(JSON.stringify(res));			
				}
			);
		}

		// Finish
		
		$(".flash").css("visibility","visible");	
		$("#liusername").focus()		

	});


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*

		tdapp_controller_auth.js

	*/
	var tdapp = __webpack_require__(1);

	tdapp.controller("AuthCtrl",function($scope,$http,$auth,$cookies,$window,appdata,TDMgr,Backend,Autologin){

		// Injection

		Autologin.setScope($scope);
		Backend.setScope($scope);
		
		// Satellizer

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

		// Login

		function locallogin(){ // No basic authentication (just communicate with localhost)
			$window.location = "/#/working";
			appdata.server = appdata.localserver;
			var now = new Date();
			var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
			$cookies.put(appdata.cookiename,'bla',{expires:exp});
			$scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
			Backend.getTodos();
			$(".fkts").css("visibility","visible");
			$scope.errormsg = "";
		}
		
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
					Backend.getTodos();
					$(".fkts").css("visibility","visible");
					$scope.errormsg = "";
				})
				.catch(function(error){
					$scope.errormsg = "Login-Error.";
					console.log(error);
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
		
		$(".flash").css("visibility","visible");	
		$("#liusername").focus()

		Autologin.check(); // do automatic login if cookie/token is available
	});


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*

		tdapp_controller_main.js

	*/
	var tdapp = __webpack_require__(1);

	tdapp.controller("MainCtrl",function($scope,$timeout,$interval,$http,$cookies,$window,appdata,TDMgr,Backend,Autologin){

		// Injections

		Autologin.setScope($scope);
		Backend.setScope($scope);
		
		// General Done Filter
		
		$scope.showdone = false;
		$scope.showdonetext = "Show Done";	
		
		// Logout

		$scope.dologout = function(){
			$(".fkts").css("visibility","hidden");
			$(".todota").css("visibility","hidden");
			$(".todotab").css("visibility","hidden");
			$cookies.remove(appdata.cookiename);
			TDMgr.clearTodos();
			$window.location = "/#/working";
			$timeout(function(){
				$window.location = "/#/login";
			},1000);
			$timeout(function(){
				$("#liusername").focus();
			},1128);
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
					Backend.postTodo(newtodo);
					TDMgr.addTodoObj(newtodo);
					if($scope.showdone){
						$scope.showdone = false;
						$scope.showdonetext = "Show Done";
					}
					if(newtodo.tag!=undefined){
						$scope.filtertag = newtodo.tag;
					} else {
						$scope.filtertag = "All";
					}
					$scope.todos = TDMgr.getTodosByTag($scope.filtertag,$scope.showdone);
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
				currentTodo.blur();
				var obj = TDMgr.getTodoById(id);
				if(obj!=undefined){
					obj.topic = currentTodo.html();
					Backend.putTodo(obj);
					var oldtag = obj.tag;
					TDMgr.checkForHashtag(obj);
					if(oldtag!=undefined){
						var ttd = TDMgr.getTodosByTag(oldtag);
						if(ttd.length<=0){
							TDMgr.tags.splice(TDMgr.tags.indexOf(oldtag),1);
						}
					}
					$scope.todos = TDMgr.getTodosByTag($scope.filtertag,$scope.showdone);
				}
			}
		}

		// Todo functions

		$scope.seltodoline = function(id){
			$("#todoid"+id).focus();
		}

		$scope.deltodo = function(obj){ // No animation
			obj.deleted = true;
			Backend.delTodo(obj);
			TDMgr.delTodo(obj);
			$scope.todos = TDMgr.getTodosByTag($scope.filtertag,$scope.showdone);
		}
		
		$scope.togDone = function(obj){
			TDMgr.togPreDone(obj);
			$timeout(function(){
				TDMgr.togDone(obj); // Toggle todo local (within TDMgr)
				if(obj.done){ // Toggle Todo on the server
					Backend.doneTodo(obj);			
				} else {
					Backend.undoneTodo(obj);
				}
				$scope.todos = TDMgr.getTodosByTag($scope.filtertag,$scope.showdone);
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
			$scope.todos=TDMgr.getTodosByTag($scope.filtertag,$scope.showdone);
		}
		
		// Tags
		
		$scope.getTodosByTag = TDMgr.getTodosByTag;

		// Finish
		
		$(".impressum").css("visibility","visible");
		$(".flash").css("visibility","visible");	

		Autologin.check(); // do automatic login if cookie/token is available
	});


/***/ }
/******/ ]);