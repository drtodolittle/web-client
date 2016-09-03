/*

	tdapp_service_autologin.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

tdapp.service('Autologin',
function(
	$http,
	$window,
	$location,
	$cookies,
	$timeout,
	$compile,
	$routeParams,
	appdata,TDMgr,Backend
){

	// Injection

	var _scope;
	this.setScope = function(scope){
		_scope = scope;
	}

	//  Get todos

	this.getAllTodos = function(){
		_scope.filtertag = 'All'; // Set filtertag before calling Backend.getTodos()
		Backend.getTodos(
			function(){
				_scope.tags = (TDMgr.getTags()).sort();
				_scope.todos = TDMgr.getTodosByTag(_scope.filtertag,_scope.showdone);
				if(
					$routeParams.type!=undefined &&
					$routeParams.id!=undefined &&
					$routeParams.type=="todo"
				){
					var todo = TDMgr.getTodoById($routeParams.id)
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
					_scope.todos = TDMgr.getTodosByTag("#"+$routeParams.id,false);
				}
				if(typeof window.orientation == 'undefined'){ // Workaround for mobile devices
					$("#todotxta").blur().focus();
				}
				$window.location = "/#/main";
			}
		);
		/*
		if(TDMgr.getTodos().length==0){
			Backend.getTodos();
		} else {
			_scope.tags = TDMgr.getTags();
			_scope.todos = TDMgr.getTodosByTag(_scope.filtertag,_scope.showdone);
		}
		*/
	}

	// Logout (with undef appdata)

	this.doLogout = function(){
		$cookies.remove(appdata.cookiename);
		TDMgr.clearTodos();
		appdata.user = undefined;
		appdata.lip = undefined;
		appdata.token = undefined;
		appdata.rememberme = undefined;
		$window.location = "/#/login";
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
		if($window.location.hostname=="localhost"){
			appdata.server = appdata.localserver;
		}
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
				$http.defaults.headers.common['Authorization'] = "Basic " + appdata.token;
				this.getAllTodos();
			} else {
				$window.location = "/#/login";
			}
		} else {
			$http.defaults.headers.common['Authorization'] = "Basic " + appdata.token;
			this.getAllTodos();
		}
	}

});
