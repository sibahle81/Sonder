import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ValidateSAIdNumber } from 'projects/shared-utilities-lib/src/lib/validators/id-number-sa.validator';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from '../../shared/entities/personEvent/event.model';

@Component({
  selector: 'claim-claimant-details',
  templateUrl: './claim-claimant-details.component.html',
  styleUrls: ['./claim-claimant-details.component.css']
})
export class ClaimClaimantDetailsComponent implements OnInit, OnChanges {

  @Input() event: EventModel = new EventModel();
  @Input() isWizard: boolean;
  @Input() isReadOnly = false;

  @Output() isValidEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() isPristineEmit: EventEmitter<boolean> = new EventEmitter();

  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: UntypedFormGroup;
  startDate = new Date(1990, 0, 1);
  claimantDetails = new RolePlayer();
  hideForm = true;
  currentUser: string;

  isValid = false;
  hasPermission = true;
  requiredPermission = '';

  isViewMode: boolean;
  isEditMode: boolean;
  isAddMode: boolean;
  viewClaimantDetails: boolean;
  idTypes: Lookup[] = [];

  public skillTypes = [
    { name: 'Skilled', value: '1' },
    { name: 'UnSkilled', value: '2' },
  ];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly lookUpService: LookupService,
    private readonly alert: ToastrManager,
  ) { }

  ngOnInit() {
    this.hasPermission = this.checkPermissions(this.requiredPermission);
    // this.createForm();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.event) { return; }
    this.createForm();
    this.claimantDetails = new RolePlayer();
  }

  createForm() {
    this.form = this.formBuilder.group({
    });
  }

  readForm() {
  }

  patchForm() {
  }

  delete() {
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  // toggleInsuredlife() {
  //   this.resetForm();
  //   this.hideForm = !this.hideForm;
  //   this.viewInsuredLifeDetails = !this.viewInsuredLifeDetails;
  //   this.insuredLife = insuredLife;
  //   this.patchForm();
  // }

  add() {
    this.isAddMode = true;
    this.toggle();
  }

  toggle() {
    this.hideForm = !this.hideForm;
    this.viewClaimantDetails = !this.viewClaimantDetails;
    this.reset();
  }


  cancel() {
    this.toggle();
  }

  reset() {
    // this.form.controls.firstname.reset();
  }

  getLookups() {
    this.loadIdTypes();
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

  checkPermissions(permission: string): boolean {
    // return userUtility.hasPermission(permission);
    return true;
  }

  view() {
    this.isViewMode = !this.isViewMode;
  }

  edit() {
    this.isEditMode = true;
    // this.enableFormControl('firstname');

  }

  resetForm() {
    this.isEditMode = false;
    // this.disableFormControl('firstname');
  }

  loadIdTypes(): void {
    this.lookUpService.getIdTypes().subscribe(data => {
      this.idTypes = data;
    });
  }

  idTypeChanged(value: any) {
    const type = value.value ? value.value : value;
    this.form.get('idNumber').clearValidators();
    if (type === IdTypeEnum.SA_ID_Document) {
      this.form.get('idNumber').setValidators([ValidateSAIdNumber, Validators.required]);
    } else {
      this.form.get('idNumber').setValidators([Validators.required, Validators.minLength(3)]);
    }
    this.form.get('idNumber').updateValueAndValidity();
  }

  getSkillName(skilltype: number): string {
    if (skilltype === 1) {
      return 'Skilled';
    } else {
      return 'UnSkilled';
    }
  }

  save() {
    this.isSaving$.next(true);
    this.isEditMode = false;
    this.isAddMode = false;

    this.readForm();
  }

}
