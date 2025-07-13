import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlphaOnlyDirective } from './directives/alphaonly.directives';
import { DateDirective } from './directives/date.directive';
import { DecimalNumberDirective } from './directives/decimal-number.directive';
import { FocusDirective } from './directives/focus.directive';
import { FourDigitDecimalDirective } from './directives/four-digit-decimal.directive';
import { NumberOnlyDirective } from './directives/number-only.directive';
import { PercentageDirective } from './directives/percentage.directive';
import { Format } from './pipes/format';
import { ReplacePipe } from './pipes/replace-pipe';
import { SafeHtmlPipe } from './pipes/safe-html';
import { RangeValidatorDirective } from './validators/range-validator.directive';
import { UniqueValueDirective } from './validators/unique-value.directive';



@NgModule({
  declarations: [
    DateDirective,
    DecimalNumberDirective,
    PercentageDirective,
    FocusDirective,
    Format,
    FourDigitDecimalDirective,
    NumberOnlyDirective,
    RangeValidatorDirective,
    ReplacePipe,
    SafeHtmlPipe,
    UniqueValueDirective,
    AlphaOnlyDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DateDirective,
    DecimalNumberDirective,
    PercentageDirective,
    FocusDirective,
    Format,
    FourDigitDecimalDirective,
    NumberOnlyDirective,
    RangeValidatorDirective,
    ReplacePipe,
    SafeHtmlPipe,
    UniqueValueDirective,
    AlphaOnlyDirective
  ]
})
export class SharedUtilitiesModule { }
