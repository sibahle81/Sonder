import { ViewChild, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorComponent } from 'src/app/views/error/error.component';

@Directive()
export abstract class ModuleMenuComponent {
    @ViewChild(ErrorComponent, { static: false }) errorComponent: ErrorComponent;
    loadingMessage: string;
    error: Error;

    protected constructor(
        protected readonly router: Router) {
    }
}
