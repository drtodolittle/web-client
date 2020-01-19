import { ToDoModel } from '../model/model';
import { addToDo, deleteToDo, getToDo, editToDo } from '../api/service';
import doT from 'dot';

let todoTemplate = doT.template(document.getElementById("todo-template").innerHTML);

export function init() {
    document.querySelector("#bt_new").addEventListener('click', (e) => {
        let todo = document.querySelector("#newtodo").value;
        let data = new ToDoModel(todo, false);
        addToDo(data);
        showToDo(data);

        document.querySelector("#newtodo").value = "";
        document.querySelector("#newtodo").parentElement.classList.remove("is-dirty");
    });
}

export function showToDo(newItem) {
    let newElement = document.createElement("div");
    newElement.innerHTML = todoTemplate(newItem);
    
    document.querySelector('#todolist').appendChild(newElement.firstElementChild);
    componentHandler.upgradeDom('MaterialMenu', 'mdl-menu');
}


