// wiki: http:// bit.ly/2CTG7XR
// Restricts input values to natural numbers only.

import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[NumberOnly]'
})
export class NumberOnlyDirective {
    private regex = new RegExp(/^[0-9][0-9]*$/);
    // Allow key codes for special events. Reflect :
    // Backspace, tab, end, home
    private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Left', 'Right'];

    constructor(private readonly el: ElementRef) {
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        // Allow Backspace, tab, end, and home keys
        if ((this.specialKeys.indexOf(event.key) !== -1) ||
            // Allow: Ctrl+A,Ctrl+C,Ctrl+Z,Ctrl+V, Command+A
            ((event.ctrlKey === true || event.metaKey === true)
            && (event.key === 'a' || event.key === 'v' || event.key === 'c' || event.key === 'z'))) {
            return;
        }
        // Allow Backspace, tab, end, and home keys
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }

        // Do not use event.keycode this is deprecated.
        // See: https:// developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
        const current: string = this.el.nativeElement.value;
        // We need this because the current value on the DOM element
        // is not yet updated with the value from this event
        const next = current.concat(event.key);
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
