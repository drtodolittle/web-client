/*

	Dr ToDo Little
	the Backend Service

*/

tdapp.service('backend', function($http, appdata, localStorageService) {
    var token = localStorageService.get("logintoken");
    if (token != undefined) {
        $http.defaults.headers.common['Authorization'] = "Bearer " + token;
    }
    this.postTodo = function(obj) {
        return $http({
            method: "post",
            url: appdata.server,
			timeout: 5000,
            header: "application/json",
            data: obj
        })
    }
    this.putTodo = function(obj) {
        $http({
            method: "put",
            url: appdata.server + "/" + obj.id,
            header: "application/json",
            data: obj
        }).then(
            function successCallback(res) {},
            function errorCallback(res) {
                console.log("Error: " + JSON.stringify(res));
            }
        );
    }
    this.delTodo = function(obj) {
        $http({
            method: "delete",
            url: appdata.server + "/" + obj.id,
            header: "application/json",
            data: obj
        }).then(
            function successCallback(res) {},
            function errorCallback(res) {
                console.log("Error: " + JSON.stringify(res));
            }
        );
    }
    this.doneTodo = function(obj) {
        $http({
            method: "get",
            url: appdata.server + "/" + obj.id + "/done",
        }).then(
            function successCallback(res) {},
            function errorCallback(res) {
                console.log("Error: " + JSON.stringify(res));
            }
        );
    }
    this.undoneTodo = function(obj) {
        $http({
            method: "get",
            url: appdata.server + "/" + obj.id + "/undone",
        }).then(
            function successCallback(res) {},
            function errorCallback(res) {
                console.log("Error: " + JSON.stringify(res));
            }
        );
    }
    this.getTodos = function() {
        return $http({
            method: "get",
            url: appdata.server,
			timeout: 5000
        });
    }

    // Firebase realtime database

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

});
