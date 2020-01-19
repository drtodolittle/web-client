/*

    Dr ToDo Little
    The main controller

*/

tdapp.controller("mainCtrl", function(
    $scope,
    $rootScope,
    $timeout,
    $interval,
    $location,
    $route,
    $http,
    $routeParams,
    todoservice,
    localStorageService
) {

    // Initial filter setting

    $scope.showdone = false;

    // Hashtags

    jQuery.fn.getSelectionStart = function(){
        if(this.lengh == 0) return -1;
        var input = this[0];
        var pos = input.value.length;
        if (input.createTextRange) {
            var r = document.selection.createRange().duplicate();
            r.moveEnd('character', input.value.length);
            if (r.text == '')
            pos = input.value.length;
            pos = input.value.lastIndexOf(r.text);
        } else if(typeof(input.selectionStart)!="undefined")
        pos = input.selectionStart;
        return pos;
    }

    jQuery.fn.getCursorPosition = function(){
        if(this.lengh == 0) return -1;
        return $(this).getSelectionStart();
    }

    $scope.hashtags = {
        show : false,
        ptr : 0,
        hashtagpos : 0,
        hashtaginput : '#'
    }

    //$scope.showhashtags = false;
    //$scope.hashtagptr = 0;
    //$scope.hashtagpos = 0;

    function _showht(){
        if(todoservice.tags.length > 0){
            $scope.hashtags.show = true;
            $scope.hashtags.ptr = 0;
            var html = '';
            todoservice.tags.forEach(function(t){
                html += '<p id=tag' + todoservice.tags.indexOf(t) + '>' + t + '</p>';
            })
            $('#hashtags').html(html);
            $('#hashtags').css('visibility','visible');
            $('#tag'+$scope.hashtags.ptr).css('background','#eeeeee')
        }
    }
    function _hideht(){
        $scope.hashtags.show = false;
        $scope.hashtags.ptr = 0;
        $('#hashtags').html('');
        $('#hashtags').css('visibility','hidden');
    }
    function _updateht(){
        var html = '';
        var idx = -1;
        todoservice.tags.forEach(function(t){
            if(t.startsWith($scope.hashtags.hashtaginput)){
                if(idx == -1){
                    idx = todoservice.tags.indexOf(t);
                }
                html += '<p id=tag' + todoservice.tags.indexOf(t) + '>' + t + '</p>';
            }
        })
        if(html==''){
            $scope.hashtags.show = false;
        }
        $scope.hashtags.ptr = idx;
        $('#hashtags').html(html);
        $('#hashtags').css('visibility','visible');
        $('#tag'+$scope.hashtags.ptr).css('background','#eeeeee')
    }

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

    // Initial todo counting

    $scope.numOfTodos = {
        current : 0,
        all : 0
    };

    // Keyboard

    $scope.newtodoKeydown = function(e) {
        var k = e.keyCode;
        if (k == 13) { // Return
            e.preventDefault();
            if($scope.newtodotxt == "" || $('#todotxta').val().length == 0){
                showInfo('Please enter some text!');
                return;
            }
            if($scope.hashtags.show){
                var selht = todoservice.tags[$scope.hashtags.ptr];
                var curpos = $scope.hashtags.hashtagpos;
                var curin = $scope.newtodotxt
                var pre = curin.substring(0,curpos);
                var pos = curin.substring(curpos+1,curin.length+1);
                pos = pos.substring($scope.hashtags.hashtaginput.length-1,pos.length);
                $('#todotxta').val(pre + selht + pos);
                $scope.newtodotxt = $('#todotxta').val();
                _hideht();
                return
            }
            if ($scope.newtodotxt != "") {
                var newtodo = {}
                newtodo.topic = $scope.newtodotxt
                newtodo.done = false
                $scope.newtodotxt = ""
                todoservice.create(newtodo).then(function(response) {
                    $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone)
                    window.scrollTo(0, 0)
                    $("#todotxta").focus()
                    $scope.numOfTodos.all ++;
                    $scope.numOfTodos.current ++;
                }).catch(function(error) {
                    showError(error.message)
                })
            }
            _hideht();
            return
        }
        if (k == 9) { // Tab
            e.preventDefault();
            _hideht();
            return;
        }
        if (k == 8 || k == 37 || k == 39 || k == 46) { // Back + Left + Right + Del
            if ($scope.hashtags.show) {
                if (k == 8) {
                    var htinp = $scope.hashtags.hashtaginput;
                    var redin = htinp.substring(0,htinp.length-1)
                    $scope.hashtags.hashtaginput = redin;
                    if (redin.length<=0) {
                        _hideht();
                    } else {
                        _updateht();
                    }
                }
            }
            return;
        }
        if (k == 191 || k == 163) { // Hashkey
            if(todoservice.tags.length > 0){
                _showht();
                $scope.hashtags.hashtaginput = "#";
                $scope.hashtags.hashtagpos = $('#todotxta').getCursorPosition();
                $('#tag'+$scope.hashtags.hashtagptr).css('background','#eeeeee')
            }
            return
        }
        if (k == 38){ // Up (for selecting a hashtag)
            if($scope.hashtags.show){
                $('#tag'+$scope.hashtags.ptr).css('background','#ffffff')
                $scope.hashtags.ptr--;
                if($scope.hashtags.ptr < 0){
                    $scope.hashtags.ptr = todoservice.tags.length-1;
                }
                $('#tag'+$scope.hashtags.ptr).css('background','#eeeeee')
            }
            return
        }
        if (k == 40){ // Down (for selecting a hashtag)
            if($scope.hashtags.show){
                $('#tag'+$scope.hashtags.ptr).css('background','#ffffff')
                $scope.hashtags.ptr++;
                if($scope.hashtags.ptr >= todoservice.tags.length){
                    $scope.hashtags.ptr = 0;
                }
                $('#tag'+$scope.hashtags.ptr).css('background','#eeeeee')
            }
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
        // Add new character to hashtaginput (if # was entered before)
        if($scope.hashtags.show){
            if(e.key!="Shift"){
                $scope.hashtags.hashtaginput += e.key;
            }
            _updateht();
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
            $scope.numOfTodos.all --;
            $scope.numOfTodos.current --;
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
            item.done = false;
            todoservice.undone(item).then(function() {
                _update()
            }).catch(function(e) {
                showError(e.message)
            })
        } else {
            item.done = true;
            todoservice.done(item).then(function() {
                _update()
            }).catch(function(e) {
                showError(e.message)
            })
        }
    }

    $scope.saveedittodo = function(todo,data) {
        todo.topic = data.replace(/"/g, '\\"') // Avoid server error (if " is used in todo topic)
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
        $scope.numOfTodos.current = $scope.todos.length;
    }

    // Get/Prepare todos
    $scope.getTodosByTag = todoservice.getTodosByTag;
    var _t = localStorageService.get("logintoken")
    if (_t == null){
        _t = $http.defaults.headers.common['Authorization']
    }
    if (_t != null)
    todoservice.getTodos().then(function(todos) {
        $('#todoarea').css('visibility',"visible");
        $scope.numOfTodos.all = todos.length;
        // Check for previews url
        if($scope._url != "/" && $scope._url != "/todos/open/all"){
            $location.path($scope._url)
            $scope._url = undefined
        }
        // Normal
        $scope.todos = todoservice.getTodosByTag($scope.filtertag, $scope.showdone);
        $scope.tags = todoservice.getTags();
        $scope.numOfTodos.current = $scope.todos.length;
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
            $scope.numOfTodos.current = $scope.todos.length;
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
            $scope.numOfTodos.current = $scope.todos.length;
        }
        $("#todotxta").focus();
    }).catch(function(error) {
        $('#todoarea').css('visibility',"visible"); // Show the whole todo area
        $('#todoareacontent').css('visibility',"hidden"); // Only show the error message (without the content area)
        if(error == undefined) {
            $rootScope.open_dialog();
            return;
        }
        if ($scope.user != undefined) { // Avoid displaying an "Unauthorized"-Error before login
            showError(error.statusText)
        }
        if (error.data == null) {
            showError("A backend problem occured. Please try again later.")
            console.log(error) // Because of a lot of backend erros today (11.02.2017)
        }
    })
    else {
        $location.path("/")
        $rootScope.open_dialog()
        $timeout(function(){
            $('#signin-email').focus()
        },128)
    }

    // Finish

    $("#todotxta").focus();

});
