/*

    Dr ToDo Little
    Change password controller

*/
tdapp.controller("chpwdCtrl", function(
    $rootScope,
    $scope,
    $http,
    localStorageService,
    $route,
    $location
) {

    // Change it...

    $scope.doChPwd = function() {
        if (
            $scope.oldPassword == undefined ||
            $scope.newPassword == undefined
        ) {
            showError('Enter valid data.')
            return
        }
        var user = firebase.auth().currentUser;
        firebase.auth().signInWithEmailAndPassword(
            user.email,
            $scope.oldPassword
        ).then(
            function(fbuser) {
                fbuser.updatePassword(
                    $scope.newPassword
                ).then(
                    function() {
                        showSuccess('Password change done!')
                    }
                ).catch(function(error) {
                    showError(error.message)
                })
            }
        ).catch(function(error) {
            showError(error.message)
        });
    }

    $('#oldpassword').focus()

})
