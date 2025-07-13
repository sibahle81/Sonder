import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { OverPaymentForm } from '../../models/overpayment-form.interface';

@Component({
  selector: 'app-overpayment-form',
  templateUrl: './overpayment-form.component.html',
  styleUrls: ['./overpayment-form.component.css']
})
export class OverpaymentFormComponent implements OnInit {

  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() form: FormGroup;

  constructor(private readonly _fb: FormBuilder,) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    if(!this.isWizard) {
      this.form = this._fb.group<OverPaymentForm>({
        ledgerId: new FormControl(null, { validators: Validators.required }),
        deceasedNames: new FormControl(null, { validators: Validators.required }),
        dateOfDeath: new FormControl(null, { validators: Validators.required }),
        lastPaymentDate: new FormControl(null, { validators: Validators.required }),
        normalMonthlyPension: new FormControl(null, { validators: Validators.required }),
        overpaymentAmount: new FormControl(null, { validators: Validators.required }),
      });
    }

  }

}
