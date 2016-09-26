/*

	backend.js

*/
tdapp.service('backend',function($http,$timeout,$location,appdata,todoservice){
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


});
