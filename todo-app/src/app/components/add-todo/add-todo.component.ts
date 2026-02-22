import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-add-todo',
    imports: [FormsModule, CommonModule],
    template: `
    <form class="add-todo-form" (ngSubmit)="onSubmit()">
      <input
        class="todo-input"
        type="text"
        [(ngModel)]="inputValue"
        name="todoInput"
        placeholder="What needs to be done?"
        autofocus
      />
      <button class="add-btn" type="submit" [disabled]="!inputValue.trim()">
        <span>Add</span>
      </button>
    </form>
  `
})
export class AddTodoComponent {
    @Output() addTodo = new EventEmitter<string>();
    inputValue = '';

    onSubmit(): void {
        if (this.inputValue.trim()) {
            this.addTodo.emit(this.inputValue.trim());
            this.inputValue = '';
        }
    }
}
