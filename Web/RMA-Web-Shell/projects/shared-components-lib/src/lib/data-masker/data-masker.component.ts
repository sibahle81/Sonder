import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'data-masker',
  templateUrl: './data-masker.component.html',
  styleUrls: ['./data-masker.component.css']
})
export class DataMaskerComponent extends PermissionHelper implements OnChanges {

  @Input() text: string; // required input: text to me masked
  @Input() requiredPermissionToViewMaskedData: string; // optional input: will allow the user with this permission to view the masked data by hovering over the masked data. If none is passed in then anyone can view the data by hovering over the masked text

  numberOfCharatersToDisplayAtSuffix = 3; // default: show last 3 characters unless special formatting applies
  maskedText: string;
  displayText: string;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.text?.length > 0) {
      this.applyMask();
    } else {
      this.isLoading$.next(false);
    }
  }

  applyMask() {
    this.isLoading$.next(true);
    this.maskedText = '';

    const index = this.text.indexOf('@');
    if (index > -1) {
      // Email case
      this.numberOfCharatersToDisplayAtSuffix = this.text.length - index;
    } else if (/^\+?(\d{1,3})?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})$/.test(this.text)) {
      // Phone number case
      this.numberOfCharatersToDisplayAtSuffix = 4;
    } else if (this.text.length <= this.numberOfCharatersToDisplayAtSuffix) {
      this.numberOfCharatersToDisplayAtSuffix = 0;
    }

    // Masking logic
    const maskLength = Math.min(this.text.length - this.numberOfCharatersToDisplayAtSuffix, 5);
    this.maskedText = '*'.repeat(maskLength) + this.text.slice(-this.numberOfCharatersToDisplayAtSuffix);

    this.displayText = this.maskedText;
    this.isLoading$.next(false);
  }

  removeMask() {
    if (this.requiredPermissionToViewMaskedData && this.userHasPermission(this.requiredPermissionToViewMaskedData)) {
      this.displayText = this.format(this.text);
    }

    if (!this.requiredPermissionToViewMaskedData) {
      this.displayText = this.format(this.text);
    }
  }

  format(text: string) {
    if (!text) return 'N/A';

    // South African ID number formatting
    const cleaned = text.replace(/\D/g, '');  // Remove all non-numeric characters
    if (cleaned.length === 13 && /^\d+$/.test(cleaned)) {
        return `${cleaned.substring(0, 6)}-${cleaned.substring(6, 10)}-${cleaned.substring(10, 11)}${cleaned.substring(11, 13)}`;
    }

    // Phone number formatting
    const phoneCleaned = text.replace(/\D/g, '');
    const phoneMatch = phoneCleaned.match(/^\+?(\d{1,3})?(\d{3})(\d{3})(\d{4})$/);
    if (phoneMatch) {
        const intlCode = phoneMatch[1] ? `+${phoneMatch[1]} ` : '';
        return `${intlCode}(${phoneMatch[2]}) ${phoneMatch[3]}-${phoneMatch[4]}`;
    }

    // Add more formatters here...

    return text; // Default formatting
}

}
