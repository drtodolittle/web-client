/*

	tdapp_controller_auth.js

*/
tdapp.controller("AuthCtrl",function($scope,$http,$auth,$cookies,$window,appdata,TDMgr,CLogger,Backend,Autologin){

	// Injection

	Autologin.setScope($scope);
	Backend.setScope($scope);
	
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

	// Login

	function locallogin(){ // No basic authentication (just communicate with localhost)
		$window.location = "/#/working";
		CLogger.log("Commit login.");
		appdata.server = appdata.localserver;
		$scope.errormsg = "";
		CLogger.log("Logged in.");
		var now = new Date();
		var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
		$cookies.put(appdata.cookiename,'bla',{expires:exp});
		Backend.getTodos();
		$scope.todos = TDMgr.getTodosByTag('All');
		$scope.filtertag = 'All';
		$(".fkts").css("visibility","visible");
	}
	
	$scope.dologin = function(){
		CLogger.log("Commit login.");
		if($window.location.host=="localhost"){
			locallogin();
			return;
		}
		$auth.login($scope.user)
			.then(function(response){
				$window.location = "/#/working";
				// Create cookie
				var now = new Date();
				var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
				$cookies.put(appdata.cookiename,response.data.token,{expires:exp});
				// Modifiy headers
				$http.defaults.headers.common['Authorization'] = "Basic " + response.data.token;
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
			});
	}

	// Keyboard
	
	$scope.loginKeydown = function(e){
		var k = e.keyCode;
		if(k==13){//ret
			e.preventDefault();
			$scope.dologin();
		}
	}
	
	// Register
	
	$scope.showRegister = function(){
		$window.location = "/#/register";
	};

	// Finish
	
	$(".flash").css("visibility","visible");	
	$("#liusername").focus()	
	Autologin.check(); // do automatic login if cookie/token is available
	
});
