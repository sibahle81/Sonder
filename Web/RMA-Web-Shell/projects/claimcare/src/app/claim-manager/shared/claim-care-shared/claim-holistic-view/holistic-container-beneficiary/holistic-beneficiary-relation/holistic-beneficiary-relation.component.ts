import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerRelation } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-relation';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'holistic-beneficiary-relation',
  templateUrl: './holistic-beneficiary-relation.component.html',
  styleUrls: ['./holistic-beneficiary-relation.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class HolisticBeneficiaryRelationComponent extends UnSubscribe implements OnChanges {

  @Input() beneficiary: RolePlayer;
  @Input() toRolePlayerId: number;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() isStp = false;

  @Output() emitRelation: EventEmitter<RolePlayer> = new EventEmitter();
  
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: UntypedFormGroup;
  isSpouseError: boolean;
  relationTypes: BeneficiaryTypeEnum[];
  hasAddPermission = false;
  rolePlayerRelation: RolePlayerRelation;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly rolePlayerService: RolePlayerService,
  ) {
    super();
    this.getLookups();
  }

  getLookups() {
    this.relationTypes = this.ToArray(BeneficiaryTypeEnum);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setPermissions();
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      relationType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
    });
    this.patchForm();
  }

  patchForm() {
    if (this.beneficiary) {
      this.form.patchValue({
        relationType: this.beneficiary.fromRolePlayers.length > 0 ? BeneficiaryTypeEnum[this.beneficiary.fromRolePlayers[0].rolePlayerTypeId] : null,
      });
    }
    this.isLoading$.next(false)
  }

  setPermissions() {
    this.hasAddPermission = this.userHasPermission('');
  }

  readForm() {
    const formDetails = this.form.getRawValue();

    if (this.beneficiary.fromRolePlayers && this.beneficiary.fromRolePlayers.length === 0) {
      this.rolePlayerRelation = new RolePlayerRelation();
      this.rolePlayerRelation.fromRolePlayerId = this.beneficiary.rolePlayerId;
      this.rolePlayerRelation.toRolePlayerId = this.toRolePlayerId;
      this.rolePlayerRelation.rolePlayerTypeId = +BeneficiaryTypeEnum[formDetails.relationType];
      this.beneficiary.fromRolePlayers.push(this.rolePlayerRelation);
    } else {
      this.beneficiary.fromRolePlayers[0].rolePlayerTypeId = +BeneficiaryTypeEnum[formDetails.relationType];
    }

    if (!this.isWizard) {
      this.updateRelation(this.beneficiary.fromRolePlayers[0]);
    } else {
      this.isSaving$.next(false);
      this.emitRelation.emit(this.beneficiary);
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getRelationType(type: any) {
    return this.formatText(type);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  updateRelation(relation: RolePlayerRelation) {
    this.rolePlayerService.updateRolePlayerRelations(relation).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
      if (result) {
        this.reset();
        this.isSaving$.next(false);
        this.emitRelation.emit(this.beneficiary);
      }
    });
  }

  reset() {
    this.isReadOnly = true;
    this.createForm();
  }

  cancel() {
    this.reset();
  }

  edit() {
    this.isReadOnly = false;
    this.createForm();
  }

  save() {
    this.isSaving$.next(true);
    this.readForm();
  }
}
