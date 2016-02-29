/*

	tdapp_controller.js

*/
tdapp.controller("MainCtrl",function($scope,$timeout,$interval,$http,$auth,$cookies,$window,$location,appdata,TDMgr,CLogger,Backend){

	// Init
	
	$scope.todos = TDMgr.getTodosByTag('All');
	$scope.tags = TDMgr.getTags();
	$scope.log = CLogger.getLog();

	// Communication with server

	Backend.setScope($scope);
	function doModifyHeader(token){
		$http.defaults.headers.common['Authorization'] = "Basic " + token;
	}
	
	// Satellizer

	$scope.authenticate = function(provider){
		$auth.authenticate(provider)
		.then(function(res){
			if($auth.isAuthenticated){
				var dtok = jwt_decode(res.data.token);
				$scope.user = {};
				$scope.user.id = dtok.sub;
			}
		});
	};

	// Keyboard

	$scope.mainKeydown = function(e){
		var k = e.keyCode;
		if(k==27){//esc
			e.preventDefault();
			CLogger.log("Commit logout.");
			$scope.dologout();
		}
	}

	$scope.newtodoKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			if($scope.newtodotxt!=""){
				var newtodo = {};
				newtodo.topic=$scope.newtodotxt;
				newtodo.done=false;
				$scope.newtodotxt = "";
				console.log(newtodo);
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
				$scope.todos = TDMgr.getTodos();
				$scope.filtertag = '';
				CLogger.log("Todo (id:"+id+") updated.");
			} else {
				CLogger.log("Error.");
			}
		}
	}

	$scope.loginKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			$scope.dologin();
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
	
	// Login & Logout

	function logout(){
		$(".container").css("visibility","hidden");
		$(".fkts").css("visibility","hidden");
		$(".todota").css("visibility","hidden");
		$(".todotab").css("visibility","hidden");
		$cookies.remove(appdata.cookiename);
		TDMgr.clearTodos();
		$window.location = "/#/working";
		$timeout(function(){
			$window.location = "/";
		},1000);
		$timeout(function(){
			$("#liusername").focus();
		},1128);
		CLogger.log("Logged out.");
	}
	$scope.dologout = logout;

	function login(){
		CLogger.log("Commit login.");
		$auth.login($scope.user)
			.then(function(response){
				$location = "/#/working";
				var now = new Date();
				var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
				$cookies.put(appdata.cookiename,response.data.token,{expires:exp});
				doModifyHeader(response.data.token);
				CLogger.log("Logged in.");
				$scope.errormsg = "";
				Backend.getTodos();
				$scope.todos = TDMgr.getTodosByTag('All');
				$scope.filtertag = 'All';
				$(".fkts").css("visibility","visible");
			})
			.catch(function(error){
				$scope.errormsg = "Login-Error.";
				console.log(error);
				//$scope.dologout();
			});
	}

	function locallogin(){ // No basic authentication (for communication with localhost)
		$window.location = "/#/working";
		CLogger.log("Commit login.");
		appdata.server = appdata.localserver;
		$scope.errormsg = "";
		CLogger.log("Logged in.");
		Backend.getTodos();
		$scope.todos = TDMgr.getTodosByTag('All');
		$scope.filtertag = 'All';
		$(".fkts").css("visibility","visible");
	}
	
	$scope.dologin = login; // Change to "locallogin" for working against localhost

	// Register
	
	function showRegister(){
		CLogger.log("Show register.");
		$location = "/#/working";
		$scope.errormsg = "";
		setTimeout(function(){
			$location = "/#/register";
		},1000);
	}
	
	function register() {
		CLogger.log("Commit register.");
		$http({
			method:"post",
			url: userservice,
			header: "application/json",
			data: $scope.user
		}).then(
			function successCallback(res) {
				CLogger.log("Done.");
				$scope.errormsg = "Registration email sent. Please activate your account.";
				$location = "/";
			}
			,
			function errorCallback(res){
				CLogger.log("Error! Check console for details.");
				console.log(JSON.stringify(res));			
			}
		);
	}
	$scope.doRegister = register;
	$scope.showRegister = showRegister;

	// Tags
	$scope.getTodosByTag = TDMgr.getTodosByTag;

	// Finish
	$(".impressum").css("visibility","visible");
	$(".flash").css("visibility","visible");
	$("#liusername").focus()
	
	CLogger.log("System ready.");
		
	// Do login if cookie/token is available
	var token = $cookies.get(appdata.cookiename);
	if (token!=undefined){
		$location = "/#/working";
		doModifyHeader(token);
		CLogger.log("Automatic login.");
		$scope.errormsg = "";
		Backend.getTodos();
		$scope.todos = TDMgr.getTodosByTag('All');
		$scope.filtertag = 'All';
		$location = "/#/main";
	}

});
