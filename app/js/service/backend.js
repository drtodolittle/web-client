/*

	Dr ToDo Little
	The backend service

*/

tdapp.service('backend', function($q, $http, $firebaseAuth, appdata, localStorageService, $timeout) {

    // Misc

    var token = localStorageService.get("logintoken")
    if (token != undefined) {
        $http.defaults.headers.common['Authorization'] = "Bearer " + token
    }

    // New refresh token (promise)

    function _refreshToken() {
        return $q(function(resolve,reject){
            var auth = null
            var count = 0
            var ga = function(){
                auth = $firebaseAuth().$getAuth()
                if(auth == null){
                    count++
                    $timeout(ga,256)
                } else {
                    auth.getToken(true).then(function(token) {
                        $http.defaults.headers.common['Authorization'] = "Bearer " + token
                        resolve()
                    }).catch(function(resp){
                        reject()
                    })
                }
            }
            $timeout(ga,256)
        })
    }

    // New Dr ToDo Little backend (with token refresh for each interaction)

    this.getTodos = function(){
        return $q(function(resolve,reject){
            _refreshToken().then(function(){
                $http({
                    method: "get",
                    url: appdata.server,
                    timeout: 5000
                }).then(function(resp){
                    resolve(resp)
                }).catch(function(resp){
                    reject(resp)
                })
            }).catch(function(resp){
                reject(resp)
            })
        })
    }
    this.postTodo = function(obj) {
        return $q(function(resolve,reject){
            _refreshToken().then(function(){
                $http({
                    method: "post",
                    url: appdata.server,
                    timeout: 5000,
                    header: "application/json",
                    data: obj
                }).then(function(resp){
                    resolve(resp)
                }).catch(function(resp){
                    reject(resp)
                })
            }).catch(function(resp){
                reject(resp)
            })
        })
    }
    this.putTodo = function(obj) {
        var jsobj = JSON.stringify(obj)
        return $q(function(resolve,reject){
            _refreshToken().then(function(){
                $http({
                    method: "put",
                    url: appdata.server + "/" + obj.id,
                    header: "application/json",
                    data: jsobj,
                    timeout: 5000
                }).then(function(resp){
                    resolve(resp)
                }).catch(function(resp){
                    reject(resp)
                })
            }).catch(function(resp){
                reject(resp)
            })
        })
    }
    this.delTodo = function(obj) {
        return $q(function(resolve,reject){
            _refreshToken().then(function(){
                $http({
                    method: "delete",
                    url: appdata.server + "/" + obj.id,
                    header: "application/json",
                    timeout: 5000,
                    data: obj
                }).then(function(resp){
                    resolve(resp)
                }).catch(function(resp){
                    reject(resp)
                })
            }).catch(function(resp){
                reject(resp)
            })
        })
    }
    this.doneTodo = function(obj) {
        return $q(function(resolve,reject){
            _refreshToken().then(function(){
                $http({
                    method: "get",
                    url: appdata.server + "/" + obj.id + "/done",
                    timeout: 5000
                }).then(function(resp){
                    resolve(resp)
                }).catch(function(resp){
                    reject(resp)
                })
            }).catch(function(resp){
                reject(resp)
            })
        })
    }
    this.undoneTodo = function(obj) {
        return $q(function(resolve,reject){
            _refreshToken().then(function(){
                $http({
                    method: "get",
                    url: appdata.server + "/" + obj.id + "/undone",
                    timeout: 5000
                }).then(function(resp){
                    resolve(resp)
                }).catch(function(resp){
                    reject(resp)
                })
            }).catch(function(resp){
                reject(resp)
            })
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
