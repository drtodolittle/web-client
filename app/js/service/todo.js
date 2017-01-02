/*

    Dr ToDo Little
	The ToDo service

*/

tdapp.service("todoservice", function(backend) { // ToDoManager

    // Data

    var ERRORMSG = "A backend problem occured. Please try again later."
    var service = {};
    service.todos = [];
    service.tags = [];

    // Internal helper functions (Prefix '_')

    var _update = function(todo) {
        service.todos.forEach(function(obj) {
            if (obj.id == todo.id) {
                obj.done = todo.done
            }
        })
    }

    var _updateTags = function() {
        var backup = []
        service.todos.forEach(function(obj) {
            backup.unshift(obj)
        })
        service.clearTodos()
        backup.forEach(function(todo) {
            service.addTodoObj(todo)
        })
    }

    // Functions with backend interaction

    service.getTodos = function() {
        return new Promise(function(resolve, reject) {
            backend.getTodos().then(function(response) {
                    service.clearTodos()
                    if(response != undefined){
                        response.data.forEach(function(todo) {
                            service.addTodoObj(todo)
                        })
                    }
                    resolve(service.todos)
                })
                .catch(function(error) {
                    reject(error)
                })
        })
    }
    service.create = function(newtodo) {
        return new Promise(function(resolve, reject) {
            backend.postTodo(newtodo).then(function(response) {
                newtodo.id = response.data.id
                backend.incTodosTotal()
                service.addTodoObj(newtodo)
                resolve()
            }).catch(function(error) {
                reject({
                    message: ERRORMSG,
                    error: error
                })
            })
        })
    }
    service.done = function(item) {
        return new Promise(function(resolve, reject) {
            backend.doneTodo(item).then(function() {
                item.done = true
                _update(item)
                resolve()
            }).catch(function(error) {
                reject({
                    message: ERRORMSG,
                    error: error
                })
            })
        })
    }
    service.undone = function(item) {
        return new Promise(function(resolve, reject) {
            backend.undoneTodo(item).then(function() {
                item.done = false
                _update(item)
                resolve()
            }).catch(function(error) {
                reject({
                    message: ERRORMSG,
                    error: error
                })
            })
        })
    }
    service.update = function(todo) {
        return new Promise(function(resolve, reject) {
            backend.putTodo(todo).then(function() {
                service.checkForHashtag(todo)
                _updateTags()
                resolve()
            }).catch(function(error) {
                reject({
                    message: ERRORMSG,
                    error: error
                })
            })
        })
    }
    service.delTodo = function(item) {
        return new Promise(function(resolve, reject) {
            backend.delTodo(item).then(function() {
                backend.incTodosDeleted()
                var idx = service.todos.indexOf(item)
                if (idx >= 0) {
                    var tags = item.tags
                    service.todos.splice(idx, 1)
                    if (tags != undefined) {
                        tags.forEach(function(tag) {
                            var ttd = service.getTodosByTag(tag)
                            if (ttd.length == 0) {
                                service.tags.splice(service.tags.indexOf(tag), 1)
                            }
                        })
                    }
                }
                resolve()
            }).catch(function(error) {
                reject({
                    message: ERRORMSG,
                    error: error
                })
            })
        })
    }

    // Functions without backend interaction

    service.checkForHashtag = function(todo) {
        if (todo.topic == undefined) {
            return
        }
        todo.tags = []
        var s = todo.topic.indexOf('#')
        var e = 0
        while (s >= 0) {
            e = todo.topic.indexOf(' ', s + 1)
            if (e == -1) e = todo.topic.length
            var tag = todo.topic.substring(s, e)
            if (tag == '#') tag = undefined
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
                if (tag.length > 0) tag = "#" + tag
            }
            if (tag != undefined) {
                todo.tags.push(tag)
            }
            if (tag != undefined && service.tags.indexOf(tag) < 0) {
                service.tags.push(tag)
            }
            s = todo.topic.indexOf('#', e)
        }
    }
    service.getTags = function() {
        return service.tags
    }
    service.getTodosByTag = function(tag, done) { // Assuming the tag starts with #
        if (tag == '' || tag == 'All' || tag == undefined) {
            var ret = []
            if (done) {
                service.todos.forEach(function(obj) {
                    if (obj.done) {
                        ret.push(obj)
                    }
                })
            } else {
                service.todos.forEach(function(obj) {
                    if (!obj.done) {
                        ret.push(obj)
                    }
                })
            }
            return ret
        }
        var tagged = []
        service.todos.forEach(function(obj) {
            if (obj.tags.indexOf(tag) >= 0) {
                if (done) {
                    if (obj.done) tagged.push(obj)
                } else {
                    if (!obj.done) tagged.push(obj)
                }
            }
        });
        return tagged
    }
    service.setTodos = function(todolist) {
        if (todolist == undefined) return
        service.todos = todolist
        if (todolist.length > 0) {
            service.todos.forEach(function(obj) {
                service.checkForHashtag(obj)
            })
        }
    }
    service.clearTodos = function() {
        while (service.todos.length > 0) {
            service.todos.pop()
        }
        while (service.tags.length > 0) {
            service.tags.pop()
        }
    }
    service.getTodoById = function(id) {
        var ret = undefined
        service.todos.forEach(function(obj) {
            if (obj.id == id) {
                ret = obj
            }
        })
        return ret
    }
    service.addTodoObj = function(obj) {
        obj.predone = obj.done
        service.checkForHashtag(obj)
        service.todos.unshift(obj)
        return obj
    }
    service.addTodo = function(topic) {
        var obj = {
            "topic": topic,
            done: false
        };
        service.addTodoObj(obj)
        return obj
    }
    return service

})
