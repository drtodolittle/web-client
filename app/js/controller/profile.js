/*

	Dr ToDo Little
    Profile controller

*/
tdapp.controller("profileCtrl",function($rootScope,$scope,$http,localStorageService,$route,$location){

    var user = firebase.auth().currentUser
    if(user){
        $scope.user = user.email
    } else {
        $scope.user = "n/a"
    }

    // TODO: Present error message to user.

});
