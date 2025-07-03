/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Subscription } from 'rxjs';

import { ModelSelectorComponent } from './components/model-selector/model-selector.component';
import { LoggingService } from './services/logging.service';
import { OllamaService } from './services/ollama.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ModelSelectorComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // @ViewChild('chatComponent') chatComponent!: ChatComponent;

  title = 'DialogAI';
  loggingEnabled = false;

  private loggingServ = inject(LoggingService);
  private destroyRef = inject(DestroyRef);
  private ollamaServ = inject(OllamaService);

  private logServSub!: Subscription;

  ngOnInit(): void {
    this.logServSub = this.loggingServ.enableLogging$.subscribe(enabled => {
      this.loggingEnabled = enabled;
    });

    this.destroyRef.onDestroy(() => {
      if (this.logServSub) {
        this.logServSub.unsubscribe();
      }
    });
  }

  toggleLogging(event: any): void {
    const isEnabled = event.target.checked;
    this.loggingServ.toggleLogging(isEnabled);
  }

  // instead of using 'eventEmitter', we've child component reference
  clearChat(): void {
    this.ollamaServ.onChangeClearChat('clear');
    /*
    if (this.chatComponent) {
      this.chatComponent.resetChat();
    }
    */
  }
}
