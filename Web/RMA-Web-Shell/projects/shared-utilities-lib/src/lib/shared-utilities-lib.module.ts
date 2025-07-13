import { NgModule } from '@angular/core';
import { DateDirective } from './directives/date.directive';
import { FileUtil } from './file-utility/file-utility';
import { FocusDirective } from './directives/focus.directive';
import { Format } from './pipes/format';
import { DecimalNumberDirective } from './directives/decimal-number.directive';
import { SixDigitDecimalDirective } from './directives/six-digit-decimal.directive';
import { TenDigitDecimalDirective } from './directives/ten-digit-decimal.directive';
import { MaterialsModule } from './modules/materials.module';
import { NumberOnlyDirective } from './directives/number-only.directive';
import { RangeValidatorDirective } from './validators/range-validator.directive';
import { ReplacePipe } from './pipes/replace-pipe';
import { SafeHtmlPipe } from './pipes/safe-html';
import { UniqueValueDirective } from './validators/unique-value.directive';
import { AlphaOnlyDirective } from './directives/alphaonly.directives';
import { PercentageDirective } from './directives/percentage.directive';
import { SortDirective } from './directives/sort.directive';
import { ThreeDecimalNumberDirective } from "./directives/three.decimal-number.directive";
import { DecimalNineFourDirective } from './directives/decimal-nine-four.directive';

@NgModule({
  declarations: [
    DateDirective,
    DecimalNumberDirective,
    PercentageDirective,
    FocusDirective,
    Format,
    SixDigitDecimalDirective,
    TenDigitDecimalDirective,
    NumberOnlyDirective,
    RangeValidatorDirective,
    ReplacePipe,
    SafeHtmlPipe,
    UniqueValueDirective,
    AlphaOnlyDirective,
    SortDirective,
    ThreeDecimalNumberDirective,
    DecimalNineFourDirective
  ],
  imports: [
    MaterialsModule
  ],
  exports: [
    DateDirective,
    DecimalNumberDirective,
    PercentageDirective,
    FocusDirective,
    Format,
    SixDigitDecimalDirective,
    TenDigitDecimalDirective,
    MaterialsModule,
    NumberOnlyDirective,
    RangeValidatorDirective,
    SafeHtmlPipe,
    UniqueValueDirective,
    ReplacePipe,
    AlphaOnlyDirective,
    SortDirective,
    ThreeDecimalNumberDirective,
    DecimalNineFourDirective
  ],
  providers: [
    FileUtil
  ]
})
export class SharedUtilitiesLibModule { }
