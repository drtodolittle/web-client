/*

	tdapp.js

*/
var tdapp = angular.module("tdapp",['satellizer']);

tdapp.config(function($authProvider) {
	$authProvider.baseUrl='/api/todos/';
	$authProvider.loginUrl='login';

	// Satellizer
	$authProvider.twitter({
		url: 'http://127.0.0.1:5000/auth/twitter', // Satellizer server component on localhost
		authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
		redirectUri: window.location.origin,
		type: '1.0',
		popupOptions: { width: 495, height: 645 }
	});
	$authProvider.httpInterceptor = false,
	$authProvider.withCredentials = false;
})

/*
  Server ----------------------------------------
*/
var localserver = "http://localhost:3000/api/todos"; // JSON-Server ressource on localhost 
var server = window.location.protocol + "/api/todos";

/*
  Factory ----------------------------------------
*/
tdapp.factory("TDMgr",function(){

	// Logging

	var log = [];

	function _log(logtxt){
		log.push(logtxt);
		if(log.length>32){
			log.shift();
		}
	}

	function _getLog(){
		return log;
	}

	for(i=0;i<32;i++){
		_log("");
	}

	// Todos

	var todos = [];

	function _getTodos(){
		return todos;
	}

	function _setTodos(todolist){
		todos = todolist;
	}

	function _clearTodos(){
		while(todos.length>0){
			todos.pop();
		}
	}

	function _getTodoById(id){
		var ret = undefined;
		todos.forEach(function(obj){
			if(obj.id==id){
				ret = obj;
			}
		});
		return ret;
	}

	function _addTodoObj(obj){
		todos.unshift(obj);
	}

	function _delTodo(item){
		var idx = todos.indexOf(item)
		todos.splice(idx,1);
	}

	function _togDone(item){
		var idx = todos.indexOf(item);
		var todo = todos[idx];
		if(todo.done){
			todo.done = false;
		} else {
			todo.done = true;
		}
	}

	// Returns

	return{
		log : _log,
		getLog : _getLog,
		getTodos : _getTodos,
		setTodos : _setTodos,
		clearTodos : _clearTodos,
		getTodoById : _getTodoById,
		addTodoObj : _addTodoObj,
		delTodo : _delTodo,
		togDone : _togDone,
	};

});

/*
  Main controller ----------------------------------------
*/
tdapp.controller("MainCtrl",function($scope,$timeout,$interval,$http,$auth,TDMgr){

	// Init

	$scope.todos = TDMgr.getTodos();
	$scope.log = TDMgr.getLog();

	$scope.s_login = 1;
	$scope.s_working = 0;
	$scope.s_list = 0;
	$scope.s_add = 0;

	// Communication with server

	function errorCallback(response) {
		TDMgr.log("Error!");
		TDMgr.log("Check browser console for details.");
		console.log(JSON.stringify(response));
	}

	function gettodos(){
		TDMgr.log("Sending request (get) to server...");
		$scope.s_working = 1;
		$scope.s_list = 0;
		$http({
			method:"get",
			url: server
		}).then(
			function successCallback(response) {
				TDMgr.log("Done.");
				TDMgr.log("Updating local Todo-List.");
				response.data.forEach(function(o){
					TDMgr.addTodoObj(o);
				});
				TDMgr.log("Done.");
				$timeout(function(){
					$scope.s_list = 1;
					$scope.s_working = 0;
				},1000);
				$timeout(function(){
					document.getElementById("todotxtaconst").focus();
				},1128);
			}
			,
			function(response) {
				TDMgr.log("Error!");
				TDMgr.log("Check browser console for details.");
				console.log(JSON.stringify(response));
				$scope.errormsg="Server not available!";
				$scope.dologout();
			}
		);
	}
	$scope.gettodos = gettodos;

	function posttodo(obj){
		TDMgr.log("Sending request (post) to server...");
		$http({
			method:"post",
			url: server,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(response) {
				TDMgr.log("Done.");
				obj.id=response.data.id;
			}
			,
			errorCallback
		);
	}

	function puttodo(obj){
		TDMgr.log("Sending request (put) to server...");
		$http({
			method:"put",
			url: server+"/"+obj.id,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(response) {
				TDMgr.log("Done.");
			}
			,
			errorCallback
		);
	}

	function deletetodo(obj){
		TDMgr.log("Sending request (delete) to server...");
		$http({
			method:"delete",
			url: server+"/"+obj.id,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(response) {
				TDMgr.log("Done.");
			}
			,
			errorCallback
		);
	}

	function donetodo(obj){
		TDMgr.log("Sending request (get; todo is done) to server...");
		$http({
			method:"get",
			url: server+"/"+obj.id+"/done",
		}).then(
			function successCallback(response) {
				TDMgr.log("Done.");
			}
			,
			errorCallback
		);
	}

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

	// Keyboard functions

	$scope.mainKeydown = function(e){
		if($scope.s_login==0){
			var k = e.keyCode;
			if(k==107){//+ on numpad
				e.preventDefault();
				$scope.s_add = 1;
				$timeout(function(){
					document.getElementById("todotxta").focus();
				},128);
				TDMgr.log("NewTodo-Dialog.");
			}
		}
	}

	$scope.newtodoKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			if($scope.newtodotxt!=""){
				var newtodo = {};
				newtodo.topic=$scope.newtodotxt;
				newtodo.done=false;
				$scope.newtodotxt = "";
				posttodo(newtodo);
				TDMgr.addTodoObj(newtodo);
				window.scrollTo(0,0);
				document.getElementById("todotxtaconst").focus();
				$scope.s_add = 0;
			}
		} else
		if(k==27){//esc
			e.preventDefault();
			$scope.newtodotxt = "";
			$scope.s_add = 0;
			$scope.s_list = 1;
			TDMgr.log("Todo not added.");
			document.getElementById("todotxtaconst").focus();
		} else
		if(k==9){//tab
			e.preventDefault();
		}
	}

	$scope.todolineKeydown = function(e,id){
		var k = e.keyCode;
		if(k==13 || k==27 || k==107){//ret,esc,+
			e.preventDefault();
			TDMgr.log("Change Todo (id:"+id+").");
			var currentTodo = document.getElementById("todoid"+id);
			currentTodo.blur();
			TDMgr.log("Todo unfocused.");

			var obj = TDMgr.getTodoById(id);
			if(obj!=undefined){
				TDMgr.log("Done.");
				TDMgr.log("Updating data on server.");
				obj.topic = currentTodo.innerHTML;
				puttodo(obj);
				TDMgr.log("Todo (id:"+id+") updated.");
			} else {
				TDMgr.log("Error.");
			}
		}
	}

	$scope.loginKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			$scope.dologin();
		}
	}

	// Todo functions

	$scope.seltodoline = function(id){
		document.getElementById("todoid"+id).focus();
		TDMgr.log("Todo focused.");
	}

	$scope.deltodo = function(obj){
		//Just some animated testings (wip)
		obj.opac = 1;
		obj.del = false;
		$interval(function(){
			var x = document.getElementById("todox"+obj.id);
			obj.opac = obj.opac - 0.05;
			x.style.opacity = obj.opac;
			if(obj.opac<=0 && !obj.deleted){
				obj.deleted = true;
				deletetodo(obj);
				//TDMgr.delTodo(obj);
				TDMgr.log("ToDo deleted.");
			}
		},32,32);
		if(TDMgr.getTodos().length==0){
			TDMgr.log("Todo-List is empty.");
		}
	}

	$scope.togDone = function(obj){
		TDMgr.togDone(obj);
		donetodo(obj);
		TDMgr.log("Todo-Flag changed.");
	}

	$scope.newtodo = function(){
		$scope.s_add = 1;
		$timeout(function(){
			document.getElementById("todotxta").focus();
		},128);
		TDMgr.log("New Todo-Dialog.");
	}

	$scope.newtodofromconst = function(){
		if($scope.newtodotxt!=undefined){
			if($scope.newtodotxt!=""){
				var newtodo = {};
				newtodo.topic=$scope.newtodotxt;
				newtodo.done=false;
				$scope.newtodotxt = "";
				posttodo(newtodo);
				TDMgr.addTodoObj(newtodo);
				window.scrollTo(0,0);
			}
		}
	}
	
	// Login functions

	function logout(){
		$scope.s_login = 0;
		$scope.s_list = 0;
		$scope.s_add = 0;
		$scope.s_working = 1;
		TDMgr.clearTodos();
		$timeout(function(){
			$scope.s_working = 0;
			$scope.s_login = 1;
		},1000);
		$timeout(function(){
			document.getElementById("liusername").focus();
		},1128);
		TDMgr.log("Logged out.");
	}
	$scope.dologout = logout;

	function login(){
		$auth.login($scope.user)
			.then(function(){
				TDMgr.log('You have successfully signed in!');
				TDMgr.log("Logged in.");
				$scope.errormsg = "";
				$scope.s_login = 0;
				gettodos();
			})
			.catch(function(error){
				$scope.errormsg = "Login-Error.";
				$scope.dologout();
				// TDMgr.log(error.data.message);
			});
	}
	function locallogin(){ // No basic authentication (for communication with localhost)

		server = localserver;
		$scope.errormsg = "";
		$scope.s_login = 0;
		gettodos();
	}
	$scope.dologin = login; // Change to "locallogin" for working against localhost

	// Finish

	TDMgr.log("Client Log-System ready.");

	document.getElementById("liusername").focus();

	if($scope.s_list==1){
		$scope.gettodos();
	}

});
