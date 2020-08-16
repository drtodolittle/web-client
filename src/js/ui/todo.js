import { addToDo, deleteToDo, getToDo, editToDo, setCompletionState, toggleShowCompleted, addFilter, removeFilter } from '../api/service';
import doT from 'dot';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../redux/store';


let todoTemplate = doT.template(document.getElementById("todo-template").innerHTML);
let filterChipTemplate = doT.template(document.getElementById("filter-chip").innerHTML);
let filterMenuTemplate = doT.template(document.getElementById("filter-menu-template").innerHTML);

export function initUI() {

    document.getElementById("bt_new").addEventListener('click', (e) => {
        newToDo();
    });


    document.getElementById("newtodo").addEventListener('keypress', (e) => {
        if (e.key == "#") {
            let tags = store.getState().get('tags');
        }
        else if (e.key == 'Enter') {
            newToDo();
        }
        
    });

    document.getElementById("switch-show-completed").addEventListener('click', (e) => {
        toggleShowCompleted(e.target.checked);
    });

    document.getElementById("filter").addEventListener('click', (e) => {
        if (e.target.parentElement.classList.contains("mdl-chip__action")) {
            removeFilter(e.target.parentElement.parentElement.firstElementChild.textContent);
        }
    });

    document.getElementById("filter-menu-div").addEventListener('click', (e) => {
        if (e.target.classList.contains("mdl-menu__item")) {
            addFilter(e.target.textContent);
        }
    });

    document.getElementById("newtodo").focus();

    document.getElementById("todolist").addEventListener('click', (e) => {
        if (e.target.classList.contains("uncompleted")) {
            setCompletionState(e.target.parentElement.parentElement.id, true);
        }
        else if (e.target.classList.contains("completed")) {
            setCompletionState(e.target.parentElement.parentElement.id, false);
        }
        else if (e.target.classList.contains("deletebutton")) {
            deleteToDo(e.target.parentElement.parentElement.parentElement.id);
        }
        else if (e.target.classList.contains("editbutton")) {
            switchEditMode(e.target.parentElement.parentElement.parentElement.id, e.target);
        }
    });

}

function newToDo() {
    let todo = document.getElementById("newtodo").value;
    let data = new Object();
    data.id = uuidv4();
    data.todo = todo;
    data.completed = false;
    addToDo(data);
}

let eventHandler = function (event) {
    if (event.code === "Enter") {
        event.preventDefault();
        let id = event.target.parentElement.id;
        let editButton = event.target.parentElement.getElementsByClassName("editbutton")[0];
        switchEditMode(id, editButton);
    }
}

export function switchEditMode(id, editButton) {

    let editArea = document.getElementById(id).getElementsByClassName("mdl-list__item-primary-content").item(0);
    if (editArea.getAttribute("contentEditable") == "false") {
        editArea.setAttribute("contentEditable", "true");
        editArea.classList.add("editmode");
        editArea.addEventListener("keydown", eventHandler);
        editButton.classList.add("editmode");
        editArea.focus();
    }
    else {
        editArea.setAttribute("contentEditable", "false");
        editArea.classList.remove("editmode");
        editArea.removeEventListener("keydown", eventHandler);
        editButton.classList.remove("editmode");
        let model = getToDo(id);
        model.todo = editArea.textContent;
        editToDo(model);
    }
}

export function setFocus() {
    document.getElementById("newtodo").focus();
}

export function showToDo(model, filterSet, showCompleted) {
    let filtered = filterSet.every((filter) => {
        let matches = model.todo.match(/#\w+/ig);
        if (matches == null) {
            return false;
        }
        return matches.some((token) => {
            return token.includes(filter);
        });
    });
    if (!filtered) {
        return false;
    }
    if (model.completed != showCompleted) {
        return false;
    }

    let newElement = document.createElement("div");
    newElement.innerHTML = todoTemplate(model);
    document.getElementById('todolist').appendChild(newElement.firstElementChild);
    showCompletionState(model);
    document.getElementById("newtodo").value = "";
    document.getElementById("newtodo").parentElement.classList.remove("is-dirty");
    return true;
}

export function removeToDo(id) {
    let toDoElement = document.getElementById(id);
    toDoElement.remove();
}

function showCompletionState(item) {
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

export function showToDos(todoList, filterSet, showCompleted) {
    clearToDoListElement();
    let tags = new Set();
    todoList.forEach((model) => {
        if (showToDo(model, filterSet, showCompleted)) {
            let toDotags = model.todo.match(/#\w+/ig);
            if (toDotags != null) {
                toDotags.forEach((tag) => {
                    tags.add(tag);
                });
            }
        }
    });
    addFilterMenu(tags);
}

export function addFilterMenu(tags) {
    let newMenu = document.createElement("div");
    newMenu.innerHTML = filterMenuTemplate(Array.from(tags));
    let filterParent = document.getElementById("filter-menu-div");
    filterParent.innerHTML = newMenu.innerHTML;
    componentHandler.upgradeDom(); 
}

function clearToDoListElement() {
    let todoListElement = document.getElementById("todolist")
    while (todoListElement.lastChild) {
        todoListElement.removeChild(todoListElement.lastChild);
    }
}

function clearFilterElement() {
    let filterElement = document.getElementById("filter")
    while (filterElement.lastChild) {
        filterElement.removeChild(filterElement.lastChild);
    }
}

export function showFilterChips(filterSet) {
    clearFilterElement();
    filterSet.forEach((filter) => {
        let newElement = document.createElement("div");
        newElement.innerHTML = filterChipTemplate(filter);
        document.getElementById("filter").appendChild(newElement.firstElementChild);
    });
}
