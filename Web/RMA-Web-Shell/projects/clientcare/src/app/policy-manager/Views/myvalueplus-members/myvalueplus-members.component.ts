import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { MyValuePlusService } from '../../shared/Services/myvalueplus.service';
import { MyValuePlus } from '../../shared/entities/myvalueplus';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { BehaviorSubject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MemberVopdStatus } from '../../shared/entities/member-vopd-status';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { MatTableDataSource } from '@angular/material/table';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { VopdMvpManualOverrideDialogComponent } from '../../../shared/vopd/vopd-mvp-manual-override-dialog/vopd-mvp-manual-override-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-myvalueplus-members',
  templateUrl: './myvalueplus-members.component.html',
  styleUrls: ['./myvalueplus-members.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})

export class MyvalueplusMembersComponent extends WizardDetailBaseComponent<MyValuePlus> {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  members: MemberVopdStatus[] = [];
  dataSource = new MatTableDataSource<MemberVopdStatus>();
  displayedColumns = ['memberType', 'memberName', 'idNumber', 'dateOfBirth', 'age', 'joinDate', 'vopdProcessStatus', 'vopdStatus', 'dateVerified', 'actions'];
  menus: { title: string, action: string, disable: boolean }[];
  menusSpouse: { title: string, action: string, disable: boolean }[];
  editableMemberMembers = ['Beneficiary', 'Main Member (self)', 'Spouse'];
  hasEditVopdPermission = false;
  fileIdentifier: string;
  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly alertService: AlertService,
    private readonly myValuePlusService: MyValuePlusService,
    private readonly dialog: MatDialog) {
    super(appEventsManager, authService, activatedRoute);
    this.hasEditVopdPermission = userUtility.hasPermission('Override Verification Of Personal Details');
  }

  onLoadLookups(): void { }

  createForm(id: number): void {
    this.menus =
      [
        { title: 'Override VOPD', action: 'override', disable: false }
      ];
  }

  populateForm(): void {

    let wizardData = JSON.parse(this.context.wizard.data)[0];
    for (let key in wizardData) {
      if (key == 'fileIdentifier') {
        let value = wizardData[key];
        if (value) {
          this.fileIdentifier = value;
        }
      }
    }

    this.isLoading$.next(true);
    this.myValuePlusService.getMyValuePlusVopdStatus(this.model.fileIdentifier).subscribe({
      next: (list: MemberVopdStatus[]) => {
        this.members = list;
        this.dataSource = new MatTableDataSource(this.members);
      },
      error: (response: HttpErrorResponse) => {
        const errorMessage = response.error.Error ? response.error.Error : response.message;
        this.alertService.error(errorMessage);
        this.isLoading$.next(false);
      },
      complete: () => {
        this.isLoading$.next(false);
      }
    });
  }

  populateModel(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  onMenuItemClick(item: MemberVopdStatus, menu: any): void {
    switch (menu.action) {
      case 'override':
        this.openVopdEditDialog(item);
        break;
    }
  }

  openVopdEditDialog(item: MemberVopdStatus): void {
    const canEditVopd = this.hasEditVopdPermission;
    let fileIdentifier = '';
    if (this.fileIdentifier) {
      fileIdentifier = this.fileIdentifier;
    }
    let isAlive = null;
    let dateOfDeath: Date = null;
    if (item.vopdStatus && item.vopdStatus.toUpperCase().includes('DECEASED')) {
      isAlive = false;
      if (item.dateOfDeath) {
        dateOfDeath = item.dateOfDeath;
      }
    }
    else if (item.vopdStatus && item.vopdStatus.toUpperCase().includes('ALIVE'))  {
      isAlive = true;
    }
    const dialogRef = this.dialog.open(VopdMvpManualOverrideDialogComponent, { width: '800px', height: '800px', data: { memberName: item.memberName, idNumber: item.idNumber, canEditVopd, isAlive, dateOfDeath, fileIdentifier } });
    dialogRef.afterClosed().subscribe(() => {
      this.populateForm();
    });
  }
}
