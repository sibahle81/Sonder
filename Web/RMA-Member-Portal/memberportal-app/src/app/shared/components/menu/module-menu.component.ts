import { Directive, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorComponent } from '../error/error.component';
/* tslint:disable */
@Directive()
export abstract class ModuleMenuComponent {
    @ViewChild(ErrorComponent) errorComponent: ErrorComponent;
    loadingMessage: string;
    error: Error;

    protected constructor(
        protected readonly router: Router) {
    }
}
