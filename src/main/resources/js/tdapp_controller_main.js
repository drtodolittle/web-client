/*

	tdapp_controller_main.js

*/
var tdapp = require('./tdapp');

tdapp.controller("MainCtrl",function($scope,$timeout,$interval,$http,$cookies,$window,appdata,TDMgr,CLogger,Backend,Autologin){

	// Injections

	Autologin.setScope($scope);
	Backend.setScope($scope);
	
	// Init
	$scope.log = CLogger.getLog();

	// Logout

	$scope.dologout = function(){
		$(".fkts").css("visibility","hidden");
		$(".todota").css("visibility","hidden");
		$(".todotab").css("visibility","hidden");
		$cookies.remove(appdata.cookiename);
		TDMgr.clearTodos();
		$window.location = "/#/working";
		$timeout(function(){
			$window.location = "/#/login";
		},1000);
		$timeout(function(){
			$("#liusername").focus();
		},1128);
		CLogger.log("Logged out.");
	}

	// Keyboard

	$scope.newtodoKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			if($scope.newtodotxt!=""){
				var newtodo = {};
				newtodo.topic=$scope.newtodotxt;
				newtodo.done=false;
				$scope.newtodotxt = "";
				Backend.postTodo(newtodo);
				TDMgr.addTodoObj(newtodo);
				$scope.todos = TDMgr.getTodos();
				$scope.filtertag = '';
				window.scrollTo(0,0);
				$("#todotxta").focus();
			}
		} else
		if(k==9){//tab
			e.preventDefault();
		}
	}

	$scope.todolineKeydown = function(e,id){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			CLogger.log("Change Todo (id:"+id+").");
			var currentTodo = $('#todoid'+id);
			currentTodo.blur();
			CLogger.log("Todo unfocused.");
			var obj = TDMgr.getTodoById(id);
			if(obj!=undefined){
				CLogger.log("Done.");
				CLogger.log("Updating data on server.");
				obj.topic = currentTodo.html();
				Backend.putTodo(obj);
				var oldtag = obj.tag;
				TDMgr.checkForHashtag(obj);
				if(oldtag!=undefined){
					var ttd = TDMgr.getTodosByTag(oldtag);
					if(ttd.length<=0){
						TDMgr.tags.splice(TDMgr.tags.indexOf(oldtag),1);
					}
				}
				$scope.todos = TDMgr.getTodosByTag($scope.filtertag);
				CLogger.log("Todo (id:"+id+") updated.");
			} else {
				CLogger.log("Error.");
			}
		}
	}

	// Todo functions

	$scope.seltodoline = function(id){
		$("#todoid"+id).focus();
		CLogger.log("Todo focused.");
	}

	$scope.deltodo = function(obj){ // No animation
		obj.deleted = true;
		Backend.delTodo(obj);
		TDMgr.delTodo(obj);
		$scope.todos = TDMgr.getTodosByTag($scope.filtertag);
		CLogger.log("ToDo deleted.");	
	}
	
	$scope.togDone = function(obj){
		TDMgr.togDone(obj);
		Backend.doneTodo(obj);
		$scope.todos=TDMgr.getTodosByTag($scope.filtertag);
		CLogger.log("Todo-Flag changed.");
	}

	// Tags
	
	$scope.getTodosByTag = TDMgr.getTodosByTag;

	// Finish
	
	$(".impressum").css("visibility","visible");
	$(".flash").css("visibility","visible");	
	CLogger.log("System ready.");

	Autologin.check(); // do automatic login if cookie/token is available
});
