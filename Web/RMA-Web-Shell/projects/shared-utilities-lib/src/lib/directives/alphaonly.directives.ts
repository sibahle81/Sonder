//wiki: http://bit.ly/2CTG7XR
//Restricts input values to text only.

import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[AlphaOnly]'
})
export class AlphaOnlyDirective {
    private regex = new RegExp(/^[a-zA-Z\s]+$/);
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
            ((event.ctrlKey === true || event.metaKey === true) && (event.key === 'a' || event.key === 'v' || event.key === 'c' || event.key === 'z'))) {
            return;
        }
        // Allow Backspace, tab, end, and home keys
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }
        // space
        if (event.key === ' ') {
            return;
        }

        // Do not use event.keycode this is deprecated.
        // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
        const current: string = this.el.nativeElement.value;
        // We need this because the current value on the DOM element
        // is not yet updated with the value from this event
        const next = current.concat(event.key);
        if (next && !String(next).match(this.regex)) {
            event.preventDefault();
        }
    }
}
