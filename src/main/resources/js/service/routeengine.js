/*

	routeengine.js

*/
tdapp.service('routeengine',function($location, $route){
  var path = $location.path();

  return {
    // optional method
    'request': function(config) {
      // do something on success
      return config;
    },

    // optional method
   'requestError': function(rejection) {
      // do something on error
      if (canRecover(rejection)) {
        return responseOrNewPromise
      }
      return $q.reject(rejection);
    }

  };
});  
