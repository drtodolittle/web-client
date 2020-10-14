import {
    ADD_TODO,
    EDIT_TODO,
    DELETE_TODO,
    COMPLETION_TODO,
    LOAD_TODO,
    LOGIN,
    TOGGLE_SHOW_COMPLETED,
    ADD_FILTER,
    REMOVE_FILTER,
    ADD_TAG,
    MOVE_TODO
} from "./action";

import { Map, List, Set } from 'immutable';


export const initialState = Map({
    status: "uninitialized",
    todoList: List(),
    actionType: '',
    currenttodo: '',
    showCompleted: false,
    filterSet: Set(),
    tags: Set()
});

function ToDoApp(state = initialState, action) {
    let newState = state;
    let todoList = state.get('todoList');

    switch (action.type) {
        case LOAD_TODO:
        case ADD_TODO:
            newState = state.update('todoList', (list) => list.push(action.model));
            newState = newState.set('currenttodo', action.model);
            break;
        case EDIT_TODO:
        case COMPLETION_TODO:
        case MOVE_TODO:
            var index = todoList.findKey(model => model.id == action.model.id);
            var newList = todoList.set(index, action.model).sortBy(model => model.priority);;
            newState = state.set('todoList', newList);
            newState = newState.set('currenttodo', action.model);
            break;
        case DELETE_TODO:
            var index = todoList.findKey(model => model.id == action.id);
            var model = todoList.get(index);
            var newList = todoList.remove(index);
            newState = state.set('todoList', newList);
            newState = newState.set('currenttodo', model);
            break;
        case LOGIN: 
            newState = state.set('loggedin', true);
            break;
        case TOGGLE_SHOW_COMPLETED:
            newState = state.set('showCompleted', action.showCompleted);
            break;
        case ADD_FILTER:
            newState = state.update('filterSet', (set) => set.add(action.filterName));
            break;
        case REMOVE_FILTER:
            newState = state.update('filterSet', (set) => set.remove(action.filterName));
            break;
        case ADD_TAG:
            newState = state.update('tags', (set) => set.add(action.tagName));
            break;
        default:
            break;
    }

    return newState.set('actionType', action.type);
}

export { ToDoApp };