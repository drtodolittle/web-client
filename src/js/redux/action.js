/*
 * action types
 */

export const ADD_TODO = 'ADD_TODO';
export const DELETE_TODO = 'DELETE_TODO';
export const EDIT_TODO = 'EDIT_TODO';
export const COMPLETION_TODO = 'COMPLETION_TODO';
export const LOAD_TODO = 'LOAD_TODO';


/*
 * action creators
 */

export function createAddToDoAction(model) {
  return { type: ADD_TODO, model }
}

export function createDeleteToDoAction(id) {
  return { type: DELETE_TODO, id }
}

export function createEditToDoAction(model) {
    return { type: EDIT_TODO, model}
}

export function createSetCompletionStateToDoAction(model) {
  return { type: COMPLETION_TODO, model}
}

export function createLoadToDoAction(model) {
  return { type: LOAD_TODO, model}
}
