import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

import { Subject, Subscription } from 'rxjs';

import { OllamaService } from '../../services/ollama.service';
import { MessageComponent } from '../message/message.component';
import { Message } from '../../models/chat-message.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, NgFor, MessageComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];
  userInput: string = '';
  model: string = 'default-model'; // Set a default model
  streamingSubject: Subject<string>;

  private streamingSub!: Subscription;
  private defaultModelSub!: Subscription;
  private destroyRef = inject(DestroyRef);

  constructor(private ollamaServ: OllamaService) {
    this.streamingSubject = this.ollamaServ.streamingSubject;
  }

  ngOnInit(): void {
    this.streamingSub = this.streamingSubject.subscribe({
      next: (message: string) => {
        if (message) {
          this.messages.push({ content: message, sender: 'Ollama' });
          console.log('Received message:', message);
        }
      },
      error: (error: Error) => {
        console.error('Error in streaming:', error);
      },
      complete: () => {
        console.log('Streaming completed');
      },
    });

    this.defaultModelSub = this.ollamaServ.defaultModelName$.subscribe(modelName => {
      if (modelName) {
        this.model = modelName;
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.streamingSub) {
        this.streamingSub.unsubscribe();
      }
      if (this.defaultModelSub) {
        this.defaultModelSub.unsubscribe();
      }
    });
  }

  // filepath: /mnt/c/repos/ar_files/code/ollama-chat/src/app/components/chat/chat.component.ts
  sendMessage(): void {
    if (this.userInput.trim()) {
      // Add user message
      this.messages.push({
        content: this.userInput,
        sender: 'User',
        isStreaming: false,
      });

      // Add empty AI message that will be filled with stream
      this.messages.push({
        content: '',
        sender: 'Ollama',
        isStreaming: true,
      });

      // Get current message index
      const aiMessageIndex = this.messages.length - 1;

      // Update subscription to accumulate content
      if (this.streamingSub) {
        this.streamingSub.unsubscribe();
      }

      this.streamingSub = this.streamingSubject.subscribe({
        next: (chunk: string) => {
          if (chunk) {
            // Append to the existing message instead of creating new ones
            this.messages[aiMessageIndex].content += chunk;
            console.log('Updated message:', this.messages[aiMessageIndex].content);
          }
        },
        error: (error: Error) => {
          this.messages[aiMessageIndex].isStreaming = false; // Set streaming to false on error
          console.error('Error in streaming:', error);
        },
        complete: () => {
          this.messages[aiMessageIndex].isStreaming = false; // Set streaming to false when complete
          console.log('Streaming completed');
        },
      });

      // Start streaming
      this.ollamaServ.streamMessage(this.model, [{ role: 'user', content: this.userInput }]);
      this.userInput = '';
    }
  }
}
