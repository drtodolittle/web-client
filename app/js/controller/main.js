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
                todoservice.create(newtodo);
                if ($scope.showdone) {
                    $scope.showdone = false;
                    $scope.showdonetext = "Show Done";
                }
                if (newtodo.tag != undefined) {
                    $scope.filtertag = newtodo.tag;
                } else {
                    $scope.filtertag = "All";
                }
                $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
                window.scrollTo(0, 0);
                $("#todotxta").focus();
            }
        } else
        if (k == 9) { //tab
            e.preventDefault();
        }
    }

    $scope.todolineKeydown = function(e, id) {
        var k = e.keyCode;
        if (k == 13) { // Return
            e.preventDefault();
            var currentTodo = $('#todoid' + id);
            // Correct contenteditable behaviour
            currentTodo.html(currentTodo.html().replace('<br>', ''));
            currentTodo.blur();
            var obj = todoservice.getTodoById(id);
            if (obj != undefined) {
                obj.topic = currentTodo.html();
                todoservice.update(obj);
                var oldtag = obj.tag;
                todoservice.checkForHashtag(obj);
                if (oldtag != undefined) {
                    var ttd = todoservice.getTodosByTag(oldtag);
                    if (ttd.length <= 0) {
                        todoservice.tags.splice(todoservice.tags.indexOf(oldtag), 1);
                    }
                }
                $scope.tags = (todoservice.getTags()).sort();
                $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
            }
        }
    }

    $scope.editTodoKeydown = function(e) {
        var k = e.keyCode;
        if (k == 13) { // Return
            e.preventDefault();
        }
    }

    $scope.displaytodos = function(tag) {
        if(tag!='All' && tag!=undefined){
            $location.path('/todos/tag/'+tag.substring(1,tag.length));
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

    $scope.deltodo = function(obj) { // No animation
        obj.deleted = true;
        todoservice.delTodo(obj);
        $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
    }

    $scope.togDone = function(item) {
        if (item.done) {
            todoservice.undone(item);
            item.done = false;
        } else {
            todoservice.done(item);
            item.done = true;
        }
        $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
    }

    $scope.saveedittodo = function(todo) {
        $scope.showedit = false;
        todoservice.update(todo);
    }

    $scope.todocopylink = function(id){
        var url = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/todos/todo/" + id
        window.prompt("Copy to clipboard: Ctrl+C, Enter", url);
    }

    // Filter function

    $scope.togShowdone = function() {
        $scope.showdone = !$scope.showdone;
        if ($scope.showdone) {
            $scope.showdonetext = "Show Open";
        } else {
            $scope.showdonetext = "Show Done";
        }
        $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
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
            $routeParams.type != undefined &&
            $routeParams.id != undefined &&
            $routeParams.type == "tag"
        ) {
            $scope.todos = todoservice.getTodosByTag("#" + $routeParams.id, $scope.showdone);
            $scope.filtertag = '#'+$routeParams.id
        }
    });

    // Finish

    $("#todotxta").focus();

});
