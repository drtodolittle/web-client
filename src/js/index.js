import MaterialDesign from 'material-design-lite';
import { initFirebase, getUser,login, storeToDo, deleteToDo } from './api/firebase-service';
import { initUI } from './ui/todo';
import { store } from './redux/store';
import { ADD_TODO, DELETE_TODO, COMPLETION_TODO, EDIT_TODO, LOAD_TODO, LOGIN, TOGGLE_SHOW_COMPLETED } from './redux/action';
import { showToDo, removeToDo, setFocus, showCompleted, showInProgress } from './ui/todo';
import { showUserImage } from './ui/userimage';

initFirebase();
initUI();

let processFlowListener = () => {
    let state = store.getState();
    let actionType = state.get('actionType');
    if (actionType === LOGIN) {
        showUserImage();
    }
    if (actionType === ADD_TODO || actionType === LOAD_TODO) {
        showToDo(state.get('currenttodo'));
        setFocus();
    }
    else if (actionType === DELETE_TODO || actionType === COMPLETION_TODO) {
        removeToDo(state.get('currenttodo').id);
    }
    else if (actionType === EDIT_TODO) {
        setFocus();
    }
    else if (actionType === TOGGLE_SHOW_COMPLETED) {
        if (state.get('showCompleted')) {
            showCompleted(state.get('todoList'));
        }
        else {
            showInProgress(state.get('todoList'));
        }
    }
}
store.subscribe(processFlowListener);

let firebaseListener = () => {
    let state = store.getState();
    let actionType = state.get('actionType');
    if (actionType === ADD_TODO || actionType === COMPLETION_TODO || actionType === EDIT_TODO) {
        storeToDo(state.get('currenttodo'));
    }
    if (actionType === DELETE_TODO) {
        deleteToDo(state.get('currenttodo').id);
    }
}
store.subscribe(firebaseListener);