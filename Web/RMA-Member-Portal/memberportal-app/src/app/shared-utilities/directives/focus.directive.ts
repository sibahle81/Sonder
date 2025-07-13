import { Directive, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[myFocus]' })
export class FocusDirective implements OnInit {

    @Input('myFocus') isFocused: boolean;

    constructor(private hostElement: ElementRef, private renderer: Renderer2) { }

    ngOnInit() {
        if (this.isFocused) {
            this.renderer.selectRootElement(this.hostElement.nativeElement).focus();
        }
    }
}
