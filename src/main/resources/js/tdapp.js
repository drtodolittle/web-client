/*

	tdapp.js

*/
var tdapp = angular.module("tdapp",['satellizer']);

tdapp.config(function($authProvider) {
	$authProvider.baseUrl='/api/todos/';
	$authProvider.loginUrl='login';
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

/*
  Server ----------------------------------------
*/
var localserver = "http://localhost:3000/api/todos"; // JSON-Server ressource on localhost 
var server = window.location.protocol + "/api/todos";

/*
  Factories ----------------------------------------
*/
tdapp.factory("CLogger",function(){ // ClientLogger
	service = {};
	service._log = [];
	service.log = function(logtxt){
		service._log.push(logtxt);
		if(service._log.length>32){
			service._log.shift();
		}
	}
	service.getLog = function(){
		return service._log;
	}
	for(i=0;i<32;i++){
		service.log("");
	}
	return service;	
});

tdapp.factory("TDMgr",function(){ // ToDoManager
	var service = {};
	service.todos = [];
	service.getTodos = function(){
		return service.todos;
	}
	service.setTodos = function(todolist){
		service.todos = todolist;
	}
	service.clearTodos = function(){
		while(service.todos.length>0){
			service.todos.pop();
		}
	}
	service.getTodoById = function(id){
		var ret = undefined;
		service.todos.forEach(function(obj){
			if(obj.id==id){
				ret = obj;
			}
		});
		return ret;
	}
	service.addTodoObj = function(obj){
		service.todos.unshift(obj);
	}
	service.delTodo = function(item){
		var idx = service.todos.indexOf(item)
		service.todos.splice(idx,1);
	}
	service.togDone = function(item){
		var idx = service.todos.indexOf(item);
		var todo = service.todos[idx];
		if(todo.done){
			todo.done = false;
		} else {
			todo.done = true;
		}
	}
	return service;
});

/*
  Main controller ----------------------------------------
*/
tdapp.controller("MainCtrl",function($scope,$timeout,$interval,$http,$auth,TDMgr,CLogger){

	// Init

	$scope.todos = TDMgr.getTodos();
	$scope.log = CLogger.getLog();

	$scope.s_login = 1;
	$scope.s_working = 0;
	$scope.s_list = 0;

	// Communication with server

	function errorCallback(response) {
		CLogger.log("Error!");
		CLogger.log("Check browser console for details.");
		console.log(JSON.stringify(response));
	}

	function gettodos(){
		CLogger.log("Sending request (get) to server...");
		$scope.s_working = 1;
		$scope.s_list = 0;
		$http({
			method:"get",
			url: server
		}).then(
			function successCallback(response) {
				CLogger.log("Done.");
				CLogger.log("Updating local Todo-List.");
				response.data.forEach(function(o){
					TDMgr.addTodoObj(o);
				});
				CLogger.log("Done.");
				$timeout(function(){
					$scope.s_list = 1;
					$scope.s_working = 0;
				},1000);
				$timeout(function(){
					if(typeof window.orientation == 'undefined'){ // Workaround
						CLogger.log("Desktop browser detected.");
						CLogger.log("Focus New-Todo-Inputfield.");
						$("#todotxta").focus();
					}
				},1128);
			}
			,
			function(response) {
				CLogger.log("Error!");
				CLogger.log("Check browser console for details.");
				console.log(JSON.stringify(response));
				$scope.errormsg="Server not available!";
				$scope.dologout();
			}
		);
	}
	$scope.gettodos = gettodos;

	function posttodo(obj){
		CLogger.log("Sending request (post) to server...");
		$http({
			method:"post",
			url: server,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(response) {
				CLogger.log("Done.");
				obj.id=response.data.id;
			}
			,
			errorCallback
		);
	}

	function puttodo(obj){
		CLogger.log("Sending request (put) to server...");
		$http({
			method:"put",
			url: server+"/"+obj.id,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(response) {
				CLogger.log("Done.");
			}
			,
			errorCallback
		);
	}

	function deletetodo(obj){
		CLogger.log("Sending request (delete) to server...");
		$http({
			method:"delete",
			url: server+"/"+obj.id,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(response) {
				CLogger.log("Done.");
			}
			,
			errorCallback
		);
	}

	function donetodo(obj){
		CLogger.log("Sending request (get; todo is done) to server...");
		$http({
			method:"get",
			url: server+"/"+obj.id+"/done",
		}).then(
			function successCallback(response) {
				CLogger.log("Done.");
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
		var k = e.keyCode;
		if(k==27){//esc
			e.preventDefault();
			CLogger.log("Commit logout.");
			$scope.dologout();
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
			CLogger.log("Change Todo (id:"+id+").");
			var currentTodo = $('#todoid'+id);
			currentTodo.blur();
			CLogger.log("Todo unfocused.");
			var obj = TDMgr.getTodoById(id);
			if(obj!=undefined){
				CLogger.log("Done.");
				CLogger.log("Updating data on server.");
				obj.topic = currentTodo.html();
				puttodo(obj);
				CLogger.log("Todo (id:"+id+") updated.");
			} else {
				CLogger.log("Error.");
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
		$("#todoid"+id).focus();
		CLogger.log("Todo focused.");
	}

	$scope.deltodonow = function(obj){
		obj.deleted = true;
		deletetodo(obj);
		TDMgr.delTodo(obj);
		CLogger.log("ToDo deleted.");	
	}
	
	$scope.deltodo = function(obj){
		//Just some animated testings (wip)
		obj.opac = 1;
		obj.del = false;
		$interval(function(){
			var x = $("#todox"+obj.id);
			obj.opac = obj.opac - 0.05;
			x.css("opacity",obj.opac);
			if(obj.opac<=0 && !obj.deleted){
				obj.deleted = true;
				deletetodo(obj);
				TDMgr.delTodo(obj);
				CLogger.log("ToDo deleted.");
				$timeout(function(){
					$("#todotxta").focus();
				},128);
			}
		},32,32);
		if(TDMgr.getTodos().length==0){
			CLogger.log("Todo-List is empty.");
		}
	}

	$scope.togDone = function(obj){
		TDMgr.togDone(obj);
		donetodo(obj);
		CLogger.log("Todo-Flag changed.");
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
	
	// Login & Logout functions

	function logout(){
		$scope.s_login = 0;
		$scope.s_list = 0;
		$scope.s_working = 1;
		TDMgr.clearTodos();
		$timeout(function(){
			$scope.s_working = 0;
			$scope.s_login = 1;
		},1000);
		$timeout(function(){
			$("#liusername").focus();
		},1128);
		CLogger.log("Logged out.");
	}
	$scope.dologout = logout;

	function login(){
		CLogger.log("Commit login.");
		$auth.login($scope.user)
			.then(function(){
				CLogger.log("Logged in.");
				$scope.errormsg = "";
				$scope.s_login = 0;
				gettodos();
			})
			.catch(function(error){
				$scope.errormsg = "Login-Error.";
				$scope.dologout();
			});
	}
	function locallogin(){ // No basic authentication (for communication with localhost)
		CLogger.log("Commit login.");
		server = localserver;
		$scope.errormsg = "";
		$scope.s_login = 0;
		CLogger.log("Logged in.");
		gettodos();
	}
	$scope.dologin = login; // Change to "locallogin" for working against localhost

	// Finish

	$(".flash").css("visibility","visible");
	$(".working").css("visibility","visible");	
	$(".fkts").css("visibility","visible");
	$(".todota").css("visibility","visible");
	$(".todotab").css("visibility","visible");
	$("#liusername").focus()
	
	CLogger.log("System ready.");
});
