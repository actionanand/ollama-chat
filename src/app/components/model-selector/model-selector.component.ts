/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
// import { Observable } from 'rxjs';

import { OllamaService } from '../../services/ollama.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-model-selector',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './model-selector.component.html',
  styleUrls: ['./model-selector.component.scss'],
})
export class ModelSelectorComponent implements OnInit {
  @ViewChild('mySelect') selectedOption!: ElementRef;

  models: any[] = [];
  selectedModel: string = '';

  fetchModelSub!: Subscription;
  private destroyRef = inject(DestroyRef);
  private ollamaServ = inject(OllamaService);

  constructor() {}

  ngOnInit(): void {
    this.fetchModelSub = this.ollamaServ.getModels().subscribe({
      next: (data: any) => {
        this.models = data.models || [];
        if (this.models.length > 0) {
          this.selectedModel = this.models[0].name; // Set the first model as default
          this.ollamaServ.onChangeDefaultModel(this.selectedModel);
        }
      },
      error: (error: any) => {
        console.error('Error fetching models:', error);
      },
    });

    this.destroyRef.onDestroy(() => {
      if (this.fetchModelSub) {
        this.fetchModelSub.unsubscribe();
      }
    });
  }

  onSelectChange() {
    this.selectedModel = this.selectedOption.nativeElement.value;
    this.ollamaServ.onChangeDefaultModel(this.selectedModel);
  }
}
