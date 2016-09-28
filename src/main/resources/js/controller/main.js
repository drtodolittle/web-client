/*

	tdapp_controller_main.js

*/
tdapp.controller("MainCtrl",
function(
	$scope,
	$timeout,
	$location,
	todoservice)
{

	// General Done Filter
	$scope.showdone = false;
	$scope.showdonetext = "Show Done";

	// Go to settings
	$scope.goSettings = function(){
		$location.path("/settings");
	}

	// Show and hide custommenu (animated via jquery)

	$scope.tmpcustommenu = 0;
	$scope.showcustommenu = function(){
		if($scope.tmpcustommenu==0){
			$scope.tmpcustommenu=1;
			$("#customnavbaricon").attr("src","images/arrow-left-3x.png");
			if(navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {
				$('body').scrollTop(0);
				$(".custommenu").animate({height:"126px"},500);
			} else {
				if($('html').scrollTop()>64){
					$('html').animate({scrollTop:0},500,function(){
						$(".custommenu").animate({height:"126px"},500);
					});
				} else {
					$('html').scrollTop(0);
					$(".custommenu").animate({height:"126px"},500);
				}
			}
		} else {
			$scope.tmpcustommenu=0;
			$("#customnavbaricon").attr("src","images/menu-3x.png");
			$(".custommenu").animate({height:"0px"},500);
			$("#todotxta").focus();
		}
	}

	// Logout
	$scope.doLogout = function(){
		$location.path("/working");
		$timeout(function(){
			autologinservice.doLogout();
		},1000);
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
				todoservice.create(newtodo);
				if($scope.showdone){
					$scope.showdone = false;
					$scope.showdonetext = "Show Done";
				}
				if(newtodo.tag!=undefined){
					$scope.filtertag = newtodo.tag;
				} else {
					$scope.filtertag = "All";
				}
				$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
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
			var obj = todoservice.getTodoById(id);
			if(obj!=undefined){
				obj.topic = currentTodo.html();
				todoservice.update(obj);
				var oldtag = obj.tag;
				todoservice.checkForHashtag(obj);
				if(oldtag!=undefined){
					var ttd = todoservice.getTodosByTag(oldtag);
					if(ttd.length<=0){
						todoservice.tags.splice(todoservice.tags.indexOf(oldtag),1);
					}
				}
				$scope.tags = (todoservice.getTags()).sort();
				$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
			}
		}
	}

	$scope.displaytodos = function(tag) {
		$scope.filtertag = tag;
		$scope.todos = todoservice.getTodosByTag(tag,$scope.showdone);
	}

	// Todo functions
	$scope.seltodoline = function(id){
		$("#todoid"+id).focus();
	}

	$scope.deltodo = function(obj){ // No animation
		obj.deleted = true;
		todoservice.delTodo(obj);
		$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
	}

	$scope.togDone = function(obj){
		todoservice.togPreDone(obj);
		$timeout(function(){
			todoservice.togDone(obj); // Toggle todo local (within todoservice)
			$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
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
		$scope.todos=todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
	}

	// Tags

	$scope.getTodosByTag = todoservice.getTodosByTag;
	todoservice.getTodos().then(function(todos) {
		$scope.todos = todoservice.getTodosByTag($scope.filtertag,$scope.showdone);
		$scope.tags = todoservice.getTags();
	});

	// Finish
	$("#todotxta").focus();

});
