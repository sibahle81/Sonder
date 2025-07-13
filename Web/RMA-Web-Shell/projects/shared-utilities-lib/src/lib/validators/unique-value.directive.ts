import { Input, Directive  } from '@angular/core';
import { AbstractControl,  ValidationErrors, AsyncValidator, NG_ASYNC_VALIDATORS } from '@angular/forms';
import { timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UniqueValueService } from './unique-value.service';

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

    validate(control: AbstractControl): Promise<ValidationErrors> | import ('rxjs').Observable<ValidationErrors> {
        return timer(1000).pipe(switchMap(() => {
            return this.uniqueValueService.checkExists(this.table, this.field, this.serviceType, control.value, this.metaValue).pipe(map(
                value => {
                  return value && this.currentValue !== control.value.toLowerCase() ? {isTaken: true} : null;
                }
              ));
            }));
        }
}
