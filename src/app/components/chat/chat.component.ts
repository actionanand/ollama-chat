/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { Subscription } from 'rxjs';

import { OllamaService } from '../../services/ollama.service';
import { MessageComponent } from '../message/message.component';
import { Message } from '../../models/chat-message.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, NgFor, MessageComponent, NgIf],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewChecked, AfterViewInit {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  private shouldScrollToBottom = true;
  private isUserScrolling = false;
  private scrollTimeout: any;

  messages: Message[] = [];
  userInput: string = '';
  model: string = 'default-model'; // Set a default model

  isThinking: boolean = false;
  isStreaming: boolean = false;

  private streamingSub!: Subscription;
  private defaultModelSub!: Subscription;
  private destroyRef = inject(DestroyRef);
  private ollamaServ = inject(OllamaService);

  ngOnInit(): void {
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

      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
    });
  }

  ngAfterViewInit() {
    // Add scroll event listener to detect manual scrolling
    this.messageContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom && !this.isUserScrolling) {
      this.scrollToBottom();
    }
  }

  onScroll(): void {
    // Mark that user is manually scrolling
    this.isUserScrolling = true;

    // Clear any existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Set timeout to stop detecting user scrolling
    this.scrollTimeout = setTimeout(() => {
      this.isUserScrolling = false;

      // Check if user scrolled to bottom
      const element = this.messageContainer.nativeElement;
      const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 30;

      // Only auto-scroll if user is at the bottom
      this.shouldScrollToBottom = atBottom;
    }, 100);
  }

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // filepath: /mnt/c/repos/ar_files/code/ollama-chat/src/app/components/chat/chat.component.ts
  sendMessage(): void {
    if (this.userInput.trim()) {
      this.isThinking = true;
      // Add user message
      this.messages.push({ content: this.userInput, sender: 'User' });

      // Add initial AI message in "thinking" state
      this.messages.push({
        content: '',
        sender: 'Ollama',
        isThinking: true, // Start with thinking indicator
        isStreaming: false, // Not streaming yet
      });

      // Get current message index
      const aiMessageIndex = this.messages.length - 1;

      // Always unsubscribe from previous subscription
      // Update subscription to accumulate content
      if (this.streamingSub) {
        this.streamingSub.unsubscribe();
      }

      // Start streaming and capture the NEW subject returned
      const subject = this.ollamaServ.streamMessage(this.model, [{ role: 'user', content: this.userInput }]);

      // Subscribe to the NEW subject
      this.streamingSub = subject.subscribe({
        next: (chunk: string) => {
          if (chunk) {
            // If this is first chunk, change from thinking to streaming
            if (this.messages[aiMessageIndex].isThinking) {
              this.messages[aiMessageIndex].isThinking = false;
              this.messages[aiMessageIndex].isStreaming = true;
              this.isThinking = false;
              this.isStreaming = true;
            }

            this.shouldScrollToBottom = true;
            this.isUserScrolling = false;

            // Append to the existing message instead of creating new ones
            this.messages[aiMessageIndex].content += chunk;
            console.log('Updated message:', this.messages[aiMessageIndex].content);
          }
        },
        error: (error: Error) => {
          this.messages[aiMessageIndex].isStreaming = false; // Set streaming to false on error
          this.messages[aiMessageIndex].isThinking = false; // Stop thinking state on error
          this.isThinking = false;
          this.isStreaming = false;
          console.error('Error in streaming:', error);
        },
        complete: () => {
          this.messages[aiMessageIndex].isStreaming = false; // Set streaming to false when complete
          this.messages[aiMessageIndex].isThinking = false; // Stop thinking state when complete
          this.isThinking = false;
          this.isStreaming = false;
          console.log('Streaming completed');
        },
      });

      // Start streaming
      // this.ollamaServ.streamMessage(this.model, [{ role: 'user', content: this.userInput }]);
      this.userInput = '';
    }
  }

  stopStreaming(): void {
    if (this.isStreaming) {
      // Call service method to abort the fetch request
      this.ollamaServ.abortStreaming();

      // Update UI state
      this.isStreaming = false;

      // Find the current streaming message and mark it as not streaming
      const streamingMessage = this.messages.find(m => m.isStreaming);
      if (streamingMessage) {
        streamingMessage.isStreaming = false;
      }
    }
  }
}
