import {
    createAddToDoAction,
    createDeleteToDoAction,
    createEditToDoAction,
    createSetCompletionStateToDoAction,
    createUncompleteToDoAction,
    createLoadToDoAction,
    createLoginAction,
    createToggleShowCompletedAction,
    createAddFilterAction,
    createRemoveFilterAction,
    createAddTagAction, createMoveTodoAction
} from '../redux/action';
import { store } from '../redux/store';

export function addToDo(model) {
    let addAction = createAddToDoAction(model);
    store.dispatch(addAction);
    addTags(model.todo);
}

export function deleteToDo(id) {
    let deleteAction = createDeleteToDoAction(id);
    store.dispatch(deleteAction);
}

export function editToDo(model) {
    let editAction = createEditToDoAction(model);
    store.dispatch(editAction);
    addTags(model.todo);
}

export function setCompletionState(id, completionState) {
    let model = getToDo(id);
    model.completed = completionState;
    let completeAction = createSetCompletionStateToDoAction(model);
    store.dispatch(completeAction);
}

export function uncompleteToDo(model) {
    let uncompleteAction = createUncompleteToDoAction(model);
    store.dispatch(uncompleteAction);
}

export function getToDo(id) {
    let todoList = store.getState().get('todoList');
    let index = todoList.findKey(model => model.id == id);
    return todoList.get(index);
}

export function loadToDo(model) {
    let loadToDoAction = createLoadToDoAction(model);
    store.dispatch(loadToDoAction);
}

export function setUserImage() {
    store.dispatch(createLoginAction());
}

export function addFilter(filterName) {
    store.dispatch(createAddFilterAction(filterName));
}

export function removeFilter(filterName) {
    store.dispatch(createRemoveFilterAction(filterName));
}

function addTags(todo) {
    let matches = todo.match(/#\w+/i);
    if (matches) {
        matches.forEach((token) => {
            store.dispatch(createAddTagAction(token));
        });
    }
}


export function addFilters(tags) {
    tags.forEach((tag) => {
        store.dispatch(createAddTagAction(tag));
    });
}

export function toggleShowCompleted(isCompleted) {
    store.dispatch(createToggleShowCompletedAction(isCompleted));
}

export function moveToDo(srcId, destId) {
    let todoList = store.getState().get('todoList');
    var srcIndex = todoList.findIndex(model => model.id == srcId);
    var srcModel = todoList.get(srcIndex);
    
    var destIndex = todoList.findIndex(model => model.id == destId);
    var destModel1 = todoList.get(destIndex);
    if (destIndex + 1 == todoList.size) {
        srcModel.priority = destModel1.priority + 10000
    }
    else {
        var destModel2 = todoList.get(destIndex + 1);
        srcModel.priority = (destModel2.priority + destModel1.priority) / 2
    }
    store.dispatch(createMoveTodoAction(srcModel));
}