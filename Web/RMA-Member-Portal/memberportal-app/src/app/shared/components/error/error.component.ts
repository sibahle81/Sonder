// wiki:
// The error component displays the default error message to the user.

import { Component } from '@angular/core';
import { Error } from '../../models/error.model';

/** @description The error component displays the default error message to the user. */
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'error',
    templateUrl: './error.component.html'
})
export class ErrorComponent {
    error: Error;

    showError(error: Error): void {
        this.error = error;
    }
}
