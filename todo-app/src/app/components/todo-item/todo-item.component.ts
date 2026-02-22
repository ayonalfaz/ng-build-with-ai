import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo } from '../../models/todo.model';

@Component({
    selector: 'app-todo-item',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="todo-item" [class.completed]="todo.completed">
      <div class="todo-content" *ngIf="!editing">
        <button class="check-btn" (click)="toggle.emit(todo.id)" [class.checked]="todo.completed">
          <svg *ngIf="todo.completed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
        <span class="todo-title" (dblclick)="startEdit()">{{ todo.title }}</span>
        <div class="todo-actions">
          <button class="edit-btn" (click)="startEdit()">✏️</button>
          <button class="delete-btn" (click)="delete.emit(todo.id)">🗑️</button>
        </div>
      </div>
      <div class="edit-content" *ngIf="editing">
        <input
          class="edit-input"
          type="text"
          [(ngModel)]="editValue"
          (keyup.enter)="saveEdit()"
          (keyup.escape)="cancelEdit()"
          (blur)="saveEdit()"
          autofocus
        />
      </div>
    </div>
  `
})
export class TodoItemComponent {
    @Input() todo!: Todo;
    @Output() toggle = new EventEmitter<number>();
    @Output() delete = new EventEmitter<number>();
    @Output() update = new EventEmitter<{ id: number; title: string }>();

    editing = false;
    editValue = '';

    startEdit(): void {
        this.editing = true;
        this.editValue = this.todo.title;
    }

    saveEdit(): void {
        if (this.editValue.trim()) {
            this.update.emit({ id: this.todo.id, title: this.editValue.trim() });
        }
        this.editing = false;
    }

    cancelEdit(): void {
        this.editing = false;
    }
}
