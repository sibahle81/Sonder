import { DatePipe } from "@angular/common";
import { Component, OnInit, OnChanges, Input, SimpleChanges } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { BehaviorSubject } from "rxjs";
import { MatDatePickerDateFormat, DatePickerDateFormat } from "src/app/shared-utilities/datepicker/dateformat";
import { RolePlayerTypeEnum } from "src/app/shared/enums/role-player-type-enum";
import { Case } from "src/app/shared/models/case";
import { Lookup } from "src/app/shared/models/lookup.model";
import { PreviousInsurerRolePlayer } from "src/app/shared/models/previous-insurer-roleplayer";
import { RolePlayer } from "src/app/shared/models/roleplayer";
import { LookupService } from "src/app/shared/services/lookup.service";

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

  form: FormGroup;

  minDate: Date;
  maxDate: Date;

  selectedStartDate: Date;
  selectedEndDate: Date;
  selectedRoleplayerId: number;
  selectedInsurerId: number;
  selectedInsuredLifeType: RolePlayerTypeEnum;

  constructor(
    private readonly lookupService: LookupService,
    private readonly formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.getPreviousInsurers();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group(
      {
        insurers: new FormControl('', [Validators.required]),
        insuredLives: new FormControl('', [Validators.required]),
        policyNumber: new FormControl(''),
        startDate: new FormControl('', [Validators.required]),
        endDate: new FormControl('', [Validators.required]),
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
    return text.replace(/([A-Z])/g, ' $1').trim();
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

  startDateSelected() {
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
