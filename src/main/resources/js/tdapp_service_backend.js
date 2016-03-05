/*

	tdapp_service_backend.js

*/
tdapp.service('Backend',function($http,$timeout,$window,$location,appdata,CLogger,TDMgr){
	var _scope;
	this.setScope = function(scope){
		_scope = scope;
	}
	this.postTodo = function(obj){
		CLogger.log("Sending request (post) to server...");
		$http({
			method:"post",
			url: appdata.server,
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
			url: appdata.server+"/"+obj.id,
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
			url: appdata.server+"/"+obj.id,
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
			url: appdata.server+"/"+obj.id+"/done",
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
		$http({
			method:"get",
			url: appdata.server
		}).then(
			function successCallback(res) {
				CLogger.log("Done.");
				CLogger.log("Updating local Todo-List.");
				TDMgr.clearTodos();
				res.data.forEach(function(o){
					TDMgr.addTodoObj(o);
				});
				CLogger.log("Done.");
				$timeout(function(){
					$window.location = "/#/main";
				},1000);
				$timeout(function(){
					if(typeof window.orientation == 'undefined'){ // Workaround
						CLogger.log("Desktop browser detected.");
						CLogger.log("Focus New-Todo-Inputfield.");
						$("#todotxta").blur().focus();
					}
				},1128);
			}
			,
			function(res) {
				CLogger.log("Error! Check console for details.");
				console.log("Error!");
				console.log(JSON.stringify(res));
				_scope.errormsg="Server not available!";
				_scope.dologout();
			}
		);
	}	
});
