import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ClaimEarningService } from 'projects/claimcare/src/app/claim-manager/Services/claim-earning.service';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { EventModel } from '../../../../entities/personEvent/event.model';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { AccidentService } from 'projects/claimcare/src/app/claim-manager/Services/accident.service';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-claim-pd-award-calculation',
  templateUrl: './claim-pd-award-calculation.component.html',
  styleUrls: ['./claim-pd-award-calculation.component.css'],
})
export class ClaimPdAwardCalculationComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading PD lump sum award calculation...please wait');

  form: UntypedFormGroup;
  filteredUsers: User[];
  users: User[];
  user: User;
  selectCCAUser: User;
  loggedInUerId = 0;
  calculatedPdAward: number;
  calculationDetails: string;
  earning: number;
  nettAssessedPdPercentage: number;
  payee: string;

  selectedPersonEvent: PersonEventModel;
  event: EventModel;
  selectedMedicalReport: FinalMedicalReportForm;  

  constructor(public dialogRef: MatDialogRef<ClaimPdAwardCalculationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder,
    public userService: UserService,
    protected claimEarningService: ClaimEarningService,
    private claimCareService: ClaimCareService,
    private claimAccidentService: AccidentService) { }

  ngOnInit(): void {
    this.isLoading$.next(true);
    this.selectedPersonEvent = this.data?.selectedPersonEvent;
    this.createForm();
    this.setData();
    this.claimCareService.getEvent(this.selectedPersonEvent.eventId).pipe(
      switchMap((event: EventModel) => {
        if (!event) {
          this.isLoading$.next(false);
          return of(null);
        }
        this.event = event;
        return this.claimAccidentService.GetFinalMedicalReportForms(this.selectedPersonEvent.personEventId);
      }),
      catchError(error => {
        this.isLoading$.next(false);
        return of(null);
      })
    ).subscribe((result: any) => {
      if (result) {
        this.selectedMedicalReport = result[result.length - 1];
        this.selectedPersonEvent.finalMedicalReport = this.selectedMedicalReport;
      }
      this.isLoading$.next(false);
    });
  }

  setData() {
    this.nettAssessedPdPercentage = this.data.nettAssessedPdPercentage;
    this.earning = this.data.earning;
    this.calculatedPdAward = this.data.calculatedPdAward;
    this.calculationDetails = this.data.calcOperands;
    this.payee = this.data.payee;
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      nettAssessedPdPercentage: [{ value: '', disabled: false }],
      calculatedPdAward: [{ value: '', disabled: false }],
      payee: [{ value: '', disabled: false }],
      calculationDetails: [{ value: '', disabled: false }],
    });
  }

  submit() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
