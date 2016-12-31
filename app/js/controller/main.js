/*

    Dr ToDo Little
    The main controller

*/

tdapp.controller("mainCtrl", function(
    $scope,
    $timeout,
    $interval,
    $location,
    $route,
    $routeParams,
    todoservice
) {

    // Initial filter setting

    $scope.showdone = false;

    // Initial todotextarea count setting / maximal length of todo

    $scope.todotxtacount = 0
    $scope._maxlen = 1024
    $interval(function() {
        var content = $("#todotxta").val()
        if(content != undefined){
            var len = content.length
            if(len>=$scope._maxlen){
                $("#todotxta").val(content.substring(0,$scope._maxlen))
                len = $scope._maxlen
            }
            $scope.todotxtacount = len
        }
    }, 64)

    // Keyboard

    $scope.newtodoKeydown = function(e) {
        var k = e.keyCode;
        if (k == 13) { // Return
            e.preventDefault();
            if ($scope.newtodotxt != "") {
                var newtodo = {}
                newtodo.topic = $scope.newtodotxt
                newtodo.done = false
                $scope.newtodotxt = ""
                todoservice.create(newtodo).then(function(response) {
                    $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone)
                    window.scrollTo(0, 0)
                    $("#todotxta").focus()
                }).catch(function(error) {
                    showError(error.message)
                })
            }
            return
        }
        if (k == 9) { // Tab
            e.preventDefault();
            return
        }
        if (k == 8 || k == 37 || k == 39 || k == 46) { // Back + Left + Right + Del
            return
        }
        // Limit amount of characters in todotextarea
        var len = $("#todotxta").val().length
        if (len >= $scope._maxlen) {
            var content = $("#todotxta").val()
            $("#todotxta").val(content.substring(0,$scope._maxlen))
            $scope.todotxtacount = $scope._maxlen
            e.preventDefault()
            return
        }
    }

    $scope.editTodoKeydown = function(e,id) {
        var k = e.keyCode;
        if (k == 13) { // Return
            e.preventDefault()
        }
        if (k == 9) { // Tab
            e.preventDefault()
        }
        if (k == 8 || k == 37 || k == 38 || k == 39 || k == 40 || k == 46) { // Back + Left + Up + Right + Down + Del
            return
        }
        var len = $('.editable-input').val().length
        if (len >= $scope._maxlen) {
            e.preventDefault()
            return
        }
    }

    $scope.displaytodos = function(tag) {
        var status = "open"
        if ($scope.showdone) status = "done"
        if (tag != 'All' && tag != undefined) {
            $location.path('/todos/' + status + '/tag/' + tag.substring(1, tag.length));
            $scope.todos = todoservice.getTodosByTag(tag, $scope.showdone);
        } else {
            $location.path('/todos/' + status + '/all')
            $scope.todos = todoservice.getTodosByTag('All', $scope.showdone);
        }
    }

    // Todo functions

    $scope.seltodoline = function(id) {
        $("#todoid" + id).focus();
    }

    $scope.deltodo = function(obj) {
        todoservice.delTodo(obj).then(function() {
            if ($location.path().indexOf("/todos/todo") == -1) {
                $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
            } else {
                $location.path("/")
            }
        }).catch(function(error) {
            showError(error.message)
        })
    }

    $scope.togDone = function(item) {
        var _update = function() {
            if ($location.path().indexOf("/todos/todo") == -1) {
                $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
            }
            $scope.tags = todoservice.getTags();
        }
        if (item.done) {
            todoservice.undone(item).then(function() {
                _update()
            }).catch(function(e) {
                showError(e.message)
            })
        } else {
            todoservice.done(item).then(function() {
                _update()
            }).catch(function(e) {
                showError(e.message)
            })
        }
    }

    $scope.saveedittodo = function(todo) {
        $scope.showedit = false
        var otodotopic = todo.topic
        todoservice.update(todo).then(function() {
            if ($location.path().indexOf('todos/todo') != -1) {
                $route.reload()
            } else {
                $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone)
            }
        }).catch(function(error) {
            showError(error.message)
            todoservice.todos.forEach(function(obj) {
                if (obj.id == todo.id) {
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
            return
        }
        $scope.showdone = !$scope.showdone;
        if (
            $location.path().indexOf("open/all") > -1
        ) {
            $location.path('/todos/done/all')
            $route.reload()
            return
        }
        if (
            $location.path().indexOf("done/all") > -1
        ) {
            $location.path('/todos/open/all')
            $route.reload()
            return
        }
        if ($scope.filtertag != undefined && $scope.filtertag != "All" && $scope.filtertag != "/") {
            if ($scope.showdone) {
                $location.path("todos/done/tag/" + $scope.filtertag.substring(1, $scope.filtertag.length));
            } else {
                $location.path("todos/open/tag/" + $scope.filtertag.substring(1, $scope.filtertag.length));
            }
        } else {
            $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
        }
    }

    // Get/Prepare todos

    $scope.getTodosByTag = todoservice.getTodosByTag;
    todoservice.getTodos().then(function(todos) {
        // Check for previews url
        if($scope._url != "/"){
            $location.path($scope._url)
            $scope._url = undefined
        }
        // Normal
        $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
        $scope.tags = todoservice.getTags();
        // Routeparams
        if ( // Direct
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
        if ( // Tag
            $routeParams.status != undefined &&
            $routeParams.type != undefined &&
            $routeParams.id != undefined &&
            $routeParams.type == "tag"
        ) {
            if ($routeParams.status == "open") {
                $scope.todos = todoservice.getTodosByTag("#" + $routeParams.id, false);
                $scope.showdone = false;
            }
            if ($routeParams.status == "done") {
                $scope.todos = todoservice.getTodosByTag("#" + $routeParams.id, true);
                $scope.showdone = true;
            }
            $scope.filtertag = '#' + $routeParams.id
        }
        if ( // All
            $routeParams.type != undefined &&
            $routeParams.id == "all"
        ) {
            if ($routeParams.type == "open") {
                $scope.showdone = false
                $scope.todos = todoservice.getTodosByTag('All', $scope.showdone)
            }
            if ($routeParams.type == "done") {
                $scope.showdone = true
                $scope.todos = todoservice.getTodosByTag('All', $scope.showdone)
            }
        }
    }).catch(function(error) {
        if ($scope.user != undefined) { // Avoid displaying an "Unauthorized"-Error before login
            showError(error.statusText)
        }
        if (error.data == null) {
            showError("A backend problem occured. Please try again later.")
        }
    })

    // Finish

    $("#todotxta").focus();

});
