import MaterialDesign from 'material-design-lite';
import { initFirebase, getUser,login, storeToDo, deleteToDo } from './api/firebase-service';
import { initUI } from './ui/todo';
import { store } from './redux/store';
import { ADD_TODO, DELETE_TODO, COMPLETION_TODO, EDIT_TODO, LOAD_TODO } from './redux/action';
import { showToDo, removeToDo, showCompletionState } from './ui/todo';

initFirebase();
initUI();


if (getUser() == null) {
    login();
}

let processFlowListener = () => {
    let state = store.getState();
    let actionType = state.get('actionType');
    if (actionType === ADD_TODO || actionType === LOAD_TODO) {
        showToDo(state.get('currenttodo'));
    }
    else if (actionType === DELETE_TODO) {
        removeToDo(state.get('currenttodo'));
    }
    else if (actionType === COMPLETION_TODO) {
        showCompletionState(state.get('currenttodo'));
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