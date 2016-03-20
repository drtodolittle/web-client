/*

	tdapp_factories.js

*/
var tdapp = require('./tdapp');

tdapp.factory("CLogger",function(){ // ClientLogger
	fact = {};
	fact._log = [];
	fact.log = function(logtxt){
		fact._log.push(logtxt);
		if(fact._log.length>32){
			fact._log.shift();
		}
	}
	fact.getLog = function(){
		return fact._log;
	}
	for(i=0;i<32;i++){
		fact.log("");
	}
	return fact;	
});

tdapp.factory("TDMgr",function(){ // ToDoManager
	var fact = {};
	fact.todos = [];
	fact.tags = [];
	fact.checkForHashtag = function(obj){
		if(obj.topic==undefined){
			return;
		}
		if(obj.topic.indexOf('#')>=0){
			var s = obj.topic.indexOf('#');
			if(s==-1) e=obj.topic.length;			
			var e = obj.topic.indexOf(' ',s+1);
			if(e==-1) e=obj.topic.length;
			var tag = obj.topic.substring(s,e);
			if(tag=='#') tag = undefined;
			obj.tag = tag;
			if(tag!=undefined && fact.tags.indexOf(tag)<0){
				fact.tags.push(tag);
			}
		} else {
			obj.tag = undefined;
		}
	}
	fact.getTags = function(){
		return fact.tags;
	}
	fact.getTodos = function(){
		return fact.todos;
	}
	fact.getTodosByTag = function(tag){
		if(tag=='' || tag=='All') return fact.todos;
		if(tag=='Open'){
			var tds = [];
			fact.todos.forEach(function(todo){
				if(!todo.done) tds.push(todo);
			});
			return tds;
		}
		if(tag=='Done'){
			var dtd = [];
			fact.todos.forEach(function(todo){
				if(todo.done) dtd.push(todo);
			});
			return dtd;
		}
		var tagged = [];
		fact.todos.forEach(function(obj){
			if(obj.tag!=undefined && obj.tag==tag){
				tagged.push(obj);
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
		fact.checkForHashtag(obj);		
		fact.todos.unshift(obj);
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
	fact.togDone = function(item){
		var idx = fact.todos.indexOf(item);
		if( idx<0 ) return;
		var todo = fact.todos[idx];
		if(todo.done){
			todo.done = false;
		} else {
			todo.done = true;
		}
	}
	return fact;
});
