/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private enableLoggingSubject = new BehaviorSubject<boolean>(false);
  public enableLogging$ = this.enableLoggingSubject.asObservable();
  private originalConsole: any;

  constructor() {
    // Save original console methods
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
    };

    this.enableLogging$.subscribe(enabled => {
      this.setLoggingState(enabled);
    });
  }

  toggleLogging(enable: boolean): void {
    this.enableLoggingSubject.next(enable);
  }

  private setLoggingState(enable: boolean): void {
    if (enable) {
      // Restore original console methods
      console.log = this.originalConsole.log;
      console.warn = this.originalConsole.warn;
      console.error = this.originalConsole.error;
      console.info = this.originalConsole.info;
      console.debug = this.originalConsole.debug;
    } else {
      // Override with empty functions
      console.log = () => {};
      console.warn = () => {};
      console.info = () => {};
      console.debug = () => {};
      // Keep error logging for critical issues
      console.error = this.originalConsole.error;
    }
  }
}
