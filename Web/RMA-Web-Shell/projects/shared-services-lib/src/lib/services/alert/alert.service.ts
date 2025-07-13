// wiki: http://bit.ly/2kwHEH2
// The default alert service for the app.

import { Injectable, Injector } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Error } from 'projects/shared-models-lib/src/lib/common/error';
import { AppInsightsService } from '../diagnostics/appinsights.service';
import { HttpErrorResponse } from '@angular/common/http';

/** @description The default alert service for the app. */
@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private subject = new Subject<any>();
  private keepAfterNavigationChange = false;
  appEventsManager: AppEventsManager;
  appInsightsService: AppInsightsService;
  router: Router;

  constructor(
    router: Router,
    private readonly injector: Injector
  ) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterNavigationChange) {
          this.keepAfterNavigationChange = false;
        } else {
          this.subject.next('');
        }
      }
    });
  }

  /**
   * @description Shows a success message in green.
   * @param string message The body content of the toast.
   * @param string title The title of the toast.
   * @param string keepAfterNavigationChange If set to true, the message will persist after navigation occurs.
   */
  success(message: string, title = 'Success', keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'Success', text: message, title });
  }

  /**
   * @description Shows an error message in red.
   * @param string message The body content of the toast.
   * @param string title The title of the toast.
   * @param string keepAfterNavigationChange If set to true, the message will persist after navigation occurs.
   */
  error(message: string, title = 'Error', keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'Error', text: message, title });
  }

  parseError(error: any, title = 'Error', keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;

    let message = '';
    if (error instanceof HttpErrorResponse) {
      const response: HttpErrorResponse = error;
      const errorDetails = response.error;
      if (errorDetails) {
        if (errorDetails.Error) {
          message = errorDetails.Error;
        } else if (errorDetails.title) {
          message = errorDetails.title;
        } else {
          message = response.message;
        }
      } else {
        message = response.message;
      }
    } else if (error.message) {
      message = error.message;
    } else {
      message = JSON.parse(error._body).Message;
    }

    this.subject.next({ type: 'Error', text: message, title });
  }

  /**
   * @description Shows a loading message.
   * @param string message The body content of the toast.
   * @param string title The title of the toast.
   * @param string keepAfterNavigationChange If set to true, the message will persist after navigation occurs.
   */
  loading(message: string, title = 'Processing', keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'Loading', text: message, title });
  }

  /** @description Clears all previous messages. */
  clear() {
    this.subject.next({ type: 'clear', text: '' });
  }

  /** @description Gets the last message. */
  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  handleError(error: any) {
    this.appEventsManager = this.injector.get(AppEventsManager);
    this.appInsightsService = this.injector.get(AppInsightsService);
    this.appInsightsService.logError(error);
    const internalError = new Error();
    try {

      if (error.status === 403) {
        this.router = this.injector.get(Router);
        this.router.navigate(['/access-denied', error.error.Error]);
        return;
      }

      let offendingComponentName = String.Empty;
      if (error instanceof TypeError) {
        const typeError = error as TypeError;
        if (typeError.stack && typeError.stack.includes('Component')) {
          const originalIndex = typeError.stack.lastIndexOf('Component');

          let startIndex = originalIndex;
          let character = String.Empty;

          while (character != ' ') {
            character = typeError.stack[startIndex];
            if (character != ' ') {
              startIndex--;
            }
          }

          offendingComponentName = typeError.stack.substring(startIndex + 1, originalIndex) + 'Component';
        }
      }

      if (error instanceof HttpErrorResponse) {
        const response: HttpErrorResponse = error;
        const errorDetails = response.error;
        internalError.message = errorDetails.Error;
        internalError.stackTrace = errorDetails.Details;
      } else if (error.message) {
        if (offendingComponentName && offendingComponentName != String.Empty) {
          internalError.message = offendingComponentName + ': ' + error.message;
        } else {
          internalError.message = error.message;
        }
      } else {
        internalError.message = JSON.parse(error._body).Message;
      }

      if (internalError.message && internalError.message.indexOf(': 401 Unauthorized') !== -1) {
        this.router = this.injector.get(Router);
        this.router.navigate(['/sign-in']);
        return;
      } else {
        this.showError(internalError);
      }

    } catch (innerError) {
      try {
        if (error.originalStack) {
          internalError.message = error.originalStack;
        } else if (error.message) {
          internalError.message = error.message;
        } else {
          internalError.message = 'An unknown error has occured :(';
        }
      } catch (innerInnerError) {
        internalError.message = 'An unknown error has occured :(';
      }

      this.showError(internalError);
    }
  }

  private showError(error: Error): void {
    this.error(`${error.message.substring(0, 256)}...`);
    this.appEventsManager.loadingStop();
    this.appEventsManager.showError(error);
  }
}
