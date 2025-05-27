import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [NgIf],
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss'],
})
export class ErrorDialogComponent {
  isVisible = false;

  show(): void {
    this.isVisible = true;
  }

  close(): void {
    this.isVisible = false;
  }

  retry(): void {
    // You can implement retry logic here
    window.location.reload();
  }
}
