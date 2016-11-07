tdapp.directive('authdialog', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/dialog.html',
        controller: function($scope, $firebaseAuth, $http, $location, $route, localStorageService, todoservice, $timeout) {

            // Auth

            var auth = $firebaseAuth();

            // Reset password

            $scope.resetpwd = function() {
                auth.$sendPasswordResetEmail($scope.email).then(function() {
                    alert("An email is waiting for you to reset your password.");
                    $scope.select_login();
                }, function(error) {
                    _showError(error.message)
                });
            }

            // Register

            $scope.register = function() {
                if ($scope.email == undefined || $scope.password == undefined) {
                    _showError('Enter valid data.')
                    return;
                }
                var email = $scope.email;
                var password = $scope.password;
                var auth = firebase.auth()
                auth.createUserWithEmailAndPassword(email, password)
                    .then(function(data) {
                        var user = auth.currentUser;
                        user.sendEmailVerification()
                            .then(function() {
                                // Prepare for work
                                user.getToken().then(function(res) {
                                        $http.defaults.headers.common['Authorization'] = "Bearer " + res;
                                        // Create Welcome-Todo
                                        var welcometodo = {};
                                        welcometodo.topic = "Welcome to Dr ToDo Little! You can use hashtags to filter your todos (e.g. #new).";
                                        welcometodo.done = false;
                                        todoservice.create(welcometodo);
                                        // Registration information
                                        var msg = ""
                                        msg += "Registration successful! \n";
                                        msg += "A verification email is waiting for you. \n";
                                        msg += "But you can go on using Dr ToDo Little now \n";
                                        msg += "for 24 hours without verification.";
                                        alert(msg);
                                        // Go...
                                        $scope.close_dialog()
                                        $location.path("/todos/open/all")
                                        $route.reload();
                                    })
                                    .catch(function(error) {
                                        _showError(error.message)
                                    })
                            })
                            .catch(function(error) {
                                _showError(error.message)
                            })
                    }).catch(function(error) {
                        _showError(error.message)
                    });
            }

            // Login

            $scope.login = function() {
                var auth = $firebaseAuth();
                var user = $scope.email;
                var password = $scope.password;
                if (user == undefined || password == undefined) {
                    _showError('Enter valid data.')
                    return
                }

                auth.$signInWithEmailAndPassword(user, password)
                    .then(function(response) {
                        response.getToken().then(function(response) {
                                $scope.close_dialog();
                                $http.defaults.headers.common['Authorization'] = "Bearer " + response;
                                if ($scope.rememberme) {
                                    localStorageService.set("logintoken", response);
                                }
                                $location.path('todos/open/all')
                                $route.reload();
                            })
                            .catch(function(error) {
                                _showError(error.message)
                            });
                    })
                    .catch(function(error) {
                        _showError(error.message)
                    });
            };

            $scope.loginWithGoogle = function() {
                var provider = new firebase.auth.GoogleAuthProvider();
                firebase.auth().signInWithPopup(provider).then(function(res) {
                    var user = firebase.auth().currentUser;
                    if (user) {
                        user.getToken().then(function(res) {
                            $scope.close_dialog();
                            $http.defaults.headers.common['Authorization'] = "Bearer " + res;
                            if ($scope.rememberme) {
                                localStorageService.set("logintoken", res);
                            }
                            $location.path('todos/open/all')
                            $route.reload();
                        }).catch(function(error) {
                            _showError(error.message)
                        });
                    } else {
                        _showError(error.message)
                    }
                }).catch(function(error) {
                    _showError(error.message)
                });
            }

            // Helper

            $scope.open_dialog = function() {
                $scope.cdusermodal = true;
                $scope.select_login();
            };

            $scope.select_login = function() {
                $scope.loginselected = true;
                $scope.registerselected = false;
                $scope.resetselected = false;
                _hideError()
            };

            $scope.select_register = function() {
                $scope.loginselected = false;
                $scope.registerselected = true;
                $scope.resetselected = false;
                _hideError()
            };

            $scope.select_reset = function() {
                $scope.loginselected = false;
                $scope.registerselected = false;
                $scope.resetselected = true;
            };

            $scope.close_dialog = function() {
                $scope.cdusermodal = false;
                $scope.loginselected = false;
                $scope.registerselected = false;
                $scope.resetselected = false;
                _hideError()
            };

            var _showError = function(msg) {
                var ee = $('#errtemplate').clone()
		        ee.children('#errmsg').html(msg)
                ee.css('visibility','visible')
		        $('.customerror').append(ee)
                $('.customerror').css('visibility','visible')
                $('.customerror').css('opacity','1')
            }

            var _hideError = function() {
                $('.customerror').html('')
                $('.customerror').css('visibility','hidden')
                $('.customerror').css('opacity','0')
            }

            $scope.rememberme = true;

        }
    }
})
