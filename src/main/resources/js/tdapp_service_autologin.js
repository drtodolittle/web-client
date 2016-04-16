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
		var token = $cookies.get(appdata.cookiename);
		if (token!=undefined){
			$location = "/#/working";
			_scope.errormsg = "";
			$http.defaults.headers.common['Authorization'] = "Basic " + token;
			if($window.location.hostname=="localhost"){
				appdata.server = appdata.localserver;
			}			
			_scope.filtertag = 'All'; // set filtertag before calling Backend.getTodos()
			Backend.getTodos();
			$location = "/#/main";
		} else {
			if($location.$$url=="/main") $window.location = "/#/login";
		}	
	}
});