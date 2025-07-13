import { Directive, Optional, Inject, ViewContainerRef, ComponentFactoryResolver, ComponentRef, Input, Host } from '@angular/core';
import { NgControl, ControlContainer } from '@angular/forms';
import { FORM_ERRORS } from './form.errors';
import { merge, EMPTY, Observable } from 'rxjs';
import { FormSubmitDirective } from './form-submit.directive';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[formControl], [formControlName]'
})
export class ControlErrorsDirective {
  container: ViewContainerRef;
  submit$: Observable<Event>;
  @Input() customErrors = {};
  constructor(
    private vcr: ViewContainerRef,
    private resolver: ComponentFactoryResolver,
    @Inject(FORM_ERRORS) private errors,
    @Optional() @Host() private form: FormSubmitDirective,
    private controlDir: NgControl) {
    this.submit$ = this.form ? this.form.submit$ : EMPTY;
  }

  ngOnInit() {
    merge(
      this.submit$,
      this.control.valueChanges
    ).pipe( 
      takeUntil(this.submit$)
      ).subscribe((v) => {
        const controlErrors = this.control.errors;
        if (controlErrors) {
          const firstKey = Object.keys(controlErrors)[0];
          const getError = this.errors[firstKey];
          const text = this.customErrors[firstKey] || getError(controlErrors[firstKey]);
          this.setError(text);
        } 
      })
  }

  get control() {
    return this.controlDir.control;
  }

  setError(text: string) {
  }

  ngOnDestroy() { }

}
