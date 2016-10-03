tdapp.service('logininterceptor', function($q, $rootScope, $timeout, localStorageService) {
  return {
   'responseError': function(rejection) {
      if (rejection.status == 401) {
        if (localStorageService.get("logintoken") != undefined) {
          localStorageService.remove("logintoken")
        }
        $rootScope.open_dialog()
        $timeout(function(){
            $('#signin-email').focus()
        },512)
      }
      return $q.reject(rejection);
    }
  };
});
