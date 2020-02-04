import MaterialDesign from 'material-design-lite';
import { initFirebase, storeToDo, deleteToDo} from './api/firebase-service';
import { store } from './redux/store';
import { ADD_TODO, DELETE_TODO, COMPLETION_TODO, EDIT_TODO, LOAD_TODO, LOGIN, TOGGLE_SHOW_COMPLETED, ADD_FILTER, REMOVE_FILTER, ADD_TAG } from './redux/action';
import { initUI, showToDos, showToDo, removeToDo, setFocus, showFilterChips, addFilterMenu } from './ui/todo';
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
        showToDo(state.get('currenttodo'), state.get('filterSet'), state.get('showCompleted'));
        setFocus();
    }
    else if (actionType === DELETE_TODO || actionType === COMPLETION_TODO) {
        removeToDo(state.get('currenttodo').id);
    }
    else if (actionType === EDIT_TODO) {
        setFocus();
    }
    else if (actionType === TOGGLE_SHOW_COMPLETED) {
        showToDos(state.get('todoList'), state.get('filterSet'), state.get('showCompleted'));
    }
    else if (actionType === ADD_FILTER || actionType === REMOVE_FILTER) {
        showToDos(state.get('todoList'), state.get('filterSet'), state.get('showCompleted'));
        showFilterChips(state.get('filterSet'));
    }
    else if (actionType === ADD_TAG) {
        addFilterMenu(state.get("tags"));
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