// filepath: /ollama-chat/ollama-chat/src/app/services/ollama.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OllamaService {
  private apiUrl = 'http://localhost:11434/api';
  // private streamingSubject = new Subject<string>();
  streamingSubject = new Subject<string>();
  private defaultModelName = new BehaviorSubject<string>(''); // Set a default model name
  defaultModelName$ = this.defaultModelName.asObservable();

  // Add AbortController to cancel fetch requests
  private abortController: AbortController | null = null;

  constructor(private http: HttpClient) {}

  onChangeDefaultModel(modelName: string): void {
    this.defaultModelName.next(modelName);
  }

  sendMessage(model: string, messages: any[]): Observable<any> {
    const requestBody = {
      model: model,
      messages: messages,
      stream: false,
    };

    return this.http.post(`${this.apiUrl}/chat`, requestBody);
  }

  streamMessage(model: string, messages: any[]): Subject<string> {
    const requestBody = {
      model,
      messages,
      stream: true,
    };

    console.log('Sending request to Ollama API:', requestBody);
    // this.streamingSubject = new Subject<string>();
    // Don't create a new subject, clear the existing one
    this.streamingSubject.next(''); // Clear previous messages

    // Create an AbortController for this request
    this.abortController = new AbortController();

    // Server-Sent Events (SSE) streams
    fetch(`${this.apiUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: this.abortController.signal,
    })
      .then(response => {
        console.log('Received response:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const processStream = (result: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
          const { done, value } = result;
          if (done) {
            console.log('Stream completed');
            this.streamingSubject.complete();
            return Promise.resolve();
          }

          if (value) {
            const chunk = decoder.decode(value);
            console.log('Received chunk:', chunk);

            try {
              chunk.split('\n').forEach(line => {
                if (line.trim() === '') return;

                try {
                  const data = JSON.parse(line);
                  console.log('Parsed data:', data);

                  if (data.message && data.message.content) {
                    console.log('Emitting content:', data.message.content);
                    this.streamingSubject.next(data.message.content);
                  }
                } catch (e) {
                  console.error('Error parsing JSON:', e, 'Line:', line);
                }
              });
            } catch (e) {
              console.error('Error processing chunk:', e);
            }
          }

          // Continue reading the stream
          return reader.read().then(processStream);
        };

        reader.read().then(processStream);
      })
      .catch(error => {
        // Check for aborted request
        if (error.name === 'AbortError') {
          console.log('Request aborted by user');
        } else {
          console.error('Error streaming response:', error);
        }
        this.streamingSubject.complete();
      });

    return this.streamingSubject;
  }

  abortStreaming(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.streamingSubject.complete();
    }
  }

  // Fetch available models from the Ollama API
  getModels(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tags`);
  }
}
