import { Component } from '@angular/core';

import { ModelSelectorComponent } from './components/model-selector/model-selector.component';
import { ChatComponent } from './components/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ModelSelectorComponent, ChatComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Ollama Chat';
}
