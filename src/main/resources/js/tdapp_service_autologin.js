/*

	tdapp_service_autologin.js

*/
var tdapp = require('./tdapp');

tdapp.service('Autologin',function($http,$window,$location,$cookies,$timeout,appdata,TDMgr,Backend){
	var _scope;
	this.setScope = function(scope){
		_scope = scope;
	}
	this.getAllTodos = function(){
		_scope.filtertag = 'All'; // Set filtertag before calling Backend.getTodos()
		if(TDMgr.getTodos().length==0){
			Backend.getTodos();
		} else {
			_scope.tags = TDMgr.getTags();
			_scope.todos = TDMgr.getTodosByTag(_scope.filtertag);
		}
	}
	this.doLogout = function(){
		$cookies.remove(appdata.derdrcookie);
		TDMgr.clearTodos();
		appdata.user = undefined;
		appdata.lip = undefined;
		appdata.token = undefined;
		appdata.rememberme = undefined;
		$window.location = "/#/login";
		$timeout(function(){
			$("#liusername").focus();
		},128);
	}
	this.check = function(){
		if(
			appdata.user == undefined &&
			appdata.token == undefined &&
			appdata.lip == undefined
		){
			var dr = $cookies.get(appdata.derdrcookie);
			if(dr!=undefined){
				// $window.location = "/#/working";
				_scope.errormsg = "";
				var _dr = JSON.parse(dr);
				appdata.token = _dr.token;
				appdata.user = _dr.user;
				appdata.lip = _dr.lip;
				if($window.location.hostname=="localhost"){
					appdata.server = appdata.localserver;
				}
				$http.defaults.headers.common['Authorization'] = "Basic " + appdata.token;
				this.getAllTodos();
			} else {
				$window.location = "/#/login";
			}
		} else {
			if($window.location.hostname=="localhost"){
				appdata.server = appdata.localserver;
			}
			$http.defaults.headers.common['Authorization'] = "Basic " + appdata.token;
			this.getAllTodos();
		}
	}
});
