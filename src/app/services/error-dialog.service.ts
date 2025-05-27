import { Injectable, ApplicationRef, ComponentRef, createComponent, EnvironmentInjector } from '@angular/core';

import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ErrorDialogService {
  private dialogComponentRef: ComponentRef<ErrorDialogComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
  ) {}

  showError(): void {
    // Create component only if it doesn't exist
    if (!this.dialogComponentRef) {
      // Create the component
      this.dialogComponentRef = createComponent(ErrorDialogComponent, {
        environmentInjector: this.injector,
      });

      // Add to the DOM
      document.body.appendChild(this.dialogComponentRef.location.nativeElement);

      // Attach to the application change detection
      this.appRef.attachView(this.dialogComponentRef.hostView);
    }

    // Show the dialog
    this.dialogComponentRef.instance.show();
  }
}
