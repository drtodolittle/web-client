import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { loadToDo } from './service';


export function initFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyBVplEHYWv2_LbtgNOrHn4NB4eL9a1hFFo",
        authDomain: "drtodolittle-webclient.firebaseapp.com",
        databaseURL: "https://drtodolittle-webclient.firebaseio.com",
        projectId: "drtodolittle-webclient",
        storageBucket: "drtodolittle-webclient.appspot.com",
        messagingSenderId: "673389576608",
        appId: "1:673389576608:web:758fe7b98c361f23a764c5"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
}

export function login() {
    // Using a redirect.
    firebase.auth().getRedirectResult().then(function (result) {
        if (result.credential) {
            // This gives you a Google Access Token.
            var token = result.credential.accessToken;
        }
        var user = result.user;
        if (user) {
            loadToDos();
        }
        else {
            // Start a sign in process for an unauthenticated user.
            var provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            firebase.auth().signInWithRedirect(provider);
        }
    }, function (error) {
        console.log("Error in RedirectResult");
    });


}

export function loadToDos() {
    let firestore = firebase.firestore();
    let user = getUser();
    console.log("Current user is " + user.email);

    let userDocRef = firestore.collection("users").doc(user.email);
    let todosRef = userDocRef.collection("/todos").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            loadToDo(doc.data());
        })
    });


}

export function getUser() {
    return firebase.auth().currentUser;
}

export function storeToDo(model) {
    let firestore = firebase.firestore();
    let user = getUser();
    console.log("Current user is " + user.email);

    let userDocRef = firestore.collection("users").doc(user.email);
    userDocRef.collection("/todos").doc(model.id).set(model)
        .then(function () {
            console.log("Document successfully written!");
        })
        .catch(function (error) {
            console.error("Error writing document: ", error);
        });
}

export function deleteToDo(id) {
    let firestore = firebase.firestore();
    let user = getUser();
    console.log("Current user is " + user.email);

    let userDocRef = firestore.collection("users").doc(user.email);
    userDocRef.collection("/todos").doc(id).delete()
        .then(function () {
            console.log("Document successfully deleted!");
        })
        .catch(function (error) {
            console.error("Error deleting document: ", error);
        });

}