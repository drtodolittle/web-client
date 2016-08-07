/*

	tdapp_controller_main.js

*/
var tdapp = require('./tdapp');

tdapp.controller("MainCtrl",function($scope,$timeout,$interval,$http,$cookies,$window,appdata,TDMgr,Backend,Autologin){

	// Injections

	Autologin.setScope($scope);
	Backend.setScope($scope);
	
	// General Done Filter
	
	$scope.showdone = false;
	$scope.showdonetext = "Show Done";	

	// Go to settings

	$scope.gosettings = function(){
		$window.location = "/#/settings";
	}
	
	// Show and hide custommenu (animated via jquery)
	
	$scope.tmpcustommenu = 0;
	$scope.showcustommenu = function(){
		if($scope.tmpcustommenu==0){
			$scope.tmpcustommenu=1;
			$("#customnavbaricon").attr("src","images/arrow-left-3x.png");
			if(navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {           
				$('body').scrollTop(0);
				$(".custommenu").animate({height:"140px"},500);				
			} else {
				if($('html').scrollTop()>64){
					$('html').animate({scrollTop:0},500,function(){
						$(".custommenu").animate({height:"140px"},500);
					});						
				} else {
					$('html').scrollTop(0);
					$(".custommenu").animate({height:"140px"},500);
				}
			}
		} else {
			$scope.tmpcustommenu=0;
			$("#customnavbaricon").attr("src","images/menu-3x.png");
			$(".custommenu").animate({height:"0px"},500);			
		}
	}	

	// Logout
	
	$scope.dologout = function(){
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
	}	
	
	// Keyboard

	$scope.newtodoKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			if($scope.newtodotxt!=""){
				var newtodo = {};
				newtodo.topic = $scope.newtodotxt;
				newtodo.done = false;
				$scope.newtodotxt = "";
				Backend.postTodo(newtodo);
				TDMgr.addTodoObj(newtodo);
				if($scope.showdone){
					$scope.showdone = false;
					$scope.showdonetext = "Show Done";
				}
				if(newtodo.tag!=undefined){
					$scope.filtertag = newtodo.tag;
				} else {
					$scope.filtertag = "All";
				}
				$scope.todos = TDMgr.getTodosByTag($scope.filtertag,$scope.showdone);
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
			var currentTodo = $('#todoid'+id);
			// Correct contenteditable behaviour
			currentTodo.html(currentTodo.html().replace('<br>',''));
			currentTodo.blur();
			var obj = TDMgr.getTodoById(id);
			if(obj!=undefined){
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
				$scope.todos = TDMgr.getTodosByTag($scope.filtertag,$scope.showdone);
			}
		}
	}

	// Todo functions

	$scope.seltodoline = function(id){
		$("#todoid"+id).focus();
	}

	$scope.deltodo = function(obj){ // No animation
		obj.deleted = true;
		Backend.delTodo(obj);
		TDMgr.delTodo(obj);
		$scope.todos = TDMgr.getTodosByTag($scope.filtertag,$scope.showdone);
	}
	
	$scope.togDone = function(obj){
		TDMgr.togPreDone(obj);
		$timeout(function(){
			TDMgr.togDone(obj); // Toggle todo local (within TDMgr)
			if(obj.done){ // Toggle Todo on the server
				Backend.doneTodo(obj);			
			} else {
				Backend.undoneTodo(obj);
			}
			$scope.todos = TDMgr.getTodosByTag($scope.filtertag,$scope.showdone);
		},1000);
	}

	// Filter function
	
	$scope.togShowdone = function(){
		$scope.showdone = !$scope.showdone;
		if($scope.showdone){
			$scope.showdonetext = "Show Open";
		} else {
			$scope.showdonetext = "Show Done";
		}
		$scope.todos=TDMgr.getTodosByTag($scope.filtertag,$scope.showdone);
	}
	
	// Tags
	
	$scope.getTodosByTag = TDMgr.getTodosByTag;

	// Finish
	
	Autologin.check(); // do automatic login if cookie/token is available
});
