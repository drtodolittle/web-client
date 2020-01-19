import uuid from 'uuid';

export class ToDoList {

    constructor() {
        this.items = new Array();
        this.addListener = new Array();
        this.removeListener = new Array();
    }

    add(item) {
        this.items.push(item);
        this.addListener.forEach((listener) => {
            listener(item);
        });
    }

    remove(id) {
        var index = -1;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].id == id) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            this.removeListener.forEach((listener) => {
                listener(this.items[index]);
            }, this);
            this.items.splice(index, 1);
        }
    }

    get(id) {
        var index = -1;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].id == id) {
                index = i;
                break;
            }
        }
        return this.items[index];
    }

    list() {
        return this.items;
    }

    export() {
        return JSON.stringify(this.items);
    }

    import(data) {
        if (data) {
            var newData = JSON.parse(data);
            newData.forEach((item) => {
                this.add(item);
            }, this);
        }
    }

    registerAddListener(callback) {
        this.addListener.push(callback);
    }

    unregisterAddListener(callback) {
        var index = this.addListener.indexOf(callback);
        this.addListener.splice(index, 1);
    }

    registerRemoveListener(callback) {
        this.removeListener.push(callback);
    }

    unregisterRemoveListener(callback) {
        var index = this.removeListener.indexOf(callback);
        this.removeListener.splice(index, 1);
    }

}

export class ToDoModel {

    constructor(todo, completed) {
        this.id = uuid.v4();
        this.todo = todo;
        this.completed = completed;
    }
}