import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('message') content!: string;
  @Input() sender!: string;

  constructor() {
    this.content = '';
    this.sender = '';
  }
}
