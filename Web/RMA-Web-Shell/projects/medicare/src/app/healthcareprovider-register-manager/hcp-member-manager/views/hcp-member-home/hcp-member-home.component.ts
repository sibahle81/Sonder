import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { HealthCareProviderModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/healthare-provider-model';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { isNullOrUndefined } from 'util';

@Component({
  templateUrl: './hcp-member-home.component.html',
  styleUrls: ['./hcp-member-home.component.css']
})
export class HCPMemberHomeComponent implements OnInit {

  healthCareProviderId: number;
  selectedRolePlayer: RolePlayer;
  selectedHealthCareProvider: HealthCareProviderModel;
  isReadOnly: boolean = true
  rolePlayerId: number
  documentSystemName = DocumentSystemNameEnum.RolePlayerDocuments;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  wizardTypeCSVs = 'healthcare-provider-registration,update-healthcare-provider-banking-details,update-healthcare-provider-demographics';
  hasRunningWizard = false;
  activeWizards: Wizard[];

  rolePlayerContactOptions: KeyValue<string, number>[];

  constructor(private readonly memberService: MemberService, private readonly healthCareProviderService: HealthcareProviderService,
    private readonly rolePlayerService: RolePlayerService, private readonly wizardService: WizardService, private router: Router,
    private readonly requiredDocumentService: RequiredDocumentService, private readonly toasterService: ToastrManager,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  getSelectedMemberContext(): number {
    const selectedMemberContext = userUtility.getSelectedMemberContext();

    this.rolePlayerContactOptions = [
      { key: 'HCP', value: selectedMemberContext ? selectedMemberContext.rolePlayerId : this.healthCareProviderId ? this.healthCareProviderId : 0 }
    ];

    return selectedMemberContext ? selectedMemberContext.rolePlayerId : this.healthCareProviderId ? this.healthCareProviderId : 0;
  }

  setHealthCareProviderId($event) {
    if (!isNullOrUndefined($event)) {
      this.isLoading$.next(true);
      this.selectedRolePlayer = null;
      this.rolePlayerId = $event.rolePlayerId;
      this.getHealthCareProviderDeails($event.rolePlayerId)
    }
    else {
      this.selectedRolePlayer = new RolePlayer();
    }
  }

  closeHCPForm() {
    this.selectedRolePlayer = null;
  }

  createHCPWorkflowWizard(rolePlayer: RolePlayer) {

    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.data = JSON.stringify(rolePlayer);
    startWizardRequest.linkedItemId = rolePlayer.rolePlayerId;
    startWizardRequest.type = 'healthcare-provider-registration';

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.toasterService.successToastr('Workflow for approval sent successfully.');
        this.isLoading$.next(false);
      })

  }

  getHealthCareProviderDeails(healthCareProviderId: number) {
    this.rolePlayerService.getRolePlayer(healthCareProviderId).subscribe(result => {
      this.selectedRolePlayer = result;
      this.selectedHealthCareProvider = result.healthCareProvider;
      this.isLoading$.next(false);
    });
  }

  getRolePlayer(rolePlayerId: number) {
    this.memberService.getMember(rolePlayerId).subscribe(results => {
      this.selectedRolePlayer = results;
    });
  }

  reset() {
    this.healthCareProviderId = 0;
  }

  setRunningWizards($event: boolean) {
    this.hasRunningWizard = $event;
  }

  setActiveWizards($event: Wizard[]) {
    this.isReadOnly = $event.filter(y => y.wizardStatusId == WizardStatus.AwaitingApproval || y.wizardStatusId == WizardStatus.InProgress).length > 0;
    this.activeWizards = $event;
  }

}

