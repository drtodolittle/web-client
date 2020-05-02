/*
 * action types
 */

export const ADD_TODO = 'ADD_TODO';
export const DELETE_TODO = 'DELETE_TODO';
export const EDIT_TODO = 'EDIT_TODO';
export const COMPLETION_TODO = 'COMPLETION_TODO';
export const LOAD_TODO = 'LOAD_TODO';
export const LOGIN = 'LOGIN';
export const ADD_FILTER = "ADD_FILTER";
export const REMOVE_FILTER = "REMOVE_FILTER";
export const TOGGLE_SHOW_COMPLETED = "TOGGLE_SHOW_COMPLETED";
export const ADD_TAG = "ADD_TAG";


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

export function createLoginAction() {
  return { type: LOGIN }
}

export function createAddFilterAction(filterName) {
  return { type: ADD_FILTER, filterName }
}

export function createRemoveFilterAction(filterName) {
  return { type: REMOVE_FILTER, filterName }
}

export function createToggleShowCompletedAction(showCompleted) {
  return { type: TOGGLE_SHOW_COMPLETED, showCompleted }
}

export function createAddTagAction(tagName) {
  return { type: ADD_TAG, tagName}
}
