/*

    Dr ToDo Little
    The main controller

*/

tdapp.controller("mainCtrl", function(
    $scope,
    $timeout,
    $location,
    $route,
    $routeParams,
    todoservice
) {

    // General Done Filter

    $scope.showdone = false;
    $scope.showdonetext = "Show Done";

    // Keyboard

    $scope.newtodoKeydown = function(e) {
        var k = e.keyCode;
        if (k == 13) { // Return
            e.preventDefault();
            if ($scope.newtodotxt != "") {
                var newtodo = {};
                newtodo.topic = $scope.newtodotxt;
                newtodo.done = false;
                $scope.newtodotxt = "";
                todoservice.create(newtodo).then(function(response){
                    $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
                    window.scrollTo(0, 0);
                    $("#todotxta").focus();
                }).catch(function(error){
                    showError(error.message)
                })
            }
        } else
        if (k == 9) { // Tab
            e.preventDefault();
        }
    }

    $scope.editTodoKeydown = function(e) {
        var k = e.keyCode;
        if (k == 13) { // Return
            e.preventDefault();
        }
    }

    $scope.displaytodos = function(tag) {
        if (tag != 'All' && tag != undefined) {
            $location.path('/todos/open/tag/' + tag.substring(1, tag.length));
            $scope.todos = todoservice.getTodosByTag(tag, $scope.showdone);
        } else {
            $location.path('/');
            $scope.todos = todoservice.getTodosByTag('All', $scope.showdone);
        }
    }

    // Todo functions

    $scope.seltodoline = function(id) {
        $("#todoid" + id).focus();
    }

    $scope.deltodo = function(obj) {
        todoservice.delTodo(obj).then(function(){
            $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone)
        }).catch(function(error){
            showError(error.message)
        })
    }

    $scope.togDone = function(item) {
        var _update = function(){
            if ($location.path().indexOf("/todos/todo") == -1) {
                $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
            }
            $scope.tags = todoservice.getTags();
        }
        if (item.done) {
            todoservice.undone(item).then(function(){
                _update()
            }).catch(function(e){
                showError(e.message)
            })
        } else {
            todoservice.done(item).then(function(){
                _update()
            }).catch(function(e){
                showError(e.message)
            })
        }
    }

    $scope.saveedittodo = function(todo) {
        $scope.showedit = false;
        var otodotopic = todo.topic
        todoservice.update(todo).catch(function(error){
            showError(error.message)
            todoservice.todos.forEach(function(obj){
                if(obj.id == todo.id){
                    obj.topic = otodotopic
                }
            })
            $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone)
        })
    }

    $scope.todocopylink = function(id) {
        var url =
            $location.protocol() + "://" + $location.host() + ":" + $location.port() +
            "/todos" +
            "/todo/" + id
        window.prompt("Copy to clipboard: Ctrl+C, Enter", url);
    }

    // Filter function

    $scope.togShowdone = function() {
        if ($location.path().indexOf("/todos/todo/") != -1) {
            showInfo('If you view a todo in direct mode (see URL), it is not possible to toggle between Open and Done.')
            return;
        }
        $scope.showdone = !$scope.showdone;
        if ($scope.filtertag != undefined && $scope.filtertag != "All" && $scope.filtertag != "/") {
            if ($scope.showdone) {
                $location.path("todos/done/tag/" + $scope.filtertag.substring(1, $scope.filtertag.length));
            } else {
                $location.path("todos/open/tag/" + $scope.filtertag.substring(1, $scope.filtertag.length));
            }
        } else {
            $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
            if ($scope.showdone) {
                $scope.showdonetext = "Show Open";
            } else {
                $scope.showdonetext = "Show Done";
            }
        }
    }

    // Get/Prepare todos

    $scope.getTodosByTag = todoservice.getTodosByTag;
    todoservice.getTodos().then(function(todos) {
        // Normal
        $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
        $scope.tags = todoservice.getTags();
        // Routeparams
        if (
            $routeParams.type != undefined &&
            $routeParams.id != undefined &&
            $routeParams.type == "todo"
        ) {
            var _todo = todoservice.getTodoById($routeParams.id)
            if (_todo != undefined) {
                var _todos = [];
                _todos.push(_todo);
                $scope.todos = _todos;
            } else {
                $scope.todos = [];
            }
        }
        if (
            $routeParams.status != undefined &&
            $routeParams.type != undefined &&
            $routeParams.id != undefined &&
            $routeParams.type == "tag"
        ) {
            if ($routeParams.status == "open") {
                $scope.showdonetext = "Show Done";
                $scope.showdone = false;
                $scope.todos = todoservice.getTodosByTag("#" + $routeParams.id, false);
            }
            if ($routeParams.status == "done") {
                $scope.showdonetext = "Show Open";
                $scope.showdone = true;
                $scope.todos = todoservice.getTodosByTag("#" + $routeParams.id, true);
            }
            $scope.filtertag = '#' + $routeParams.id
        }
    }).catch(function(error) {
        if ($scope.user != undefined) { // Avoid displaying an "Unauthorized"-Error before login
            showError(error.statusText)
        }
        if(error.data==null){
            showError("A backend problem occured. Please try again later.")
        }
    })

    // Finish

    $("#todotxta").focus();

});
