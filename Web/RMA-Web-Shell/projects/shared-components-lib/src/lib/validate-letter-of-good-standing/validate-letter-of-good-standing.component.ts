import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { LetterOfGoodStandingService } from 'projects/clientcare/src/app/member-manager/services/letter-of-good-standing.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'validate-letter-of-good-standing',
  templateUrl: './validate-letter-of-good-standing.component.html',
  styleUrls: ['./validate-letter-of-good-standing.component.css']
})
export class ValidateLetterOfGoodStandingComponent implements OnInit {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  form: UntypedFormGroup;

  isValid: boolean;
  showResult: boolean;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
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
}
