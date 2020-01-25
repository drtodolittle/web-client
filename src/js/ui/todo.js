import { addToDo, deleteToDo, getToDo, editToDo, setCompletionState } from '../api/service';
import doT from 'dot';
import uuid from 'uuid';

let todoTemplate = doT.template(document.getElementById("todo-template").innerHTML);

export function initUI() {

    document.querySelector("#bt_new").addEventListener('click', (e) => {
        let todo = document.querySelector("#newtodo").value;
        let data = new Object();
        data.id = uuid.v4();
        data.todo = todo;
        data.completed = false;
        addToDo(data);
    });
    
    document.querySelector("#newtodo").focus();

    document.querySelector("#todolist").addEventListener('click', (e) => {
        if (e.target.classList.contains("uncompleted")) {
            setCompletionState(e.target.parentElement.parentElement.id, true);
        }
        else if (e.target.classList.contains("completed")) {
            setCompletionState(e.target.parentElement.parentElement.id, false);
        }
        else if (e.target.classList.contains("deletebutton")) {
            deleteToDo(e.target.parentElement.parentElement.id);
        }
        else if (e.target.classList.contains("editbutton")) {
            switchEditMode(e.target.parentElement.parentElement.id, e.target);
        }

    });
    
}

export function switchEditMode(id, editButton) {
    
    let editArea = document.getElementById(id).getElementsByClassName("mdl-list__item-primary-content").item(0);
    if (editArea.getAttribute("contentEditable") == "false") {
        editArea.setAttribute("contentEditable", "true");
        editArea.classList.add("editmode");
        editButton.classList.add("editmode");
        editArea.addEventListener("keydown", (e) => {
            if (e.code === "Enter") {
                switchEditMode(id, editButton);
            }
        });
        editArea.focus();
    }
    else {
        editArea.setAttribute("contentEditable", "false");
        editArea.removeEventListener("keydown", (e) => {
            if (e.code === "Enter") {
                switchEditMode(id, editButton);
            }
        });
        editArea.classList.remove("editmode");
        editButton.classList.remove("editmode");
        let model = getToDo(id);
        model.todo = editArea.textContent;
        editToDo(model);
    }
}


export function showToDo(newItem) {
    let newElement = document.createElement("div");
    newElement.innerHTML = todoTemplate(newItem);

    document.querySelector('#todolist').appendChild(newElement.firstElementChild);
    document.querySelector("#newtodo").value = "";
    document.querySelector("#newtodo").parentElement.classList.remove("is-dirty");
    document.querySelector("#newtodo").focus();
}

export function removeToDo(item) {
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

export function updateToDo(model) {
    let toDoElement = document.getElementById(model.id);
    toDoElement.getElementsByClassName('show').item(0).textContent = model.todo;
}