/*
 * action types
 */

export const ADD_TODO = 'ADD_TODO';
export const DELETE_TODO = 'DELETE_TODO';
export const EDIT_TODO = 'EDIT_TODO';
export const COMPLETE_TODO = 'COMPLETE_TODO';
export const UNCOMPLETE_TODO = 'UNCOMPLETE_TODO';


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

export function createCompleteToDoAction(model) {
  return { type: COMPLETE_TODO, model}
}

export function createUnCompleteToDoAction(model) {
  return { type: UNCOMPLETE_TODO, model}
}
