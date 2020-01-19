import {
    ADD_TODO,
    EDIT_TODO,
    DELETE_TODO,
    COMPLETE_TODO,
    UNCOMPLETE_TODO
} from "./action";

import { Map, List } from 'immutable';


export const initialState = Map({
    status: "uninitialized",
    todoList: List(),
    actionType: ''
});



function ToDoApp(state = initialState, action) {
    let newState = state;
    let todoList = state.get('todoList');

    switch (action.type) {
        case ADD_TODO:
            newState = state.update('todoList', (list) => list.push(action.model));
            break;
        case EDIT_TODO, COMPLETE_TODO, UNCOMPLETE_TODO:
            var index = todoList.findKey(model => model.id == action.model.id);
            var newList = todoList.set(index, action.model);
            newState = state.set('todoList', newList);
            break;
        case DELETE_TODO:
            var index = todoList.findKey(model => model.id == action.id);
            var newList = todoList.remove(index);
            newState = state.set('todoList', newList);
            break;

        default:
            break;
    }
    return newState.set('actionType', action.type);
}

export { ToDoApp };