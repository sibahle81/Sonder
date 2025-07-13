// wiki: http:// bit.ly/2CRvyUc
// Restricts input values to decimal numbers only.

import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[Percentage]'
})
export class PercentageDirective {
    // Allow decimal numbers. The \. is only allowed once to occur
    private regex = new RegExp(/^[0-9]{1,2}(\.[0-9]{0,2}){0,1}$/g);

    // Allow key codes for special events. Reflect :
    // Backspace, tab, end, home
    private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Left', 'Right'];

    constructor(private readonly el: ElementRef) {
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        // Allow Backspace, tab, end, and home keys
        if ((this.specialKeys.indexOf(event.key) !== -1) ||
            // Allow: Ctrl+A,Ctrl+C,Ctrl+V, Command+A
            ((event.ctrlKey === true || event.metaKey === true)
                && (event.key === 'a' || event.key === 'v' || event.key === 'c' || event.key === 'z'))) {
            return;
        }
        // Do not use event.keycode this is deprecated.
        // See: https:// developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
        const current: string = this.el.nativeElement.value;
        // We need this because the current value on the DOM element
        // is not yet updated with the value from this event
        let next = '';
        if (event.key === 'Decimal') {// to allow decimal point from a number pad
            next = current.concat('.');
        } else {
            next = current.concat(event.key);
        }
        if (current === '0' && next === '00') {
            event.preventDefault();
        }
        if (next && !String(next).match(this.regex)) {
            event.preventDefault();
        }
    }

    // Prevent paste of silly data!
    @HostListener('paste', ['$event']) onEvent($event: any) {
        const data = $event.clipboardData.getData('text');
        if (!String(data).match(this.regex)) {
            event.preventDefault();
        }
    }
}
