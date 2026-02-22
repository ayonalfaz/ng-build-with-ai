import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface SubtaskSuggestion {
    subtasks: string[];
}

export interface PrioritisedTodo {
    title: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
}

export interface PrioritiseResult {
    prioritised: PrioritisedTodo[];
}

/**
 * AiService — client-side service that calls the Genkit-powered
 * server API routes exposed via Angular SSR + Express.
 *
 * Both methods degrade gracefully: if the server is unavailable or
 * GEMINI_API_KEY is not set, they return empty results silently.
 */
@Injectable({
    providedIn: 'root'
})
export class AiService {
    private http = inject(HttpClient);

    /**
     * Given a todo title, asks Gemini to suggest 3–5 actionable subtasks.
     */
    suggestSubtasks(title: string): Observable<SubtaskSuggestion> {
        return this.http
            .post<SubtaskSuggestion>('/api/ai/suggest', { title })
            .pipe(catchError(() => of({ subtasks: [] })));
    }

    /**
     * Given a list of todo titles, asks Gemini to prioritise them
     * with high / medium / low labels and a short reason for each.
     */
    prioritiseTodos(todos: string[]): Observable<PrioritiseResult> {
        return this.http
            .post<PrioritiseResult>('/api/ai/prioritise', { todos })
            .pipe(catchError(() => of({ prioritised: [] })));
    }
}
