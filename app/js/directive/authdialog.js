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
                    showError('Password reset error: ' + error.message)
                });
            }

            // Register

            $scope.register = function() {
                if ($scope.email == undefined || $scope.password == undefined) {
                    showError('Registration-Error: Enter valid data.')
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
                                        welcometodo.topic = "Welcome to Dr ToDo Little! You can use hashtags to filter tasks e.g. #new";
                                        welcometodo.done = false;
                                        todoservice.create(welcometodo);
                                        $scope.filtertag = "All";
                                        // Registration information
                                        var msg = ""
                                        msg += "Registration successful! \n";
                                        msg += "A verification email is waiting for you. \n";
                                        msg += "But you can go on using Dr ToDo Little now \n";
                                        msg += "for 24 hours without verification.";
                                        alert(msg);
                                        // Go...
                                        $scope.close_dialog()
                                        $location.path("/")
                                        $route.reload();
                                    })
                                    .catch(function(error) {
                                        showError('Registration-Error: ' + error.message)
                                    })
                            })
                            .catch(function(error) {
                                showError('Registration-Error: ' + error.message)
                            })
                    }).catch(function(error) {
                        showError('Registration-Error: ' + error.message)
                    });
            }

            // Login

            $scope.login = function() {
                var auth = $firebaseAuth();
                var user = $scope.email;
                var password = $scope.password;
                if (user == undefined || password == undefined) {
                    showError('Login-Error: Enter valid data.')
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
                                $scope.filtertag = "All";
                                $scope.errormsg = "";
                                $route.reload();
                            })
                            .catch(function(error) {
                                showError(error.message)
                            });
                    })
                    .catch(function(error) {
                        showError(error.message)
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
                            $scope.filtertag = "All";
                            $scope.errormsg = "";
                            $route.reload();
                        }).catch(function(error) {
                            showError('Google-Login-Error: ' + error.message)
                        });
                    } else {
                        showError('Google-Login-Error: ' + error.message)
                    }
                }).catch(function(error) {
                    showError('Google-Login-Error: ' + error.message)
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
                hideError()
            };

            $scope.select_register = function() {
                $scope.loginselected = false;
                $scope.registerselected = true;
                $scope.resetselected = false;
                hideError()
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
                hideError()
            };

            var showError = function(msg) {
                var ee = $('#errtemplate').clone()
		        ee.children('#errmsg').html(msg)
                ee.css('visibility','visible')
		        $('#custonloginerror').append(ee)
                $('#custonloginerror').css('visibility','visible')
                $('#custonloginerror').css('opacity','1')
                /*
                $('.cd-error-message').html(msg)
                $('.cd-error-message').css('visibility', 'visible')
                $('.cd-error-message').css('opacity', '1')
                $('.cd-error-message').css('font-size', '12px')
                */
            }

            var hideError = function() {
                $('#custonloginerror').html('')
                /*
                $('.cd-error-message').html('')
                $('.cd-error-message').css('visibility', 'hidden')
                $('.cd-error-message').css('opacity', '0')
                */
            }

            $scope.rememberme = true;

        }
    }
})
