import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from './models/todo.model';
import { TodoService } from './services/todo.service';
import { AddTodoComponent } from './components/add-todo/add-todo.component';
import { TodoItemComponent } from './components/todo-item/todo-item.component';

type FilterType = 'all' | 'active' | 'completed';

@Component({
    selector: 'app-root',
    imports: [CommonModule, AddTodoComponent, TodoItemComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  todos: Todo[] = [];
  filter: FilterType = 'all';
  stats = { total: 0, completed: 0, active: 0 };

  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.todos = this.todoService.getAll();
    this.stats = this.todoService.getStats();
  }

  get filtered(): Todo[] {
    switch (this.filter) {
      case 'active': return this.todos.filter(t => !t.completed);
      case 'completed': return this.todos.filter(t => t.completed);
      default: return this.todos;
    }
  }

  onAdd(title: string): void {
    this.todoService.add(title);
    this.refresh();
  }

  onToggle(id: number): void {
    this.todoService.toggle(id);
    this.refresh();
  }

  onDelete(id: number): void {
    this.todoService.delete(id);
    this.refresh();
  }

  onUpdate(event: { id: number; title: string }): void {
    this.todoService.update(event.id, event.title);
    this.refresh();
  }

  onClearCompleted(): void {
    this.todoService.clearCompleted();
    this.refresh();
  }

  setFilter(f: FilterType): void {
    this.filter = f;
  }

  trackById(_: number, todo: Todo): number {
    return todo.id;
  }
}
