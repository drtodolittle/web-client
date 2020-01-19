import {
    createAddToDoAction,
    createDeleteToDoAction,
    createEditToDoAction,
    createCompleteToDoAction,
    createUncompleteToDoAction
} from '../redux/action';
import { store } from '../redux/store';

export function addToDo(model) {
    let addAction = createAddToDoAction(model);
    store.dispatch(addAction);
}

export function deleteToDo(id) {
    let deleteAction = createDeleteToDoAction(id);
    store.dispatch(deleteAction);
}

export function editToDo(model) {
    let editAction = createEditToDoAction(model);
    store.dispatch(editAction);
}

export function completeToDo(model) {
    let completeAction = createCompleteToDoAction(model);
    store.dispatch(completeAction);
}

export function UncompleteToDo(model) {
    let uncompleteAction = createUncompleteToDoAction(model);
    store.dispatch(uncompleteAction);
}

export function getToDo(id) {
    let todoList = store.getState().get('todoList');
    let index = todoList.findKey(model => model.id == id);
    return todoList.get(index);
}

