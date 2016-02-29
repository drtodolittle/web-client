/*

	tdapp_services.js

*/
tdapp.service('Backend',function($http,$timeout,appdata,CLogger,TDMgr){
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
