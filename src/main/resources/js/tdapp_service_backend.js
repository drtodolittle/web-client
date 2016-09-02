/*

	tdapp_service_backend.js

*/
var tdapp = require('./tdapp');
var firebase = require('./tdapp_firebase');

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
				TDMgr.clearTodos();
				res.data.forEach(function(o){
					TDMgr.addTodoObj(o);
				});
				_callback();
				/*
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
				*/
			}
			,
			function(res) {
				console.log("Error: " + JSON.stringify(res));
				_scope.errormsg="Server not available!";
			}
		);
	}

	// Firebase realtime database

	this.incTodosCount = function(){
		firebase.database().ref('/data/todoscount').transaction(
			function(data){
				data += 1;
				return data;
			}
		)
		.catch(function(error){
			console.log("Error: " + error.message);
		})
	}
	this.decTodosCount = function(){
		firebase.database().ref('/data/todoscount').transaction(
			function(data){
				data -= 1;
				return data;
			}
		)
		.catch(function(error){
			console.log("Error: " + error.message);
		})
	}

});
