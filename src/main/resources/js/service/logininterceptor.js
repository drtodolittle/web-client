tdapp.service('logininterceptor', function($q, $location, $scope) {
  return {
   'responseError': function(rejection) {
      if (rejection.status == 401) {
        $scope.open_dialog();
      }
      return $q.reject(rejection);
    }
  };
});
