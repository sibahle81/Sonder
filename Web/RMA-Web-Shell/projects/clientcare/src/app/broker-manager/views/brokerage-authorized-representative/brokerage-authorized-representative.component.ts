import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { RepresentativeDataSource } from '../../datasources/representative.datasource';
import { Brokerage } from '../../models/brokerage';
import { Representative } from '../../models/representative';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BrokerageService } from '../../services/brokerage.service';
import { UserContact } from 'projects/admin/src/app/user-manager/views/member-portal/user-contact.model';
import { UserRegistrationDetails } from 'projects/admin/src/app/user-manager/views/member-portal/user-registration-details.model';
import { UserProfileTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-profile-type-enum';
import { BrokerageDialogMessage } from '../../models/brokerage-dialog-message';
import { BrokerageDialogComponent } from '../brokerage-dialog/brokerage-dialog.component';
import { PortalTypeEnum } from 'projects/shared-models-lib/src/lib/enums/portal-type-enum';

@Component({
  selector: 'brokerage-authorized-representative',
  templateUrl: './brokerage-authorized-representative.component.html',
})
export class BrokerageAuthorizedRepresentativeComponent extends WizardDetailBaseComponent<Brokerage>  {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['code', 'name', 'idNumber', 'dateOfAppointment', 'startDate', 'endDate', 'email', 'isLinked', 'actions'];
  public menus: { title: string, disable: boolean, }[];
  hashId = null;

  constructor(
    appEventsManager: AppEventsManager,
    activatedRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    private readonly brokerageService: BrokerageService,
    authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    public readonly dataSource: RepresentativeDataSource,
    public dialog: MatDialog
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: [id]
    });
    this.dataSource.setControls(this.paginator, this.sort);
  }

  onLoadLookups(): void { }

  populateModel(): void { }

  populateForm(): void {
    this.getBrokerage();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  getBrokerage(): void {

    if (this.model.representatives === null) 
      { 
        this.model.representatives = [];
      }

    this.dataSource.getData(this.model.representatives);
    this.loadingStop();
  }

  filterMenu(item: Representative) {
    const islinked = this.getBoolean(item.isLinked);
    this.menus =
      [
        { title: 'Link', disable: islinked ? true : false },
        { title: 'DeLink', disable: islinked ? false : true },
        { title: 'Resend Activation Link', disable: item.hashId !== null && !islinked ? false : true },
      ];
  }

  getBoolean(value) {
    switch (value) {
      case 'true':
        return true;
      default:
        return false;
    }
  }

  onMenuSelect(item: any, title: any) {
    const userDetails = this.populateUserDetails(item);
    userDetails.portalType = PortalTypeEnum.Broker;
    const todaysDate = new Date()
    if (userDetails.userContact.email == null || userDetails.userContact.email == "" && !item.activeBrokerage.startDate) {
      this.alertService.error("Unable to " + title + " as no email or StartDate exist.");
      return false;
    }
    if (item.activeBrokerage.endDate && new Date(item.activeBrokerage.endDate) < todaysDate) {
      this.alertService.error("Unable to " + title + " as representative is no longer active on broker");
      return false;
    }
    switch (title) {
      case 'Link':
        this.brokerageService.checkIfBrokerHasActivatedLinkCreated(userDetails.userContact.email).subscribe(result => {
          const activationLinkCreated = this.getBoolean(result);
          if (activationLinkCreated === true) {
            this.alertService.loading('Activation link has already been sent to user')
          } else {
            this.OpenLinkDialog(userDetails);
          }
        })
        break;
      case 'DeLink':
        this.OpenDelinkDialog(userDetails);
        break;
      case 'Resend Activation Link':
        if (item.hashId !== null) {
          this.resendUserActivation(item.hashId);
        }
        break;
    }
  }

  resendUserActivation(activateId: string) {
    this.brokerageService.resendUserActivation(activateId).subscribe(result => {
      if (result) {
        this.alertService.success("Activation has been sent")
      }
    });
  }

  populateUserDetails(item: any): UserRegistrationDetails {
    const userDetails = new UserRegistrationDetails();
    const userContactDetails = new UserContact();

    userDetails.brokerageId = item.activeBrokerage.brokerageId;
    userDetails.userProfileTypeId = UserProfileTypeEnum.Broker;

    userDetails.name = item.firstName;
    userDetails.surname = item.surnameOrCompanyName;
    userContactDetails.cellPhoneNo = item.contactNumber;
    userContactDetails.email = item.email;
    userDetails.userContact = userContactDetails;

    return userDetails;
  }

  OpenLinkDialog(userDetails: UserRegistrationDetails) {
    const brokerageDialogMessage = new BrokerageDialogMessage();
    brokerageDialogMessage.dialogQuestion = 'Are you sure you want to link user ' + userDetails.name + ' ' + userDetails.surname + ') ?';
    const dialogRef = this.dialog.open(BrokerageDialogComponent, {
      width: '300px',
      data: { brokerageDialogMessage: brokerageDialogMessage }
    });

    dialogRef.afterClosed().subscribe(brokerageDialogMessage => {
      if (brokerageDialogMessage == null) {
        return;
      }
      this.dataSource.linkBrokerToMemberPortal(userDetails).subscribe(result => {
        if (result) {
          this.alertService.success('An activation email has been sent to member,It is required to set the password via activation email to successfully link to Member Portal');
          this.populateForm();
        }
      },
        error => this.alertService.error(error));
    });
  }

  OpenDelinkDialog(userDetails: UserRegistrationDetails) {
    const brokerageDialogMessage = new BrokerageDialogMessage();
    brokerageDialogMessage.dialogQuestion = 'Are you sure you want to De-link user ' + userDetails.name + ' ' + userDetails.surname + ') ?';
    const dialogRef = this.dialog.open(BrokerageDialogComponent, {
      width: '300px',
      data: { brokerageDialogMessage: brokerageDialogMessage }
    });

    dialogRef.afterClosed().subscribe(brokerageDialogMessage => {
      if (brokerageDialogMessage == null) {
        return;
      }
      this.dataSource.deLinkBrokerToMemberPortal(userDetails).subscribe(result => {
        if (result) {
          this.alertService.success('Member successfully De-Linked from Member Portal');
          this.populateForm();
        }
      },
        error => this.alertService.error(error));
    });
  }
}

