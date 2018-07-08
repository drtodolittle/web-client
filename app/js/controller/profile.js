/*

	Dr ToDo Little
    Profile controller

*/
tdapp.controller("profileCtrl",function(
    $rootScope,
    $scope,
    $http,
    localStorageService,
    $route,
    $location,
    todoservice
){

    $scope.numOfTodos = "n/a";
    var user = firebase.auth().currentUser;
    if(user){
        todoservice.getTodos().then(function(todos) {
            $scope.numOfTodos = todos.length;
        }).catch(function(err){
            // TODO: Presetn error message to user.
        });
        if(user.providerData.length>0){
            $scope.user = user.providerData[0].email;
            var photoURL = user.providerData[0].photoURL;
            if( photoURL != null){
                $scope.userphotourl = user.providerData[0].photoURL;
            } else {
                $("#profileuserphoto").remove();
            }
        } else {
            $scope.user = "n/a";
            $scope.userphotourl = "null";
        }
    } else {
        $scope.user = "n/a";
        $scope.userphotourl = "null";
        $scope.numOfTodos = "n/a";
    }

    // TODO: Present error message (if occured) to user.

})
