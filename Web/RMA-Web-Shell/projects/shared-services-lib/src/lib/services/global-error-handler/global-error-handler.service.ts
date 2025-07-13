import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';


@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler extends ErrorHandler {
  alertService: AlertService;


  constructor(private readonly injector: Injector) {
    super();
  }

  handleError(error: any) {
    this.alertService = this.injector.get(AlertService);
    this.alertService.handleError(error);
  }
}
