/*

	tdapp_service_autologin.js

*/
var tdapp = require('./tdapp');

tdapp.service('Autologin',function($http,$window,$location,$cookies,appdata,TDMgr,Backend){
	var _scope;
	this.setScope = function(scope){
		_scope = scope;
	}
	this.check = function(){
		var token = $cookies.get(appdata.tokencookie);
		var user = $cookies.get(appdata.usercookie);
		var lip = $cookies.get(appdata.lipcookie);
		if (token!=undefined && user!=undefined && lip!=undefined){
			$location = "/#/working";
			_scope.errormsg = "";
			$http.defaults.headers.common['Authorization'] = "Basic " + token;
			if($window.location.hostname=="localhost"){
				appdata.server = appdata.localserver;
			}
			_scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
			if(TDMgr.getTodos().length==0){
				Backend.getTodos();
			} else {
				_scope.tags = TDMgr.getTags();
				_scope.todos = TDMgr.getTodosByTag(_scope.filtertag);			
			}
			appdata.currentuser = user;
			if(lip=="fbcore"){
				appdata.fblogin = true;
			}
		} else {
			$window.location = "/#/login";
		}
	}	
});