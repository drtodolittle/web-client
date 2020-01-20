import { ToDoModel } from '../model/model';
import { addToDo, deleteToDo, getToDo, editToDo, setCompletionState } from '../api/service';
import doT from 'dot';

let todoTemplate = doT.template(document.getElementById("todo-template").innerHTML);

export function init() {
    document.querySelector("#bt_new").addEventListener('click', (e) => {
        let todo = document.querySelector("#newtodo").value;
        let data = new ToDoModel(todo, false);
        addToDo(data);

        document.querySelector("#newtodo").value = "";
        document.querySelector("#newtodo").parentElement.classList.remove("is-dirty");
    });

    document.querySelector("#todolist").addEventListener('click', (e) => {
        console.info("Click Event: " + e.target);
        if (e.target.classList.contains("uncompleted")) {
            setCompletionState(e.target.parentElement.parentElement.id, true);
        }
        else if (e.target.classList.contains("completed")) {
            setCompletionState(e.target.parentElement.parentElement.id, false);
        }
        else if (e.target.classList.contains("delete")) {
            deleteToDo(e.target.parentElement.parentElement.id);
        }
    });
}

export function showToDo(newItem) {
    let newElement = document.createElement("div");
    newElement.innerHTML = todoTemplate(newItem);

    document.querySelector('#todolist').appendChild(newElement.firstElementChild);
}

export function removToDo(item) {
    let toDoElement = document.getElementById(item.id);
    toDoElement.remove();
}

export function showCompletionState(item) {
    let toDoElement = document.getElementById(item.id);
    if (item.completed) {
        toDoElement.getElementsByClassName("completed").item(0).parentElement.classList.remove('hidden');
        toDoElement.getElementsByClassName("uncompleted").item(0).parentElement.classList.add('hidden');
    }
    else {
        toDoElement.getElementsByClassName("uncompleted").item(0).parentElement.classList.remove('hidden');
        toDoElement.getElementsByClassName("completed").item(0).parentElement.classList.add('hidden');
    }
}