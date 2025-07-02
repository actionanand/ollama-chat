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
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';

import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OllamaService } from '../../services/ollama.service';
import { MessageComponent } from '../message/message.component';
import { Message } from '../../models/chat-message.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, NgFor, MessageComponent, NgIf, NgClass],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewChecked, AfterViewInit {
  @ViewChild('messageContainer') private messageContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputField') inputField!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private shouldScrollToBottom = true;
  private isUserScrolling = false;
  private scrollTimeout: any;

  messages: Message[] = [];
  userInput: string = '';
  model: string = 'default-model'; // Set a default model

  uploadedImgUrl = '';
  isImgUploading: boolean = false; // Track image upload state

  isThinking: boolean = false;
  isStreaming: boolean = false;

  private streamingSub!: Subscription;
  private defaultModelSub!: Subscription;
  private destroyRef = inject(DestroyRef);
  private ollamaServ = inject(OllamaService);

  selectedImage: {
    file: File;
    url: string;
    name: string;
  } | null = null;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    // Cmd+K or Ctrl+K to focus input
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.focusInput();
    }

    // Escape to stop streaming
    if (event.key === 'Escape' && this.isStreaming) {
      this.stopStreaming();
    }
  }

  ngOnInit(): void {
    this.defaultModelSub = this.ollamaServ.defaultModelName$.subscribe(modelName => {
      if (modelName) {
        this.model = modelName;
      }
    });

    this.ollamaServ.isImgUploading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(isUploading => {
      this.isImgUploading = isUploading;
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
    this.focusInput();
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

  focusInput(): void {
    if (this.inputField && !this.isThinking && !this.isStreaming) {
      this.inputField.nativeElement.focus();
    }
  }

  copyToInput(content: string): void {
    // Copy the message content to the input field
    this.userInput = content;

    // Focus the input field with slight delay to ensure UI is updated
    setTimeout(() => {
      if (this.inputField) {
        this.inputField.nativeElement.focus();

        // Optional: Position cursor at the end of the text
        const inputElement = this.inputField.nativeElement;
        inputElement.selectionStart = inputElement.selectionEnd = content.length;
      }
    }, 0);
  }

  // Method to manually trigger file input click
  triggerFileInput(event: Event): void {
    // Prevent click if disabled
    if (this.isThinking || this.isStreaming) {
      return;
    }

    // Stop event from propagating to prevent double-clicks
    event.preventDefault();
    event.stopPropagation();

    // Programmatically click the hidden file input
    this.fileInput.nativeElement.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.ollamaServ.onChangeIsImgUploading(true); // Set uploading state
      const file = input.files[0];
      this.ollamaServ
        .uploadImageToImgbb(file)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: url => {
            this.uploadedImgUrl = url;
            console.log('Uploaded image URL:', url);
            this.ollamaServ.onChangeIsImgUploading(false); // Reset uploading state
            // Optionally, you can append the image URL to the chat input or display it
            // this.userInput += ` ${url}`;
          },
          error: error => {
            this.uploadedImgUrl = '';
            this.ollamaServ.onChangeIsImgUploading(false); // Reset uploading state
            console.error('Error uploading image to imgbb:', error);
          },
        });
    }
  }

  sendMessage(): void {
    if (this.userInput.trim()) {
      this.isThinking = true;

      let msgWithUrl = '';
      msgWithUrl = this.uploadedImgUrl ? `${this.uploadedImgUrl} ${this.userInput}` : this.userInput;

      // Add user message
      this.messages.push({ content: msgWithUrl, sender: 'User' });

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

      // Clear user input and refocus
      this.userInput = '';
      this.uploadedImgUrl = '';

      // Reset the file input after sending the message
      if (this.fileInput && this.fileInput.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  stopStreaming(): void {
    if (this.isStreaming) {
      // Abort the stream
      this.ollamaServ.abortStreaming();

      // Find the current streaming message
      const streamingMessageIndex = this.messages.findIndex(m => m.isStreaming);
      if (streamingMessageIndex !== -1) {
        // Create a new reference to trigger change detection
        this.messages[streamingMessageIndex] = {
          ...this.messages[streamingMessageIndex],
          isStreaming: false,
          isAborted: true,
        };
      }

      this.isStreaming = false;

      // Focus back on input
      setTimeout(() => {
        this.focusInput();
      }, 10);
    }
  }

  resetChat(): void {
    // Cancel any ongoing streaming
    if (this.isStreaming) {
      this.stopStreaming();
    }

    // Clear all messages
    this.messages = [];

    // Reset states
    this.isThinking = false;
    this.isStreaming = false;
    this.userInput = '';
    this.uploadedImgUrl = '';

    // Focus the input field
    setTimeout(() => {
      this.focusInput();
    }, 0);

    // Scroll to top (if needed)
    if (this.messageContainer) {
      this.messageContainer.nativeElement.scrollTop = 0;
    }

    console.log('Chat reset complete');
  }
}
