tdapp.service('logininterceptor', function($q, $rootScope, localStorageService) {
  return {
   'responseError': function(rejection) {
      if (rejection.status == 401) {
        if (localStorageService.get("logintoken") != undefined) {
          localStorageService.remove("logintoken");
        }
        $rootScope.open_dialog();
      }
      return $q.reject(rejection);
    }
  };
});
