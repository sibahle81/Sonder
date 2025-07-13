import { AbstractControl } from '@angular/forms';
import { map } from 'rxjs/operators';

export class TrimUtil {
    static   trimField(field: AbstractControl): void {
        field.valueChanges
          .pipe(
            map((value: string) => value.trim())
          );
      }
}