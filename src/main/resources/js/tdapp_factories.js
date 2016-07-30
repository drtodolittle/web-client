/*

	tdapp_factories.js

*/
var tdapp = require('./tdapp');

tdapp.factory("TDMgr",function(){ // ToDoManager
	var fact = {};
	fact.todos = [];
	fact.tags = [];	
	fact.checkForHashtag = function(obj){
		if(obj.topic==undefined){
			return;
		}
		obj.tags = [];
		var s = obj.topic.indexOf('#');
		var e = 0;
		while(s>=0){
			e = obj.topic.indexOf(' ',s+1);
			if(e==-1) e=obj.topic.length;
			var tag = obj.topic.substring(s,e);
			if(tag=='#') tag = undefined;
			if(tag!=undefined){
				obj.tags.push(tag);
			}
			if(tag!=undefined && fact.tags.indexOf(tag)<0){
				fact.tags.push(tag);
			}
			s = obj.topic.indexOf('#', s+1);		
		}
	}
	fact.getTags = function(){
		return fact.tags;
	}
	fact.getTodos = function(){
		return fact.todos;
	}
	fact.getTodosByTag = function(tag,done){
		if(tag=='' || tag=='All'){
			var ret = [];
			if(done){
				fact.todos.forEach(function(obj){
					if(obj.done){
						ret.push(obj);
					}
				});
			} else {
				fact.todos.forEach(function(obj){
					if(!obj.done){
						ret.push(obj);
					}
				});
			}
			return ret;		
		}
		var tagged = [];
		fact.todos.forEach(function(obj){
			if(obj.tags.indexOf(tag)>=0){
				if(done){
					if(obj.done) tagged.push(obj);
				} else {
					if(!obj.done) tagged.push(obj);
				}
			}
		});
		return tagged;
	}
	fact.setTodos = function(todolist){
		if(todolist==undefined) return;
		fact.todos = todolist;
		if(todolist.length>0){
			fact.todos.forEach(function(obj){
				fact.checkForHashtag(obj);
			});		
		}
	}
	fact.clearTodos = function(){
		while(fact.todos.length>0){
			fact.todos.pop();
		}
		while(fact.tags.length>0){
			fact.tags.pop();
		}		
	}
	fact.getTodoById = function(id){
		var ret = undefined;
		fact.todos.forEach(function(obj){
			if(obj.id==id){
				ret = obj;
			}
		});
		return ret;
	}
	fact.addTodoObj = function(obj){
		obj.predone = obj.done;
		fact.checkForHashtag(obj);		
		fact.todos.unshift(obj);
		return obj;
	}
	fact.addTodo = function(topic){
		var obj = {"topic":topic,done:false};
		fact.addTodoObj(obj);
		return obj;
	}
	fact.delTodo = function(item){
		var idx = fact.todos.indexOf(item)
		if(idx>=0){
			var tag = item.tag;
			fact.todos.splice(idx,1);
			if( tag!=undefined ){
				var ttd = fact.getTodosByTag(tag);
				if( ttd.length==0 ){
					fact.tags.splice(fact.tags.indexOf(tag),1);
				}
			}		
		}
	}
	fact.togPreDone = function(item){
		var idx = fact.todos.indexOf(item);
		if( idx<0 ) return;
		var todo = fact.todos[idx];
		if(todo.predone){
			todo.predone = false;
		} else {
			todo.predone = true;
		}
	}
	fact.togDone = function(item){
		var idx = fact.todos.indexOf(item);
		if( idx<0 ) return;
		var todo = fact.todos[idx];
		if(todo.done){
			todo.done = false;
			todo.predone = todo.done;
		} else {
			todo.done = true;
			todo.predone = todo.done;
		}
	}	
	return fact;
});
