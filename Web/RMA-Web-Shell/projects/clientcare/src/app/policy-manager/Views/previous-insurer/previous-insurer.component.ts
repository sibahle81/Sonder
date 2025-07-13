import { PreviousInsurerRolePlayer } from './../../shared/entities/previous-insurer-roleplayer';
import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Case } from '../../shared/entities/case';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from './../../../../../../shared-models-lib/src/lib/lookup/lookup';
import { UntypedFormBuilder, Validators, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';

@Component({
  selector: 'previous-insurer',
  templateUrl: './previous-insurer.component.html',
  styleUrls: ['./previous-insurer.component.css'],
  providers: [
    [DatePipe],
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class PreviousInsurerComponent implements OnInit, OnChanges {

  @Input() case: Case;
  @Input() isEditable = true;
  @Input() context: RolePlayerTypeEnum[] = [RolePlayerTypeEnum.MainMemberSelf, RolePlayerTypeEnum.Spouse, RolePlayerTypeEnum.Extended, RolePlayerTypeEnum.Child];
  @Input() isMainMember = false;

  hidden = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isReadOnlyMode = true;

  insuredLives: RolePlayer[] = [];
  previousInsurerRolePlayers: PreviousInsurerRolePlayer[] = [];
  insurers: Lookup[] = [];

  mainMemberInsurer: Lookup;

  form: UntypedFormGroup;

  minDate: Date;
  maxDate: Date;

  selectedStartDate: Date;
  selectedEndDate: Date;
  selectedRoleplayerId: number;
  selectedInsurerId: number;
  selectedInsuredLifeType: RolePlayerTypeEnum;

  constructor(
    private readonly lookupService: LookupService,
    private readonly formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit() {
    this.getPreviousInsurers();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group(
      {
        insurers: new UntypedFormControl('', [Validators.required]),
        insuredLives: new UntypedFormControl('', [Validators.required]),
        policyNumber: new UntypedFormControl(''),
        startDate: new UntypedFormControl('', [Validators.required]),
        endDate: new UntypedFormControl('', [Validators.required]),
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.case) { return; }

    this.getPreviousInsuredForInsuredLives();
  }

  getPreviousInsurers() {
    this.lookupService.getInsurers().subscribe(lookups => {
      this.insurers = lookups;
      this.createForm();
      this.setInsuredLifeDefaults();
      this.isLoading$.next(false);
    });
  }

  setInsuredLifeDefaults() {
    if (this.isMainMember) { return; }
    if (!this.isEditable) { return; }

    const latestInsurer = this.case.mainMember.previousInsurerRolePlayers
      ? this.case.mainMember.previousInsurerRolePlayers[this.case.mainMember.previousInsurerRolePlayers.length - 1]
      : null;
    if (!latestInsurer) { return; }

    this.mainMemberInsurer = this.insurers.find(s => s.id === latestInsurer.previousInsurerId);
    this.selectedInsurerId = this.mainMemberInsurer.id;

    this.form.patchValue({
      insurers: this.mainMemberInsurer.id,
      policyNumber: latestInsurer.policyNumber
    });

    this.form.get('insurers').disable();
    this.form.get('policyNumber').disable();
  }

  getRoleplayerType(roleplayerTypeId: number): string {
    const text = RolePlayerTypeEnum[roleplayerTypeId];
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getInsurerName(previousInsurerId: number) {
    return (this.insurers.find(s => s.id === previousInsurerId)).name;
  }

  reset() {
    this.previousInsurerRolePlayers = [];
    this.insuredLives = [];

    this.maxDate = null;
    this.minDate = null;

    if (!this.form) { return; }
    this.form.reset();
  }

  getPreviousInsuredForInsuredLives() {
    this.reset();

    if (this.context.includes(RolePlayerTypeEnum.MainMemberSelf)) {
      if (this.case.mainMember.previousInsurerRolePlayers != null) {
        this.case.mainMember.rolePlayerType = RolePlayerTypeEnum.MainMemberSelf;
        this.insuredLives.push(this.case.mainMember);
        if (this.case.mainMember.previousInsurerRolePlayers) {
          this.case.mainMember.previousInsurerRolePlayers.forEach(p => {
            p.insuredLifeType = RolePlayerTypeEnum.MainMemberSelf;
            p.insuredLifeName = this.case.mainMember.displayName;
            this.previousInsurerRolePlayers.push(p);
          });
        }
      }
    }

    if (this.context.includes(RolePlayerTypeEnum.Spouse)) {
      this.case.spouse.forEach(s => {
        s.rolePlayerType = RolePlayerTypeEnum.Spouse;
        this.insuredLives.push(s);
        if (s.previousInsurerRolePlayers) {
          s.previousInsurerRolePlayers.forEach(p => {
            p.insuredLifeType = RolePlayerTypeEnum.Spouse;
            p.insuredLifeName = s.displayName;
            this.previousInsurerRolePlayers.push(p);
          });
        }
      });
    }

    if (this.context.includes(RolePlayerTypeEnum.Child)) {
      this.case.children.forEach(s => {
        s.rolePlayerType = RolePlayerTypeEnum.Child;
        this.insuredLives.push(s);
        if (s.previousInsurerRolePlayers) {
          s.previousInsurerRolePlayers.forEach(p => {
            p.insuredLifeType = RolePlayerTypeEnum.Child;
            p.insuredLifeName = s.displayName;
            this.previousInsurerRolePlayers.push(p);
          });
        }
      });
    }

    if (this.context.includes(RolePlayerTypeEnum.Extended)) {
      this.case.extendedFamily.forEach(s => {
        s.rolePlayerType = RolePlayerTypeEnum.Extended;
        this.insuredLives.push(s);
        if (s.previousInsurerRolePlayers) {
          s.previousInsurerRolePlayers.forEach(p => {
            p.insuredLifeType = RolePlayerTypeEnum.Extended;
            p.insuredLifeName = s.displayName;
            this.previousInsurerRolePlayers.push(p);
          });
        }
      });
    }
  }

  cancel() {
    this.getPreviousInsuredForInsuredLives();
    this.toggleReadOnlyMode();
  }

  toggleReadOnlyMode() {
    this.getPreviousInsurers();
    this.isReadOnlyMode = !this.isReadOnlyMode;
  }

  startDateSelected(date: Date) {
    this.selectedStartDate = new Date(this.form.value.startDate);
    this.minDate = this.selectedStartDate;
  }

  endDateSelected() {
    this.selectedEndDate = new Date(this.form.value.endDate);
    this.maxDate = this.selectedEndDate;
  }

  insuredLifeChanged($event: RolePlayer) {
    this.selectedRoleplayerId = $event.rolePlayerId;
    this.selectedInsuredLifeType = $event.rolePlayerType;
  }

  insurerChanged($event: number) {
    this.selectedInsurerId = $event;
  }

  add() {
    const previousInsurerRolePlayer = new PreviousInsurerRolePlayer();
    previousInsurerRolePlayer.rolePlayerId = this.selectedRoleplayerId;
    previousInsurerRolePlayer.previousInsurerId = this.selectedInsurerId;
    previousInsurerRolePlayer.policyNumber = this.form.controls.policyNumber.value as string;
    previousInsurerRolePlayer.policyStartDate = this.selectedStartDate;
    previousInsurerRolePlayer.policyEndDate = this.selectedEndDate;
    previousInsurerRolePlayer.insuredLifeType = this.selectedInsuredLifeType;

    this.updateCaseModel(previousInsurerRolePlayer);
    this.getPreviousInsurers();
    this.toggleReadOnlyMode();
  }

  updateCaseModel(previousInsurerRolePlayer: PreviousInsurerRolePlayer) {
    if (previousInsurerRolePlayer.insuredLifeType === RolePlayerTypeEnum.MainMemberSelf) {
      if (!this.case.mainMember.previousInsurerRolePlayers) {
        this.case.mainMember.previousInsurerRolePlayers = [];
      }
      this.case.mainMember.previousInsurerRolePlayers.push(previousInsurerRolePlayer);
    }

    if (previousInsurerRolePlayer.insuredLifeType === RolePlayerTypeEnum.Spouse) {
      const index = this.case.spouse.findIndex(x => x.rolePlayerId === previousInsurerRolePlayer.rolePlayerId);
      if (!this.case.spouse[index].previousInsurerRolePlayers) {
        this.case.spouse[index].previousInsurerRolePlayers = [];
      }
      this.case.spouse[index].previousInsurerRolePlayers.push(previousInsurerRolePlayer);
    }

    if (previousInsurerRolePlayer.insuredLifeType === RolePlayerTypeEnum.Child) {
      const index = this.case.children.findIndex(x => x.rolePlayerId === previousInsurerRolePlayer.rolePlayerId);
      if (!this.case.children[index].previousInsurerRolePlayers) {
        this.case.children[index].previousInsurerRolePlayers = [];
      }
      this.case.children[index].previousInsurerRolePlayers.push(previousInsurerRolePlayer);
    }

    if (previousInsurerRolePlayer.insuredLifeType === RolePlayerTypeEnum.Extended) {
      const index = this.case.extendedFamily.findIndex(x => x.rolePlayerId === previousInsurerRolePlayer.rolePlayerId);
      if (!this.case.extendedFamily[index].previousInsurerRolePlayers) {
        this.case.extendedFamily[index].previousInsurerRolePlayers = [];
      }
      this.case.extendedFamily[index].previousInsurerRolePlayers.push(previousInsurerRolePlayer);
    }

    this.getPreviousInsuredForInsuredLives();
  }
}
