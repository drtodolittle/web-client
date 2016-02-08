/*

	tdapp.js

*/
var tdapp = angular.module("tdapp",['satellizer','ngCookies']);

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
  Misc ----------------------------------------
*/
var cookiename = "derdr";

/*
  Server ----------------------------------------
*/
var localserver = "http://localhost:3000/api/todos"; // JSON-Server ressource on localhost 
var server = window.location.protocol + "/api/todos";

/*
  Factories ----------------------------------------
*/
tdapp.factory("CLogger",function(){ // ClientLogger
	fact = {};
	fact._log = [];
	fact.log = function(logtxt){
		fact._log.push(logtxt);
		if(fact._log.length>32){
			fact._log.shift();
		}
	}
	fact.getLog = function(){
		return fact._log;
	}
	for(i=0;i<32;i++){
		fact.log("");
	}
	return fact;	
});

tdapp.factory("TDMgr",function(){ // ToDoManager
	var fact = {};
	fact.todos = [];
	fact.getTodos = function(){
		return fact.todos;
	}
	fact.setTodos = function(todolist){
		fact.todos = todolist;
	}
	fact.clearTodos = function(){
		while(fact.todos.length>0){
			fact.todos.pop();
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
		fact.todos.unshift(obj);
	}
	fact.addTodo = function(topic){
		fact.addTodoObj({"topic":topic,done:false});
	}
	fact.delTodo = function(item){
		var idx = fact.todos.indexOf(item)
		fact.todos.splice(idx,1);
	}
	fact.togDone = function(item){
		var idx = fact.todos.indexOf(item);
		var todo = fact.todos[idx];
		if(todo.done){
			todo.done = false;
		} else {
			todo.done = true;
		}
	}
	return fact;
});

/*
  Services ----------------------------------------
*/
tdapp.service('Backend',function($http,$timeout,CLogger,TDMgr){
	var _scope;
	this.setScope = function(scope){
		_scope = scope;
	}
	this.postTodo = function(obj){
		CLogger.log("Sending request (post) to server...");
		$http({
			method:"post",
			url: server,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(res) {
				CLogger.log("Done.");
				obj.id=res.data.id;
			}
			,
			function errorCallback(res){
				CLogger.log("Error! Check console for details.");
				console.log(JSON.stringify(res));			
			}
		);
	}
	this.putTodo = function(obj){
		CLogger.log("Sending request (put) to server...");
		$http({
			method:"put",
			url: server+"/"+obj.id,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(res){
				CLogger.log("Done.");
			}
			,
			function errorCallback(res){
				CLogger.log("Error! Check console for details.");
				console.log(JSON.stringify(res));			
			}
		);
	}
	this.delTodo = function(obj){
		CLogger.log("Sending request (delete) to server...");
		$http({
			method:"delete",
			url: server+"/"+obj.id,
			header: "application/json",
			data: obj
		}).then(
			function successCallback(res) {
				CLogger.log("Done.");
			}
			,
			function errorCallback(res){
				CLogger.log("Error! Check console for details.");
				console.log(JSON.stringify(res));			
			}
		);
	}	
	this.doneTodo = function(obj){
		CLogger.log("Sending request (get; todo is done) to server...");
		$http({
			method:"get",
			url: server+"/"+obj.id+"/done",
		}).then(
			function successCallback(res) {
				CLogger.log("Done.");
			}
			,
			function errorCallback(res){
				CLogger.log("Error! Check console for details.");
				console.log(JSON.stringify(res));			
			}
		);
	}
	this.getTodos = function(){
		CLogger.log("Sending request (get) to server...");
		_scope.s_working = 1;
		_scope.s_list = 0;
		$http({
			method:"get",
			url: server
		}).then(
			function successCallback(res) {
				CLogger.log("Done.");
				CLogger.log("Updating local Todo-List.");
				res.data.forEach(function(o){
					TDMgr.addTodoObj(o);
				});
				CLogger.log("Done.");
				$timeout(function(){
					_scope.s_list = 1;
					_scope.s_working = 0;
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
			function(res) {
				CLogger.log("Error! Check console for details.");
				console.log(JSON.stringify(res));
				_scope.errormsg="Server not available!";
				_scope.dologout();
			}
		);
	}	
});

/*
  Main controller ----------------------------------------
*/
tdapp.controller("MainCtrl",function($scope,$timeout,$interval,$http,$auth,$cookies,TDMgr,CLogger,Backend){

	// Init

	$scope.todos = TDMgr.getTodos();
	$scope.log = CLogger.getLog();

	$scope.s_login = 1;
	$scope.s_working = 0;
	$scope.s_list = 0;

	// Communication with server

	Backend.setScope($scope);

	function doModifyHeader(token){
		$http.defaults.headers.common['Authorization'] = "Basic " + token;
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
				Backend.postTodo(newtodo);
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
				Backend.putTodo(obj);
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

	$scope.deltodonow = function(obj){ // No animation
		obj.deleted = true;
		Backend.delTodo(obj);
		TDMgr.delTodo(obj);
		CLogger.log("ToDo deleted.");	
	}
	
	$scope.deltodo = function(obj){ // Animated testings (wip)
		obj.opac = 1;
		obj.del = false;
		$interval(function(){
			var x = $("#todox"+obj.id);
			obj.opac = obj.opac - 0.05;
			x.css("opacity",obj.opac);
			if(obj.opac<=0 && !obj.deleted){
				obj.deleted = true;
				Backend.delTodo(obj);
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
		Backend.doneTodo(obj);
		CLogger.log("Todo-Flag changed.");
	}
	
	// Login & Logout functions

	function logout(){
		$cookies.remove(cookiename);
		TDMgr.clearTodos();
		$scope.s_login = 0;
		$scope.s_list = 0;
		$scope.s_working = 1;
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
			.then(function(response){
				var now = new Date();
				var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
				$cookies.put(cookiename,response.data.token,{expires:exp});
				CLogger.log("Logged in.");
				$scope.errormsg = "";
				$scope.s_login = 0;
				Backend.getTodos();
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
		Backend.getTodos();
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
	
	// Do login if cookie/token is available (WIP)
	var token = $cookies.get(cookiename);
	if (token!=undefined){
		doModifyHeader(token);
		CLogger.log("Automatic login.");
		$scope.errormsg = "";
		$scope.s_login = 0;
		Backend.getTodos();		
	}
	
});
