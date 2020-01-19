import { createStore } from 'redux';
import { ToDoApp, initialState } from './reducer'; 
 
export const store = createStore(ToDoApp, initialState);
