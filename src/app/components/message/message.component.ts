import { NgIf } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [NgIf, MarkdownModule],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnChanges {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input() message!: string;
  @Input() sender!: string;
  @Input() isStreaming: boolean = false;
  @Input() isThinking: boolean = false;
  @Input() isAborted: boolean = false;
  @Input() imgUrl: string = '';
  @Input() llm: string = ''; // Optional LLM model used for the message generation

  copied = false;
  content: string = '';

  ngOnChanges(changes: SimpleChanges) {
    // Make sure to update our content when message changes
    if (changes['message']) {
      this.content = changes['message'].currentValue;
      console.log('Message updated:', this.content);
    }
  }

  copyMessage() {
    navigator.clipboard.writeText(this.content).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }
}
