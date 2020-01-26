import {
    ADD_TODO,
    EDIT_TODO,
    DELETE_TODO,
    COMPLETION_TODO,
    LOAD_TODO,
    LOGIN
} from "./action";

import { Map, List } from 'immutable';


export const initialState = Map({
    status: "uninitialized",
    todoList: List(),
    actionType: '',
    currenttodo: ''
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
        case EDIT_TODO, COMPLETION_TODO:
            var index = todoList.findKey(model => model.id == action.model.id);
            var newList = todoList.set(index, action.model);
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
        default:
            break;
    }
    return newState.set('actionType', action.type);
}

export { ToDoApp };