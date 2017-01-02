tdapp.service('logininterceptor', function($q, $injector, $firebaseAuth, $location, $rootScope, $timeout, localStorageService) {
    /* Some testings...
    return {
        'responseError': function(rejection) {
            if (rejection.status == 401) {
                // console.log('401...')
                if (localStorageService.get("logintoken") != undefined) {
                    // console.log('found token...')
                    var auth = $firebaseAuth().$getAuth();
                    if (auth != null) {
                        // console.log('refresh token...')
                        auth.getToken(true)
                            .then(function(token) {
                                // console.log('refresh done, set new authorizarion header...')
                                var $http = $injector.get('$http');
                                $http.defaults.headers.common['Authorization'] = "Bearer " + token
                                    // console.log('redirect...')
                                $timeout(function() {
                                    if ($location.path() == "/") {
                                        // console.log('to... /todos/open/all')
                                        $location.path("/todos/open/all")
                                    } else {
                                        // console.log('to... /')
                                        $location.path("/")
                                    }
                                }, 512)
                            })
                            .catch(function() {
                                // console.log('refresh error, open login dialog')
                                $rootScope.open_dialog()
                                $timeout(function() {
                                    $('#signin-email').focus()
                                }, 512)
                                return $q.reject(rejection);
                            })
                    }
                } else {
                    // console.log('no token, open login dialog')
                    $rootScope.open_dialog()
                    $timeout(function() {
                        $('#signin-email').focus()
                    }, 512)
                    return $q.reject(rejection);
                }
            }
        }
    }
    */

    return {
        'responseError': function(rejection) {
            if (rejection.status == 401) {
                $('#todoarea').css('visibility',"hidden")
                if (localStorageService.get("logintoken") != undefined) {
                    localStorageService.remove("logintoken")
                }
                $rootScope.open_dialog()
                $timeout(function() {
                    $('#signin-email').focus()
                }, 512)
            }
            return $q.reject(rejection);
        }
    };

})
