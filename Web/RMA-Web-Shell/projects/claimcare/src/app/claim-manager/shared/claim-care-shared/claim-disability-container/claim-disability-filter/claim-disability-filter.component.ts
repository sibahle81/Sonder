import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { MatDialog } from '@angular/material/dialog';
import { ClaimDisabilityTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-disabiity-type-enum';
import { ClaimDisabilityDialogComponent } from '../claim-disability-dialog/claim-disability-dialog.component';
import { PdAward } from '../claim-pdlumpsum-award/PdAward';
import { ClaimEmailReferralDialogComponent } from '../claim-email-referral-dialog/claim-email-referral-dialog.component';
import { ClaimDisabilityAssessment } from '../../../entities/claim-disability-assessment';
import { ClaimHearingAssessment } from '../../../entities/claim-hearing-assessment';
import { DisabilityFormService } from '../disability-form.service';

@Component({
  selector: 'claim-disability-filter',
  templateUrl: './claim-disability-filter.component.html',
  styleUrls: ['./claim-disability-filter.component.css']
})
export class ClaimDisabilityFilterComponent extends UnSubscribe implements OnChanges {

  @Input() user: User;
  @Input() personEvent: PersonEventModel;

  @Output() disabilityTypeEmit: EventEmitter<ClaimDisabilityTypeEnum> = new EventEmitter();
  @Output() emitPensionerInterviewForm: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  viewPermission = 'View Claim Disability Filter';
  editPermission = 'Edit Claim Disability Filter';
  
  loggedInUserRole: string;
  form: any;
  DisabilityTypes: ClaimDisabilityTypeEnum[];
  searchTerm = '';
  disabilityType: ClaimDisabilityTypeEnum;

  addDisabilityPermission = false;
  activatePensionInterview = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    public dialog: MatDialog,
    private disabilityFormService: DisabilityFormService,
  ) {
    super();
    this.getLookups();
  }

  ngOnChanges(): void {
    if (!this.user) { return; }
    this.createForm();
    this.configureSearch();
    this.activatePension();
    this.isLoading$.next(false);
  }

  getLookups() {
    this.DisabilityTypes = this.ToArray(ClaimDisabilityTypeEnum);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  configureSearch() {
    this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
      this.search(response as string);
    });
  }

  search(searchTerm: string) {
    this.searchTerm = searchTerm;
    if (!this.searchTerm || this.searchTerm === '') {
    }
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      disabilityTypeFilter: [{ value: null, disabled: false }],
      searchTerm: [{ value: null, disabled: false }]
    });
  }

  disabilityTypeChanged($event: ClaimDisabilityTypeEnum) {
    this.disabilityType = $event;
    let selectedType = +ClaimDisabilityTypeEnum[this.disabilityType];
    this.disabilityTypeEmit.emit($event);
    this.addDisabilityPermission = false;

    switch (selectedType) {
      case ClaimDisabilityTypeEnum.DisabilityAssessment:
        this.addDisabilityPermission = true;
        break;
      case ClaimDisabilityTypeEnum.HearingAssessment:
        this.addDisabilityPermission = true;
        break;
    }
  }

  openDisabilityDialog() {
    const dialogRef = this.dialog.open(ClaimDisabilityDialogComponent, {
      width: '80%',
      maxHeight: '700px',
      disableClose: true,
      data: {
        disabilityType: this.disabilityType,
        claimDisability: this.getDisabilityType(),
        personEvent: this.personEvent,
        user: this.user,
        isReadOnly: false,
      } 
    });

    dialogRef.afterClosed().subscribe(result => {
      this.disabilityTypeChanged(this.disabilityType);
    });
  }

  activatePension() {
    this.disabilityFormService.activatePensionInterview$.subscribe(result => {
      this.activatePensionInterview = result;
    });
  }

  openPensionInterviewForm() {
    this.emitPensionerInterviewForm.emit(true);
  }

  openEmailReferralDialog() {
    const dialogRef = this.dialog.open(ClaimEmailReferralDialogComponent, {
      width: '60%',
      maxHeight: '700px',
      disableClose: true,
      data: {
        personEvent: this.personEvent,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {}
      this.disabilityTypeChanged(this.disabilityType);
    });
  }

  getDisabilityType() {
    switch (+ClaimDisabilityTypeEnum[this.disabilityType]) {
      case ClaimDisabilityTypeEnum.DisabilityAssessment:
        return new ClaimDisabilityAssessment();
      case ClaimDisabilityTypeEnum.PDLumpAward:
        return new PdAward();
      case ClaimDisabilityTypeEnum.HearingAssessment:
        return new ClaimHearingAssessment();
      default:
        break;
    }
  }
}
