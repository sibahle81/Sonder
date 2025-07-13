import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { Referral } from 'projects/shared-models-lib/src/lib/referrals/referral';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { ReferralNatureOfQuery } from 'projects/shared-models-lib/src/lib/referrals/referral-nature-of-query';
import { ReferralTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ReferralService } from 'projects/shared-services-lib/src/lib/services/referral/referral.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { UserSearchDialogComponent } from '../../dialogs/user-search-dialog/user-search-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ReferralContextSearchDialogComponent } from './referral-context-search-dialog/referral-context-search-dialog.component';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { ReferralStatusEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-status-enum';
import { Router } from '@angular/router';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentSystemNameEnum } from '../../document/document-system-name-enum';
import { RoleSearchDialogComponent } from '../../dialogs/role-search-dialog/role-search-dialog.component';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { ReferralNatureOfQuerySearchDialogComponent } from '../paged-referral-nature-of-query-search/referral-nature-of-query-search-dialog/referral-nature-of-query-search-dialog.component';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { RoleService } from 'projects/shared-services-lib/src/lib/services/security/role/role.service';
import { ReferralFeedbackDialogComponent } from '../referral-feedback/referral-feedback-dialog/referral-feedback-dialog.component';

@Component({
  selector: 'referral-detail',
  templateUrl: './referral-detail.component.html',
  styleUrls: ['./referral-detail.component.css']
})
export class ReferralDetailComponent extends PermissionHelper implements OnChanges {

  reAssignPermission = 'ReAssign Referrals';

  @Input() referral: Referral; // required

  @Input() sourceModuleType: ModuleTypeEnum; // optional: use only if you want lock the referral source module 
  @Input() targetModuleType: ModuleTypeEnum; // optional: use only when in context
  //---these two optional inputs must both be passed in together when the component is in context----
  @Input() referralItemType: ReferralItemTypeEnum;
  @Input() itemId: number;
  //--------------------------------------------------------------------------------------------------
  @Input() referralItemTypeReference: string; // optional item type reference, this is a free text field use only when you are in contect and want to pre-populate the referral item type reference

  @Input() isReadOnly = false; // optional

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  referralTypes: ReferralTypeEnum[];
  moduleTypes: ModuleTypeEnum[];
  referralStatuses: ReferralStatusEnum[];
  referralItemTypes: ReferralItemTypeEnum[];
  referralNatureOfQueries: ReferralNatureOfQuery[];
  filteredReferralNatureOfQueries: ReferralNatureOfQuery[] = [];

  originalReferralItemType: ReferralItemTypeEnum;
  selectedTargetModule: ModuleTypeEnum;
  selectedNatureOfQueryRole: Role;

  currentUser: User;
  actioned = ReferralStatusEnum.Actioned;
  closed = ReferralStatusEnum.Closed;

  documentSystemName = DocumentSystemNameEnum.CommonManager;
  documentSet = DocumentSetEnum.ReferralSupportingDocuments;

  slaItemType = SLAItemTypeEnum.Referral;
  triggerRefresh = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly referralService: ReferralService,
    private readonly authService: AuthService,
    private readonly roleService: RoleService,
    private readonly requiredDocumentService: RequiredDocumentService,
    private readonly router: Router,
    public dialog: MatDialog
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.referral) {
      if (!(this.referral.referralId > 0)) {

        this.referral.referralStatus = ReferralStatusEnum.New;
        this.referral.assignedByUserId = this.currentUser.id;

        if (this.referralItemType && this.itemId) {
          this.referral.referralItemType = this.referralItemType;
          this.referral.itemId = this.itemId;
          this.referral.linkUrl = this.router.url;

          if (this.referralItemTypeReference) {
            this.referral.referralItemTypeReference = this.referralItemTypeReference;
          }
        }

        if (this.sourceModuleType) {
          this.referral.sourceModuleTypeId = +this.sourceModuleType;
        }
      } else {
        let updateRequired = false;

        if (this.referral.assignedToUserId == this.currentUser.id && this.referral.referralStatus == ReferralStatusEnum.New) {
          this.referral.referralStatus = ReferralStatusEnum.InProgress;
          updateRequired = true;
        }

        if (this.referral.assignedByUserId != this.currentUser.id && this.referral.assignedToRoleId == this.currentUser.roleId && !this.referral.assignedToUserId) {
          this.referral.assignedToUserId = this.currentUser.id;
          this.referral.referralStatus = ReferralStatusEnum.InProgress;
          updateRequired = true;
        }

        if (updateRequired) {
          this.updateReferralProgressStatus();
        }
      }

      this.isReadOnly = this.referral.referralId > 0;
      this.getLookups();
    }
  }

  getLookups() {
    this.referralTypes = this.ToArray(ReferralTypeEnum);
    this.moduleTypes = this.ToArray(ModuleTypeEnum);
    this.referralStatuses = this.ToArray(ReferralStatusEnum);
    this.referralItemTypes = this.ToArray(ReferralItemTypeEnum);

    this.getNatureOfQuery();
  }

  getNatureOfQuery() {
    this.referralService.getReferralNatureOfQuery().subscribe(results => {
      this.referralNatureOfQueries = results;
      if (!this.referral.referralReferenceNumber) {
        this.generateReferralReferenceNumber();
      } else {
        this.setReferralNatureOfQueryRole();
        this.createForm();
      }
    });
  }

  setReferralNatureOfQueryRole() {
    if (this.referral.referralId > 0 && this.referral.referralNatureOfQueryId > 0 && this.referralNatureOfQueries?.length > 0 && this.referral.referralStatus != +ReferralStatusEnum.Closed) {
      const result = this.referralNatureOfQueries.find(s => s.referralNatureOfQueryId == this.referral.referralNatureOfQueryId);

      if (result.roleId) {
        this.getRole(result.roleId);
      }
    }
  }

  generateReferralReferenceNumber() {
    this.requiredDocumentService.generateDocumentNumber('Referral').subscribe(result => {
      this.referral.referralReferenceNumber = result;
      this.createForm();
    });
  }

  targetModuleChanged($event: any) {
    this.filteredReferralNatureOfQueries = [];
    this.filteredReferralNatureOfQueries = this.referralNatureOfQueries.filter(s => s.moduleType == +ModuleTypeEnum[$event]);

    this.selectedTargetModule = +ModuleTypeEnum[$event];

    this.form.controls.referralNatureOfQuery.reset();
    this.form.controls.referralNatureOfQuery.markAsTouched();
    this.form.controls.referralNatureOfQuery.updateValueAndValidity();
  }

  createForm() {
    this.form = this.formBuilder.group({
      referralReferenceNumber: [{ value: null, disabled: true }],
      referralType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      sourceModuleType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      targetModuleType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      referralStatus: [{ value: null, disabled: true }, Validators.required],
      referralItemType: [{ value: null, disabled: this.isReadOnly }],
      referralNatureOfQuery: [{ value: null, disabled: true }, Validators.required],
      comment: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      referralItemTypeReference: [{ value: null, disabled: this.isReadOnly }]
    });

    if (this.referral.targetModuleTypeId) {
      this.targetModuleChanged(ModuleTypeEnum[this.referral.targetModuleTypeId]);
    }

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      referralReferenceNumber: this.referral.referralId > 0 ? this.referral.referralReferenceNumber : null,
      referralType: this.referral.referralId > 0 ? ReferralTypeEnum[+this.referral.referralType] : null,
      sourceModuleType: this.referral.sourceModuleTypeId ? ModuleTypeEnum[+this.referral.sourceModuleTypeId] : null,
      targetModuleType: this.referral.targetModuleTypeId ? ModuleTypeEnum[+this.referral.targetModuleTypeId] : null,
      referralStatus: this.referral.referralId > 0 ? ReferralStatusEnum[+this.referral.referralStatus] : ReferralStatusEnum[+ReferralStatusEnum.New],
      referralItemType: this.referral.referralItemType ? ReferralItemTypeEnum[+this.referral.referralItemType] : null,
      referralNatureOfQuery: this.referral.referralId > 0 ? this.referral.referralNatureOfQueryId : null,
      comment: this.referral.comment,
      referralItemTypeReference: this.referral.referralItemTypeReference ? this.referral.referralItemTypeReference : null,
    });

    if (!(this.referral.referralId > 0) && this.referralItemType && this.itemId) {
      this.form.controls.referralItemType.disable();
    }

    if (this.referralItemTypeReference) {
      this.form.controls.referralItemTypeReference.disable();
    }

    if (this.sourceModuleType) {
      this.form.controls.sourceModuleType.disable();
    } else if (this.targetModuleType && this.referralItemType && this.itemId) {
      this.form.patchValue({
        sourceModuleType: ModuleTypeEnum[+this.targetModuleType]
      });
      this.form.controls.sourceModuleType.disable();
    } else if (!this.sourceModuleType && this.targetModuleType) {
      this.form.patchValue({
        sourceModuleType: ModuleTypeEnum[+this.targetModuleType]
      });
      this.form.controls.sourceModuleType.disable();
    }

    this.isLoading$.next(false);
  }

  readForm() {
    this.referral.referralType = +ReferralTypeEnum[this.form.controls.referralType.value];
    this.referral.sourceModuleTypeId = +ModuleTypeEnum[this.form.controls.sourceModuleType.value];
    this.referral.targetModuleTypeId = +ModuleTypeEnum[this.form.controls.targetModuleType.value];
    this.referral.referralNatureOfQueryId = +this.form.controls.referralNatureOfQuery.value;
    this.referral.comment = this.form.controls.comment.value;
    this.referral.referralItemTypeReference = this.form.controls.referralItemTypeReference.value;
  }

  save() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('saving...please wait');

    this.readForm();

    if (this.referral.referralId > 0) {
      this.referralService.updateReferral(this.referral).subscribe(result => {
        this.referral = result;
        this.isReadOnly = true;
        this.triggerRefresh = !this.triggerRefresh;
        this.createForm();
      });
    } else {
      this.referralService.createReferral(this.referral).subscribe(result => {
        this.referral = result;
        this.isReadOnly = true;
        this.triggerRefresh = !this.triggerRefresh;
        this.createForm();
      });
    }
  }

  updateReferralProgressStatus() {
    this.referralService.updateReferral(this.referral).subscribe(result => {
      this.referral = result;
      this.triggerRefresh = !this.triggerRefresh;
    });
  }

  openRoleSearchDialog() {
    const dialogRef = this.dialog.open(RoleSearchDialogComponent, {
      width: '70%',
      disableClose: true,
      data: {
        title: this.referral.assignedToRoleId > 0 ? 'Referral: Re-Assign To Role' : 'Referral: Assign To Role'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.referral.assignedToRoleId = result.id;
        this.referral.assignedToUserId = null;

        if (this.referral.referralId > 0) {
          this.referral.referralStatus = this.referral.referralStatus == ReferralStatusEnum.Actioned || this.referral.referralStatus == ReferralStatusEnum.Disputed ? ReferralStatusEnum.InProgress : this.referral.referralStatus;
          this.openReassignReasonDialog();
        }
      }
    });
  }

  openUserSearchDialog() {
    const dialogRef = this.dialog.open(UserSearchDialogComponent, {
      width: '70%',
      disableClose: true,
      data: {
        title: this.referral.assignedToRoleId > 0 ? 'Referral: Re-Assign To User' : 'Referral: Assign To User',
        roles: this.selectedNatureOfQueryRole ? [this.selectedNatureOfQueryRole] : null
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.referral.assignedByUserId == result.id) {
          this.openMessageDialog('Assignment', `Referral cannot be assigned to the same user that created the referral`);
        } else if (this.referral.assignedToUserId == result.id) {
          this.openMessageDialog('Assignment', `Referral is already assigned to ${result.displayName}`);
        } else {
          this.referral.assignedToRoleId = result.roleId;
          this.referral.assignedToUserId = result.id;

          if (this.referral.referralId > 0) {
            this.referral.referralStatus = this.referral.referralStatus == ReferralStatusEnum.Actioned || this.referral.referralStatus == ReferralStatusEnum.Disputed ? ReferralStatusEnum.InProgress : this.referral.referralStatus;
            this.openReassignReasonDialog();
          }
        }
      }
    });
  }

  openReassignReasonDialog() {
    const dialogRef = this.dialog.open(ReferralFeedbackDialogComponent, {
      width: '70%',
      disableClose: true,
      data: {
        title: 'Please provide the reason for re-assigning this referral',
        referral: this.referral
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.save();
    });
  }

  openReferralContextSearchDialog($event: ReferralItemTypeEnum) {
    this.originalReferralItemType = this.referral.referralItemType;
    this.referral.referralItemType = +ReferralItemTypeEnum[$event];

    const dialogRef = this.dialog.open(ReferralContextSearchDialogComponent, {
      width: '80%',
      disableClose: true,
      data: {
        referral: this.referral
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        if (!(this.referral.referralItemType && this.referral.itemId && this.referral.linkUrl)) {
          this.referral.referralItemType = null;
          this.form.controls.referralItemType.reset();
        } else {
          this.referral.referralItemType = this.originalReferralItemType;
          this.form.patchValue({
            referralItemType: ReferralItemTypeEnum[+this.referral.referralItemType]
          });
        }
      } else {
        if (this.referral.referralItemTypeReference) {
          this.form.patchValue({
            referralItemTypeReference: this.referral.referralItemTypeReference
          });

          this.form.controls.referralItemTypeReference.disable();
        }
      }
    });
  }

  openReferralNatureOfQuerySearchDialog() {
    const dialogRef = this.dialog.open(ReferralNatureOfQuerySearchDialogComponent, {
      width: '80%',
      disableClose: true,
      data: {
        targetModuleType: this.selectedTargetModule
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.form.patchValue({
          referralNatureOfQuery: result.referralNatureOfQueryId
        });

        if (result.roleId) {
          this.getRole(result.roleId);
        } else {
          this.selectedNatureOfQueryRole = null;
        }
      }
    });
  }

  getRole(roleId: number) {
    this.roleService.getRole(roleId).subscribe(result => {
      if (result) {
        this.selectedNatureOfQueryRole = result;
      }
    });
  }

  openMessageDialog(title: string, message: string) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: title,
        text: message,
        showConfirmButton: false
      }
    });
  }

  setReferral($event: Referral) {
    this.referral = $event;
    this.createForm();
    this.triggerRefresh = !this.triggerRefresh;
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
}

