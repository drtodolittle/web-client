/*

	Dr ToDo Little
	The backend service

*/

tdapp.service('backend', function($http, appdata, localStorageService) {

    // Misc

    var token = localStorageService.get("logintoken")
    if (token != undefined) {
        $http.defaults.headers.common['Authorization'] = "Bearer " + token
    }

    // Dr ToDo Little backend

    this.postTodo = function(obj) {
        return $http({
            method: "post",
            url: appdata.server,
			timeout: 3000,
            header: "application/json",
            data: obj
        })
    }
    this.putTodo = function(obj) {
        return $http({
            method: "put",
            url: appdata.server + "/" + obj.id,
            header: "application/json",
            data: obj,
            timeout: 3000
        })
    }
    this.delTodo = function(obj) {
        return $http({
            method: "delete",
            url: appdata.server + "/" + obj.id,
            header: "application/json",
            timeout: 3000,
            data: obj
        })
    }
    this.doneTodo = function(obj) {
        return $http({
            method: "get",
            url: appdata.server + "/" + obj.id + "/done",
            timeout: 3000
        })
    }
    this.undoneTodo = function(obj) {
        return $http({
            method: "get",
            url: appdata.server + "/" + obj.id + "/undone",
            timeout: 3000
        })
    }
    this.getTodos = function() {
        return $http({
            method: "get",
            url: appdata.server,
			timeout: 3000
        })
    }

    // Firebase realtime database backend

    this.incTodosTotal = function() {
        firebase.database().ref('/data/misc/todos/total').transaction(
                function(data) {
                    data += 1;
                    return data;
                }
            )
            .catch(function(error) {
                console.log("Error: " + error.message);
            })
    }
    this.incTodosDeleted = function() {
        firebase.database().ref('/data/misc/todos/deleted').transaction(
                function(data) {
                    data += 1;
                    return data;
                }
            )
            .catch(function(error) {
                console.log("Error: " + error.message);
            })
    }
    this.incTodosDone = function() {
        firebase.database().ref('/data/misc/todos/done').transaction(
                function(data) {
                    data += 1;
                    return data;
                }
            )
            .catch(function(error) {
                console.log("Error: " + error.message);
            })
    }
    this.incTodosUndone = function() {
        firebase.database().ref('/data/misc/todos/undone').transaction(
                function(data) {
                    data += 1;
                    return data;
                }
            )
            .catch(function(error) {
                console.log("Error: " + error.message);
            })
    }

})
