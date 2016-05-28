/*

	tdapp_controller_auth.js

*/
var tdapp = require('./tdapp');

tdapp.controller("AuthCtrl",function($scope,$http,$auth,$cookies,$window,$timeout,appdata,TDMgr,Backend,Autologin){

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

	function gomain(){
		$timeout(function(){
			$window.location = "/#/main";
		},1000);
	}
	
	function locallogin(){ // No basic authentication (just communicate with localhost)
		$window.location = "/#/working";
		appdata.server = appdata.localserver;
		var now = new Date();
		var exp = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
		$cookies.put(appdata.cookiename,'bla',{expires:exp});
		$scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
		//Backend.getTodos();
		$(".fkts").css("visibility","visible");
		$scope.errormsg = "";
		gomain();
	}
	
	$scope.dologin = function(){
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
				$scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
				//Backend.getTodos();
				$(".fkts").css("visibility","visible");
				$scope.errormsg = "";
				gomain();
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
