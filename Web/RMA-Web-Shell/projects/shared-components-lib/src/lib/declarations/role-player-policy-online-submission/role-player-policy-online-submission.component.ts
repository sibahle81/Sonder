import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IndustryClassDeclarationConfiguration } from 'projects/clientcare/src/app/member-manager/models/industry-class-declaration-configuration';
import { MaxAverageEarning } from 'projects/clientcare/src/app/member-manager/models/max-average-earning';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { RolePlayerPolicyOnlineSubmission } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-online-submission';
import { RolePlayerPolicyOnlineSubmissionContext } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-online-submission-context';
import { RolePlayerPolicyOnlineSubmissionDetail } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-online-submission-detail';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';
import { RolePlayerPolicyDeclarationTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/role-player-policy-declaration-type.enum';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { BehaviorSubject } from 'rxjs';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'role-player-policy-online-submission',
  templateUrl: './role-player-policy-online-submission.component.html',
  styleUrls: ['./role-player-policy-online-submission.component.css']
})
export class RolePlayerPolicyOnlineSubmissionComponent extends PermissionHelper implements OnInit, OnChanges {

  currentUser: User;

  viewAuditPermission = 'View Audits';

  @Input() policy: Policy;
  @Input() industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration;
  @Input() isReadOnly = false;

  @Output() applyToAllEmit = new EventEmitter<RolePlayerPolicyOnlineSubmissionContext>();

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  form: UntypedFormGroup;

  configuredMaximum: MaxAverageEarning;
  minimumAllowableEarningsPerEmployee = 0;
  maximumAllowableEarningsPerEmployee = 0;

  selectedRolePlayerPolicyOnlineSubmission: RolePlayerPolicyOnlineSubmission;
  selectedRolePlayerPolicyOnlineSubmissionDetail: RolePlayerPolicyOnlineSubmissionDetail;

  categoryInsureds: CategoryInsuredEnum[];
  unSkilled = CategoryInsuredEnum.Unskilled;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    public dialog: MatDialog
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.categoryInsureds = this.ToArray(CategoryInsuredEnum);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.policy && this.industryClassDeclarationConfiguration) {
      this.isLoading$.next(false);
    }
  }

  rolePlayerPolicyOnlineSubmissionDetailSelected(rolePlayerPolicyOnlineSubmissionDetail: RolePlayerPolicyOnlineSubmissionDetail) {
    this.policy.rolePlayerPolicyOnlineSubmissions.forEach(s => {
      if (s.rolePlayerPolicyOnlineSubmissionDetails.includes(rolePlayerPolicyOnlineSubmissionDetail)) {
        this.selectedRolePlayerPolicyOnlineSubmission = s;
      }
    });

    this.setMaximumForCoverPeriod(this.selectedRolePlayerPolicyOnlineSubmission);
    this.selectedRolePlayerPolicyOnlineSubmissionDetail = rolePlayerPolicyOnlineSubmissionDetail;
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      productOption: [{ value: this.getProductOptionName(), disabled: true }],
      categoryInsured: [{ value: this.getCategoryInsuredName(this.selectedRolePlayerPolicyOnlineSubmissionDetail.categoryInsured), disabled: true }],
      averageNumberOfEmployees: [{ value: this.selectedRolePlayerPolicyOnlineSubmissionDetail.averageNumberOfEmployees ? this.selectedRolePlayerPolicyOnlineSubmissionDetail.averageNumberOfEmployees : null, disabled: this.isReadOnly }, Validators.required],
      averageEmployeeEarnings: [{ value: this.selectedRolePlayerPolicyOnlineSubmissionDetail.averageEmployeeEarnings ? this.selectedRolePlayerPolicyOnlineSubmissionDetail.averageEmployeeEarnings : null, disabled: this.isReadOnly }, [Validators.required, Validators.min(this.selectedRolePlayerPolicyOnlineSubmissionDetail.averageNumberOfEmployees * 5000), Validators.max(this.configuredMaximum ? this.configuredMaximum.maxAverageEarnings : 0)]],
      liveInAllowance: [{ value: this.selectedRolePlayerPolicyOnlineSubmissionDetail.liveInAllowance ? this.selectedRolePlayerPolicyOnlineSubmissionDetail.liveInAllowance : 0, disabled: this.isReadOnly }, [Validators.max(this.selectedRolePlayerPolicyOnlineSubmissionDetail.averageNumberOfEmployees ? this.selectedRolePlayerPolicyOnlineSubmissionDetail.averageNumberOfEmployees : 0)]]
    });

    this.form.markAsPristine();
    this.isLoading$.next(false);
  }

  readForm() {
    this.selectedRolePlayerPolicyOnlineSubmissionDetail.averageNumberOfEmployees = +this.form.controls.averageNumberOfEmployees.value;
    this.selectedRolePlayerPolicyOnlineSubmissionDetail.averageEmployeeEarnings = +this.form.controls.averageEmployeeEarnings.value;
    this.selectedRolePlayerPolicyOnlineSubmissionDetail.liveInAllowance = +this.form.controls.liveInAllowance.value ? +this.form.controls.liveInAllowance.value : 0;
  }

  getLiveInAllowanceForCoverPeriod(rolePlayerPolicyOnlineSubmission: RolePlayerPolicyOnlineSubmission): number {
    const startDate = new Date(rolePlayerPolicyOnlineSubmission.declarationYear, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth);
    const index = this.industryClassDeclarationConfiguration.liveInAllowances.findIndex(s => new Date(s.effectiveFrom) <= startDate && startDate < new Date(s.effectiveTo));

    let allowance = 0;

    if (this.industryClassDeclarationConfiguration.liveInAllowances) {
      if (index > -1) {
        allowance = this.industryClassDeclarationConfiguration.liveInAllowances[index].allowance;
      } else {
        const latestAllowance = this.industryClassDeclarationConfiguration.liveInAllowances.find(s => !s.effectiveTo);
        allowance = latestAllowance && new Date(latestAllowance.effectiveFrom) <= startDate ? latestAllowance.allowance : 0;
      }
    }

    return allowance;
  }

  setMaximumForCoverPeriod(rolePlayerPolicyOnlineSubmission: RolePlayerPolicyOnlineSubmission) {
    const startDate = new Date(rolePlayerPolicyOnlineSubmission.declarationYear, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth);

    if (this.industryClassDeclarationConfiguration.maxAverageEarnings) {
      const index = this.industryClassDeclarationConfiguration.maxAverageEarnings.findIndex(s => new Date(s.effectiveFrom) <= startDate && startDate < new Date(s.effectiveTo));

      if (index > -1) {
        this.configuredMaximum = this.industryClassDeclarationConfiguration.maxAverageEarnings[index];
      } else {
        this.configuredMaximum = this.industryClassDeclarationConfiguration.maxAverageEarnings.find(s => !s.effectiveTo);
      }
    }
  }

  getProductName(): string {
    return this.policy.productOption.product.name + ' (' + this.policy.productOption.product.code + ')';
  }

  getProductOptionName(): string {
    return this.policy.productOption.name + ' (' + this.policy.productOption.code + ')';
  }

  getCategoryInsuredName(categoryInsured: CategoryInsuredEnum): string {
    return this.formatLookup(CategoryInsuredEnum[categoryInsured]);
  }

  getRolePlayerPolicyDeclarationType(rolePlayerPolicyDeclarationType: RolePlayerPolicyDeclarationTypeEnum) {
    return this.formatLookup(RolePlayerPolicyDeclarationTypeEnum[rolePlayerPolicyDeclarationType]);
  }

  exclude(rolePlayerPolicyOnlineSubmission: RolePlayerPolicyOnlineSubmission, rolePlayerPolicyOnlineSubmissionDetail: RolePlayerPolicyOnlineSubmissionDetail) {
    const atLeastOneOnlineSubmissionDetailIncluded = rolePlayerPolicyOnlineSubmission.rolePlayerPolicyOnlineSubmissionDetails.filter(s => !s.isDeleted).length > 1;
    if (atLeastOneOnlineSubmissionDetailIncluded || !rolePlayerPolicyOnlineSubmissionDetail.isDeleted) {
      rolePlayerPolicyOnlineSubmissionDetail.isDeleted = !rolePlayerPolicyOnlineSubmissionDetail.isDeleted;

      const index = rolePlayerPolicyOnlineSubmission.rolePlayerPolicyOnlineSubmissionDetails.findIndex(s => s === rolePlayerPolicyOnlineSubmissionDetail);
      if (index > -1) {
        rolePlayerPolicyOnlineSubmission.rolePlayerPolicyOnlineSubmissionDetails[index] = rolePlayerPolicyOnlineSubmissionDetail;
      }
    } else {
      this.openMessageDialog('Validation', 'At least one line item per product option must be included');
    }
  }

  isExcluded(rolePlayerPolicyOnlineSubmissionDetail: RolePlayerPolicyOnlineSubmissionDetail): boolean {
    const isExcluded = rolePlayerPolicyOnlineSubmissionDetail.isDeleted;
    return isExcluded;
  }

  save() {
    const isValid = this.validate();

    if (isValid) {
      this.readForm();
      const index = this.selectedRolePlayerPolicyOnlineSubmission.rolePlayerPolicyOnlineSubmissionDetails.findIndex(s => s === this.selectedRolePlayerPolicyOnlineSubmissionDetail);
      if (index > -1) {
        this.selectedRolePlayerPolicyOnlineSubmission.rolePlayerPolicyOnlineSubmissionDetails[index] = this.selectedRolePlayerPolicyOnlineSubmissionDetail;
      }

      const rolePlayerPolicyOnlineSubmissionContext = new RolePlayerPolicyOnlineSubmissionContext();
      rolePlayerPolicyOnlineSubmissionContext.rolePlayerPolicyOnlineSubmission = this.selectedRolePlayerPolicyOnlineSubmission;
      rolePlayerPolicyOnlineSubmissionContext.rolePlayerPolicyOnlineSubmissionDetail = this.selectedRolePlayerPolicyOnlineSubmissionDetail;
      this.applyToAllEmit.emit(rolePlayerPolicyOnlineSubmissionContext);

      this.reset();
    }
  }

  isValid($event: RolePlayerPolicyOnlineSubmissionDetail): boolean {
    return !$event.isDeleted && $event.averageEmployeeEarnings > 0 && $event.averageNumberOfEmployees > 0;
  }

  canCapture(): boolean {
    return (this.policy.rolePlayerPolicyOnlineSubmissions.some(t => t.rolePlayerPolicyOnlineSubmissionId <= 0)) || (!this.policy.rolePlayerPolicyOnlineSubmissions.some(t => t.rolePlayerPolicyOnlineSubmissionId <= 0) && this.currentUser.isInternalUser);
  }

  validate(): boolean {
    const averageNumberOfEmployees = this.form.controls.averageNumberOfEmployees.value && this.form.controls.averageNumberOfEmployees.value > 0 ? +this.form.controls.averageNumberOfEmployees.value : 1;
    const averageEmployeeEarnings = this.form.controls.averageEmployeeEarnings.value && this.form.controls.averageEmployeeEarnings.value > 0 ? +this.form.controls.averageEmployeeEarnings.value : 0;
    const liveInAllowance = this.form.controls.liveInAllowance.value && this.form.controls.liveInAllowance.value > 0 ? +this.form.controls.liveInAllowance.value : 0;

    const calculatedEarningsPerEmployee = averageEmployeeEarnings / averageNumberOfEmployees;
    const createdDate = new Date(this.getSelectedRolePlayerPolicyOnlineSubmissionStartDate(this.selectedRolePlayerPolicyOnlineSubmission));

    this.industryClassDeclarationConfiguration.maxAverageEarnings.sort((b, a) => a.industryClassDeclarationConfigurationId - b.industryClassDeclarationConfigurationId);

    this.configuredMaximum = this.industryClassDeclarationConfiguration.maxAverageEarnings.find(s => new Date(s.effectiveFrom).getTime() <= createdDate.getTime() && new Date(s.effectiveTo).getTime() > createdDate.getTime());
    if (!this.configuredMaximum) {
      this.configuredMaximum = this.industryClassDeclarationConfiguration.maxAverageEarnings.find(s => s.effectiveTo == null);
    }

    this.minimumAllowableEarningsPerEmployee = this.configuredMaximum ? this.configuredMaximum.minAverageEarnings : 0;
    this.maximumAllowableEarningsPerEmployee = this.configuredMaximum ? this.configuredMaximum.maxAverageEarnings : 0;

    let isValid = true;

    this.clearValidationToFormControl(this.form, 'averageEmployeeEarnings');
    if (calculatedEarningsPerEmployee > this.maximumAllowableEarningsPerEmployee) {
      isValid = false;
      this.applyValidationToFormControl(this.form, [Validators.required, Validators.max(this.configuredMaximum ? this.configuredMaximum.maxAverageEarnings : 0)], 'averageEmployeeEarnings');
    } else if (averageNumberOfEmployees * this.minimumAllowableEarningsPerEmployee > averageEmployeeEarnings) {
      this.applyValidationToFormControl(this.form, [Validators.required, Validators.min(averageNumberOfEmployees * this.minimumAllowableEarningsPerEmployee)], 'averageEmployeeEarnings');
      isValid = false;
    }

    this.clearValidationToFormControl(this.form, 'liveInAllowance');
    if (liveInAllowance && liveInAllowance > 0 && averageNumberOfEmployees && averageNumberOfEmployees > 0 && liveInAllowance > averageNumberOfEmployees) {
      this.applyValidationToFormControl(this.form, [Validators.max(averageNumberOfEmployees ? averageNumberOfEmployees : 0)], 'liveInAllowance');
      isValid = false;
    }

    return isValid;
  }

  getCoverPeriodYear(date: Date): number {
    const _date = new Date(date);

    const configuredRenewalMonth = this.industryClassDeclarationConfiguration.renewalPeriodStartMonth;
    const configuredRenewalDay = this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth;

    const month = _date.getMonth() + 1;
    const day = _date.getDate();

    if ((month < configuredRenewalMonth) || (month === configuredRenewalMonth && day < configuredRenewalDay)) {
      return _date.getFullYear() - 1;
    }

    return _date.getFullYear();
  }

  getSelectedRolePlayerPolicyOnlineSubmissionStartDate(rolePlayerPolicyOnlineSubmission: RolePlayerPolicyOnlineSubmission): Date {
    const defaultStartDate = new Date(rolePlayerPolicyOnlineSubmission.declarationYear, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth);
    return defaultStartDate;
  }

  reset() {
    this.selectedRolePlayerPolicyOnlineSubmission = null;
    this.selectedRolePlayerPolicyOnlineSubmissionDetail = null;
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string): string {
    return lookup ? lookup.replace(/([a-z])([A-Z])/g, '$1 $2') : 'N/A';
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  applyValidationToFormControl(form: UntypedFormGroup, validationToApply: any, controlName: string) {
    form.get(controlName).setValidators(validationToApply);
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  clearValidationToFormControl(form: UntypedFormGroup, controlName: string) {
    form.get(controlName).clearValidators();
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  openMessageDialog(title: string, message: string) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: title,
        text: message
      }
    });
  }

  openRolePlayerPolicyOnlineSubmissionDetailAuditDialog(rolePlayerPolicyOnlineSubmission: RolePlayerPolicyOnlineSubmission, rolePlayerPolicyOnlineSubmissionDetail: RolePlayerPolicyOnlineSubmissionDetail) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClientManager,
        clientItemType: ClientItemTypeEnum.RolePlayerPolicyOnlineSubmissionDetail,
        itemId: rolePlayerPolicyOnlineSubmissionDetail.rolePlayerPolicyOnlineSubmissionDetailId,
        heading: `${rolePlayerPolicyOnlineSubmission.declarationYear} ${this.getRolePlayerPolicyDeclarationType(rolePlayerPolicyOnlineSubmission.rolePlayerPolicyDeclarationType)} ${this.getCategoryInsuredName(rolePlayerPolicyOnlineSubmissionDetail.categoryInsured)} Online Submission Detail Audit`,
        propertiesToDisplay: ['CategoryInsured', 'AverageNumberOfEmployees', 'AverageEmployeeEarnings', 'LiveInAllowance']
      }
    });
  }
}
