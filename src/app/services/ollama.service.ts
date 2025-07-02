/* eslint-disable @typescript-eslint/no-explicit-any */
import { DestroyRef, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ErrorDialogService } from './error-dialog.service';
import { environment as env } from '../../environments/environment'; // Adjust the import path as necessary
import { ImgbbResponse } from '../models/imgbb.model';

@Injectable({
  providedIn: 'root',
})
export class OllamaService {
  private apiUrl = env.ollamaApiUrl;

  private defaultModelName = new BehaviorSubject<string>(''); // Set a default model name
  defaultModelName$ = this.defaultModelName.asObservable();

  private isImgUploading = new BehaviorSubject<boolean>(false);
  isImgUploading$ = this.isImgUploading.asObservable();

  // Add AbortController to cancel fetch requests
  private abortController: AbortController | null = null;

  private http = inject(HttpClient);
  private errorDialogServ = inject(ErrorDialogService);
  private destroyRef = inject(DestroyRef);

  onChangeDefaultModel(modelName: string): void {
    this.defaultModelName.next(modelName);
  }

  onChangeIsImgUploading(isUploading: boolean): void {
    this.isImgUploading.next(isUploading);
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

    // Create a NEW subject for each streaming request
    const streamingSubject = new Subject<string>();

    // Create a new AbortController for this request
    this.abortController = new AbortController();

    fetch(`${this.apiUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: this.abortController.signal,
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const processStream = (result: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
          const { done, value } = result;
          if (done) {
            streamingSubject.complete();
            return Promise.resolve();
          }

          if (value) {
            const chunk = decoder.decode(value);

            try {
              chunk.split('\n').forEach(line => {
                if (line.trim() === '') return;

                try {
                  const data = JSON.parse(line);
                  if (data.message && data.message.content) {
                    streamingSubject.next(data.message.content);
                  }
                } catch (e) {
                  console.error('Error parsing JSON:', e, 'Line:', line);
                }
              });
            } catch (e) {
              console.error('Error processing chunk:', e);
            }
          }

          return reader.read().then(processStream);
        };

        reader.read().then(processStream);
      })
      .catch(error => {
        console.error('Error streaming response:', error);
        streamingSubject.error(error);
      });

    return streamingSubject;
  }

  abortStreaming(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // Fetch available models from the Ollama API
  getModels(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tags`).pipe(
      catchError(error => {
        // Show the error dialog
        this.errorDialogServ.showError();
        // Re-throw the error so subscribers can still handle it
        return throwError(() => error);
      }),
    );
  }

  /**
   * Converts a File to a base64 string (without the data URL prefix).
   * @param file The image file to convert
   * @returns Observable<string> The base64 string
   */
  fileToBase64(file: File): Observable<string> {
    return new Observable<string>(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        observer.next(base64String);
        observer.complete();
      };
      reader.onerror = e => observer.error(e);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Uploads a base64 image string to imgbb and returns an Observable of the image URL.
   * @param base64String The base64 image string
   * @returns Observable<string> The uploaded image URL
   */
  uploadBase64ToImgbb(base64String: string): Observable<string> {
    const apiKey = env.imgbbKey || 'xxxxxx';
    const uploadUrl = env.imgbbUploadUrl || 'https://api.imgbb.com/1/upload';
    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('image', base64String);
    formData.append('expiration', '600'); // Set expiration in seconds (e.g., 600 = 10 minutes)
    console.log('formData:', formData);
    return new Observable<string>(observer => {
      this.http
        .post<ImgbbResponse>(uploadUrl, formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: data => {
            if (data && data.data && data.data.url) {
              observer.next(data.data.url);
              observer.complete();
            } else {
              observer.error(new Error('Failed to get image URL from imgbb response'));
            }
          },
          error: err => observer.error(err),
        });
    });
  }

  /**
   * Uploads an image file to imgbb and returns an Observable of the image URL.
   * @param file The image file to upload
   * @returns Observable<string> The uploaded image URL
   */
  uploadImageToImgbb(file: File): Observable<string> {
    return this.fileToBase64(file).pipe(switchMap(base64 => this.uploadBase64ToImgbb(base64)));
  }
}
