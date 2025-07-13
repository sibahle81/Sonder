import { Input, Directive } from '@angular/core';
import { AbstractControl, ValidationErrors, AsyncValidator, NG_ASYNC_VALIDATORS } from '@angular/forms';
import { UniqueValueService } from './unique-value.service';
import { timer } from 'rxjs';
import 'rxjs/add/operator/switchMap';

@Directive({
    selector: '[unique-validator]',
    providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: UniqueValueDirective, multi: true }]
})

export class UniqueValueDirective implements AsyncValidator {
    @Input() table: string;
    @Input() field: string;
    @Input() currentValue: string;
    @Input() serviceType: number;
    @Input() metaValue: string;
    values: string[];

    constructor(
        private readonly uniqueValueService: UniqueValueService) {
    }

    validate(control: AbstractControl): Promise<ValidationErrors> | import('rxjs').Observable<ValidationErrors> {
        return timer(1000).switchMap(() => {
            return this.uniqueValueService.checkExists(this.table, this.field, this.serviceType, control.value, this.metaValue).map(
                value => {
                    return value && this.currentValue !== control.value.toLowerCase() ? { isTaken: true } : null;
                }
            );
        });
    }
}
