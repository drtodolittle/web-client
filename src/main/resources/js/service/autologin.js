/*

	tdapp_service_autologin.js

*/
tdapp.service('autologinservice',
function(
	$http,
	$location,
	$cookies,
	$timeout,
	$compile,
	$routeParams,
	appdata,todoservice,backend
){

	// Injection

	var _scope;
	this.setScope = function(scope){
		_scope = scope;
	}

	//  Get todos

	this.getAllTodos = function(){
		_scope.filtertag = 'All'; // Set filtertag before calling Backend.getTodos()
		backend.getTodos(
			function(){
				_scope.tags = (todoservice.getTags()).sort();
				_scope.todos = todoservice.getTodosByTag(_scope.filtertag,_scope.showdone)
				if(
					$routeParams.type!=undefined &&
					$routeParams.id!=undefined &&
					$routeParams.type=="todo"
				){
					var todo = todoservice.getTodoById($routeParams.id)
					if(todo!=undefined){
						var todos = [];
						todos.push(todo);
						_scope.todos = todos;
					} else {
						_scope.todos = [];
					}
				}
				if(
					$routeParams.type!=undefined &&
					$routeParams.id!=undefined &&
					$routeParams.type=="tag"
				){
					_scope.todos = todoservice.getTodosByTag("#"+$routeParams.id,false);
				}
				if(
					$routeParams.type==undefined &&
					$routeParams.id==undefined &&
					$routeParams.type==undefined
				){
					$location.path("/");
				}
				if(typeof window.orientation == 'undefined'){ // Workaround for mobile devices
					$("#todotxta").blur().focus();
				}
			}
		)
	}

	// Logout (with undef appdata)

	this.doLogout = function(){
		$cookies.remove(appdata.cookiename);
		todoservice.clearTodos();
		appdata.user = undefined;
		appdata.lip = undefined;
		appdata.token = undefined;
		appdata.rememberme = undefined;
		$location.path("/login");
		firebase.auth().signOut()
		.catch(function(err){
			console.log("Error: " + err.message);
		})
		$timeout(function(){
			$("#liuser").focus();
		},128);
	}

	// Check (autologin if possible)

	this.check = function(){
//		if($window.location.hostname=="localhost"){
//			appdata.server = appdata.localserver;
//		}
		if(
			appdata.user == undefined &&
			appdata.token == undefined &&
			appdata.lip == undefined
		){
			var drcookie = $cookies.get(appdata.cookiename);
			if(drcookie!=undefined){
				_scope.errormsg = "";
				var dr = JSON.parse(drcookie);
				appdata.token = dr.token;
				appdata.user = dr.user;
				appdata.lip = dr.lip;
				$http.defaults.headers.common['Authorization'] = "Bearer " + appdata.token;
				this.getAllTodos();
			} else {
				$location.path("/login");
			}
		} else {
			$http.defaults.headers.common['Authorization'] = "Bearer " + appdata.token;
			this.getAllTodos();
		}
	}

});
