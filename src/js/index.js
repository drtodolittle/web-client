import MaterialDesign from 'material-design-lite';
import {init} from './ui/todo';
import { store } from './redux/store';
import { ADD_TODO, DELETE_TODO, COMPLETION_TODO, EDIT_TODO } from './redux/action';
import { showToDo, removToDo, showCompletionState } from './ui/todo';

init();


let processFlowListener = () => {
    let state = store.getState();
    let actionType = state.get('actionType');
    if (actionType === ADD_TODO) {
      showToDo(state.get('currenttodo'));
    }
    else if  (actionType === DELETE_TODO) {
        removToDo(state.get('currenttodo'));
    }
    else if  (actionType === COMPLETION_TODO) {
        showCompletionState(state.get('currenttodo'));
    }

}
store.subscribe(processFlowListener);