import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [NgIf, MarkdownModule],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('message') content!: string;
  @Input() sender!: string;
  @Input() isStreaming: boolean = false;

  copied = false;

  constructor() {
    this.content = '';
    this.sender = '';
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
