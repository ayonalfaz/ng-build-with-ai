import { Injectable } from '@angular/core';
import { Todo } from '../models/todo.model';

@Injectable({
    providedIn: 'root'
})
export class TodoService {
    private storageKey = 'angular17-todos';
    private todos: Todo[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.todos = JSON.parse(stored).map((t: any) => ({
                ...t,
                createdAt: new Date(t.createdAt)
            }));
        }
    }

    private saveToStorage(): void {
        localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
    }

    getAll(): Todo[] {
        return [...this.todos];
    }

    add(title: string): Todo {
        const todo: Todo = {
            id: Date.now(),
            title: title.trim(),
            completed: false,
            createdAt: new Date()
        };
        this.todos.unshift(todo);
        this.saveToStorage();
        return todo;
    }

    toggle(id: number): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
        }
    }

    delete(id: number): void {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToStorage();
    }

    update(id: number, title: string): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.title = title.trim();
            this.saveToStorage();
        }
    }

    clearCompleted(): void {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveToStorage();
    }

    getStats(): { total: number; completed: number; active: number } {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        return { total, completed, active: total - completed };
    }
}
