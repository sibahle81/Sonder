import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyComma'
})
export class CurrencyCommaPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
