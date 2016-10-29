/*

	Service: todo.js

*/

tdapp.service("todoservice", function(backend, $q) { // ToDoManager
    var service = {};
    service.todos = [];
    service.tags = [];

    service.create = function(newtodo) {
        backend.postTodo(newtodo);
        backend.incTodosTotal();
        service.addTodoObj(newtodo);
    }

    service.update = function(todo) {
		service.checkForHashtag(todo); // TODO: Update tag list
        backend.putTodo(todo); // TODO: Check for backend return code 204 (no content)
    }

    service.checkForHashtag = function(todo) {
		if (todo.topic == undefined) {
            return;
        }
        todo.tags = [];
        var s = todo.topic.indexOf('#');
        var e = 0;
        while (s >= 0) {
            e = todo.topic.indexOf(' ', s + 1);
            if (e == -1) e = todo.topic.length;
            var tag = todo.topic.substring(s, e);
            if (tag == '#') tag = undefined;
            if (tag != undefined) {
                // Check front
                var res = new RegExp("^[#:.!]")
                while (res.test(tag)) {
                    tag = tag.substring(1, tag.length)
                }
                // Check back
                var ree = new RegExp("[:.!#]$")
                while (ree.test(tag)) {
                    tag = tag.substring(0, tag.length - 1)
                }
                // Adjust
                if (tag.length>0) tag = "#" + tag
            }
            if (tag != undefined) {
                todo.tags.push(tag);
            }
            if (tag != undefined && service.tags.indexOf(tag) < 0) {
                service.tags.push(tag);
            }
            s = todo.topic.indexOf('#', s + 1);
        }
    }
    service.getTags = function() {
        return service.tags;
    }
    service.getTodos = function() {
        return $q(function(resolve, reject) {
            backend.getTodos().then(function(response) {
                service.clearTodos();
                response.data.forEach(function(todo) {
                    service.addTodoObj(todo);
                });
                resolve(service.todos);
            });
        });
    }
    service.getTodosByTag = function(tag, done) {
        if (tag == '' || tag == 'All' || tag == undefined) {
            var ret = [];
            if (done) {
                service.todos.forEach(function(obj) {
                    if (obj.done) {
                        ret.push(obj);
                    }
                });
            } else {
                service.todos.forEach(function(obj) {
                    if (!obj.done) {
                        ret.push(obj);
                    }
                });
            }
            return ret;
        }
        var tagged = [];
        service.todos.forEach(function(obj) {
            if (obj.tags.indexOf(tag) >= 0) {
                if (done) {
                    if (obj.done) tagged.push(obj);
                } else {
                    if (!obj.done) tagged.push(obj);
                }
            }
        });
        return tagged;
    }
    service.setTodos = function(todolist) {
        if (todolist == undefined) return;
        service.todos = todolist;
        if (todolist.length > 0) {
            service.todos.forEach(function(obj) {
                service.checkForHashtag(obj);
            });
        }
    }
    service.clearTodos = function() {
        while (service.todos.length > 0) {
            service.todos.pop();
        }
        while (service.tags.length > 0) {
            service.tags.pop();
        }
    }
    service.getTodoById = function(id) {
        var ret = undefined;
        service.todos.forEach(function(obj) {
            if (obj.id == id) {
                ret = obj;
            }
        });
        return ret;
    }
    service.addTodoObj = function(obj) {
        obj.predone = obj.done;
        service.checkForHashtag(obj);
        service.todos.unshift(obj);
        return obj;
    }
    service.addTodo = function(topic) {
        var obj = {
            "topic": topic,
            done: false
        };
        service.addTodoObj(obj);
        return obj;
    }
    service.delTodo = function(item) {
        backend.delTodo(item);
        backend.incTodosDeleted();

        var idx = service.todos.indexOf(item)
        if (idx >= 0) {
            var tag = item.tag;
            service.todos.splice(idx, 1);
            if (tag != undefined) {
                var ttd = service.getTodosByTag(tag);
                if (ttd.length == 0) {
                    service.tags.splice(service.tags.indexOf(tag), 1);
                }
            }
        }
    }
    service.done = function(item) {
        backend.doneTodo(item);
    };
    service.undone = function(item) {
        backend.undoneTodo(item);
    };

    return service;
});
