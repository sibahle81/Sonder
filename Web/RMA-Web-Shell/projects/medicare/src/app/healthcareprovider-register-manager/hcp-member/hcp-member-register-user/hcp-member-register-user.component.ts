import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PortalTypeEnum } from 'projects/shared-models-lib/src/lib/enums/portal-type-enum';
import { SecurityItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/security-item-type.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { UserProfileTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-profile-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { HCPMemberRegisterUserDataSource } from './hcp-member-register-user.datasource';
import { UserHealthcareproviderMap } from '../../models/user-healthcareprovider-map';
import { UserCompanyMapStatusEnum as UserHealthCareProviderMapStatusEnum } from 'projects/shared-models-lib/src/lib/enums/user-company-map-status-enum';
import { HCPMemberRegisterUserDialogComponent } from './hcp-member-register-user-dialog/hcp-member-register-user-dialog.component';
import { HCPMemberRegisterUserExistsDialogComponent } from './hcp-member-register-user-exists-dialog/hcp-member-register-user-exists-dialog.component';
import { HCPMemberRegisterUserUpdateDialogComponent } from './hcp-member-register-user-update-dialog/hcp-member-register-user-update-dialog.component';
import { HCPMemberRegisterUserContactsDialogComponent } from './hcp-member-register-user-contacts-dialog/hcp-member-register-user-contacts-dialog.component';
import { UserDetails } from 'projects/clientcare/src/app/member-manager/models/user-details';
import { UserContact } from 'projects/clientcare/src/app/member-manager/models/user-contact';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'hcp-member-register-user',
  templateUrl: './hcp-member-register-user.component.html',
  styleUrls: ['./hcp-member-register-user.component.css']
})

export class HCPMemberRegisterUserComponent implements OnChanges {
  @Input() healthcareproviderId: number;
  @Input() userId: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  displayedColumns: string[] = ['userId', 'userHealthcareproviderMapStatus', 'actions'];

  dataSource: HCPMemberRegisterUserDataSource;
  currentQuery: any;

  users: User[] = [];

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  constructor(
    private readonly userService: UserService,
    public dialog: MatDialog,
    private readonly alertService: ToastrManager
  ) { }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes.userId?.currentValue > 0)
      this.userId = changes.userId?.currentValue;

    if (changes.healthcareproviderId?.currentValue > 0) {
      this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new HCPMemberRegisterUserDataSource(this.userService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.healthcareproviderId.toString();
      this.getData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  edit(userCompanyMap: UserHealthcareproviderMap) {
    this.openUpdateDialog(userCompanyMap);
  }

  getUser(userId: number): User {
    const index = this.users.findIndex(s => s.id === userId);
    if (index === -1) {
      this.userService.getUser(userId).subscribe(result => {
        this.users.push(result);
        return result;
      });
    } else {
      return this.users[index];
    }
  }

  getUserCompanyMapStatus(userHealthcareproviderMapStatus: UserHealthCareProviderMapStatusEnum): string {
    return this.formatText(UserHealthCareProviderMapStatusEnum[userHealthcareproviderMapStatus]);
  }

  getUserName(userId: number): string {
    const user = this.getUser(userId);
    if (user) {
      return user.email ? user.email + ' (' + user.displayName + ')' : 'N/A';
    } else {
      return 'N/A';
    }
  }

  getRoleName(userId: number): string {
    const user = this.getUser(userId);
    if (user) {
      return user.roleName ? user.roleName : 'N/A';
    } else {
      return 'N/A';
    }
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(HCPMemberRegisterUserDialogComponent, {
      width: 'auto'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.save(result);
      }
    });
  }

  openExistsDialog(user: User, userDetails: UserDetails, alreadyRegistered = false) {
    const dialogRef = this.dialog.open(HCPMemberRegisterUserExistsDialogComponent, {
      width: 'auto',
      data: { user, userDetails, alreadyRegistered }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveLink(user, userDetails);
        this.getData();
      }
      this.isLoading$.next(false);
    });
  }

  openUpdateDialog(userCompanyMap: UserHealthcareproviderMap) {
    const dialogRef = this.dialog.open(HCPMemberRegisterUserUpdateDialogComponent, {
      width: 'auto',
      data: { userCompanyMap }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading$.next(true);
        this.userService.editUserCompanyMap(result).subscribe(hasUpdated => {
          if (hasUpdated) {
            this.alertService.successToastr('user updated successfully...');
          }
          this.getData();
          this.isLoading$.next(false);
        });
      }
    });
  }

  openContactsDialog(userHealthcareproviderMap: UserHealthcareproviderMap) {
    this.isLoading$.next(true);

    let userContact = new UserContact();
    this.userService.getUserContact(userHealthcareproviderMap.userId).subscribe(result => {
      if (result) {
        userContact = result;
      }

      this.isLoading$.next(false);

      const dialogRef = this.dialog.open(HCPMemberRegisterUserContactsDialogComponent, {
        width: 'auto',
        data: { userContact }
      });

      dialogRef.afterClosed().subscribe(contact => {
        this.isLoading$.next(true);
        if (contact) {
          contact.userId = userHealthcareproviderMap.userId;
          this.manageUserContact(contact);
        } else {
          this.isLoading$.next(false);
        }
      });
    });
  }

  resendUserActivation(userHealthcareproviderMap: UserHealthcareproviderMap) {
    this.isLoading$.next(true);
    this.userService.resendUserActivationEmail(userHealthcareproviderMap.userActivationId).subscribe(result => {
      if (result) {
        this.alertService.successToastr('activation email sent successfully...');
      }
      this.isLoading$.next(false);
    });
  }

  manageUserContact(userContact: UserContact) {
    if (!userContact.userContactId || userContact.userContactId <= 0) {
      this.userService.addUserContact(userContact).subscribe(result => {
        if (result) {
          this.alertService.successToastr('user contact added successfully...');
          this.isLoading$.next(false);
        }
      });
    } else {
      this.userService.editUserContact(userContact).subscribe(result => {
        if (result) {
          this.alertService.successToastr('user contact updated successfully...');
          this.isLoading$.next(false);
        }
      });
    }
  }

  saveLink(user: User, userDetails: UserDetails) {
    const userHealthcareproviderMap = new UserHealthcareproviderMap();
    userHealthcareproviderMap.userHealthcareproviderMapId = this.healthcareproviderId;
    userHealthcareproviderMap.roleName = userDetails.roleName;
    userHealthcareproviderMap.userHealthcareproviderMapStatus = UserHealthCareProviderMapStatusEnum.Active;
    userHealthcareproviderMap.userId = user.id;

    //will be enabled once the apis's are in place
    // this.userService.addUserCompanyMap(userHealthcareproviderMap).subscribe(result => {
    //   if (result) {
    //     this.alertService.successToastr('User Linked Successfully');
    //     this.getData();
    //   }
    // });
  }

  save(userDetails: UserDetails) {
    this.isLoading$.next(true);
    let alreadyExists = false;
    this.userService.getUserByUsername(userDetails.userContact.email).subscribe(user => {
      if (user) {
        this.userService.getUserCompanyMaps(user.id).subscribe(results => {//change once api's are n place
          if (results && results.length > 0) {
            const index = results.findIndex(s => s.companyId === this.healthcareproviderId && s.userId === user.id);
            alreadyExists = index > -1;
          }
          this.openExistsDialog(user, userDetails, alreadyExists);
        });
      } else {
        this.userService.getPendingUserActivation(userDetails.userContact.email).subscribe(activationId => {//change once the api's are in place
          if (activationId !== -1) {
            this.userService.getPendingCompanyMaps(this.healthcareproviderId, activationId).subscribe(pendingUserCompanyMaps => {//change once the api's are in place
              if (pendingUserCompanyMaps && pendingUserCompanyMaps.length > 0) {
                alreadyExists = true;
                this.openExistsDialog(user, userDetails, alreadyExists);
              } else {
                const userHealthcareproviderMap = new UserHealthcareproviderMap();
                userHealthcareproviderMap.userHealthcareproviderMapId = this.healthcareproviderId;
                userHealthcareproviderMap.roleName = userDetails.roleName;
                userHealthcareproviderMap.userActivationId = activationId;
                userHealthcareproviderMap.userHealthcareproviderMapStatus = UserHealthCareProviderMapStatusEnum.Pending;

                //will be enabled once the apis's are in place
                // this.userService.addUserCompanyMap(userHealthcareproviderMap).subscribe(userHealthcareproviderMapId => {
                //   if (userHealthcareproviderMapId) {
                //     this.alertService.successToastr('User linked successfully');
                //   } else {
                //     this.alertService.errorToastr('User link failed');
                //   }
                //   this.getData();
                //   this.isLoading$.next(false);
                // });
              }
            });
          } else {
            userDetails.rolePlayerId = this.healthcareproviderId;
            userDetails.isInternalUser = false;
            userDetails.userProfileType = UserProfileTypeEnum.Company;
            userDetails.portalType = PortalTypeEnum.RMA;

            this.userService.registerUserDetails(userDetails).subscribe(result => {
              if (result) {
                this.alertService.successToastr('User registered successfully');
              } else {
                this.alertService.errorToastr('User registration failed');
              }
              this.getData();
              this.isLoading$.next(false);
            });
          }
        });
      }
    });
  }

  openAuditDialog(userHealthcareproviderMap: UserHealthcareproviderMap) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.Security,
        clientItemType: SecurityItemTypeEnum.UserCompanyMap,//need to change once the api's are in place - must be HCP
        itemId: userHealthcareproviderMap.userHealthcareproviderMapId,
        heading: 'User Healthcare Provider Map Audit',
        propertiesToDisplay: ['UserHealthcareproviderMapStatus']
      }
    });
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string): string {
    //format enum values for HTML display purposes example: ChronicMedication to Chronic Medication
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

}
