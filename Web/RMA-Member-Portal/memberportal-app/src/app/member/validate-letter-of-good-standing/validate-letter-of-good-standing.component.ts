import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LetterOfGoodStandingService } from 'src/app/shared/services/letter-of-good-standing.service';

@Component({
  templateUrl: './validate-letter-of-good-standing.component.html',
  styleUrls: ['./validate-letter-of-good-standing.component.scss']
})
export class ValidateLetterOfGoodStandingComponent implements OnInit {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  form: FormGroup;

  isValid: boolean;
  showResult: boolean;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly letterOfGoodStandingService: LetterOfGoodStandingService,
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      certificateNo: [{ value: null, disabled: false }]
    });

    this.isLoading$.next(false);
  }

  readForm(): string {
    return this.form.controls.certificateNo.value;
  }

  validate() {
    this.showResult = false;
    this.isLoading$.next(true);

    this.isValid = false;
    var certificateNo = this.readForm();

    this.letterOfGoodStandingService.validateLetterOfGoodStanding(certificateNo).subscribe(result => {
      this.isValid = result
      this.showResult = true;
      this.isLoading$.next(false);
    });
  }

  reset() {
    this.showResult = false;
    this.isValid = false;
  }
}
