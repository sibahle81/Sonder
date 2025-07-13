import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PortalTypeEnum } from 'projects/shared-models-lib/src/lib/enums/portal-type-enum';
import { SecurityItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/security-item-type.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { UserCompanyMapStatusEnum } from 'projects/shared-models-lib/src/lib/enums/user-company-map-status-enum';
import { UserProfileTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-profile-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';
import { UserCompanyMap } from '../../../member-manager/models/user-company-map';
import { UserContact } from '../../../member-manager/models/user-contact';
import { UserDetails } from '../../../member-manager/models/user-details';
import { GeneralAuditDialogComponent } from '../../general-audits/general-audit-dialog/general-audit-dialog.component';
import { MemberRegisterUserContactsDialogComponent } from './member-register-user-contacts-dialog/member-register-user-contacts-dialog.component';
import { MemberRegisterUserDialogComponent } from './member-register-user-dialog/member-register-user-dialog.component';
import { MemberRegisterUserExistsDialogComponent } from './member-register-user-exists-dialog/member-register-user-exists-dialog.component';
import { MemberRegisterUserUpdateDialogComponent } from './member-register-user-update-dialog/member-register-user-update-dialog.component';
import { MemberRegisterUserDataSource } from './member-register-user.datasource';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';

@Component({
  selector: 'member-register-user',
  templateUrl: './member-register-user.component.html',
  styleUrls: ['./member-register-user.component.css']
})

export class MemberRegisterUserComponent extends UnSubscribe implements OnChanges {

  editPermission = 'Edit Member';
  viewPermission = 'View Member';
  viewAuditPermission = 'View Audits';

  @Input() companyId: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  displayedColumns: string[] = ['userId', 'roleId', 'userCompanyMapStatus', 'actions'];

  dataSource: MemberRegisterUserDataSource;
  currentQuery: any;

  users: User[] = [];

  constructor(
    private readonly userService: UserService,
    public dialog: MatDialog,
    private readonly alertService: ToastrManager
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.companyId) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new MemberRegisterUserDataSource(this.userService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.companyId.toString();
      this.getData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  edit(userCompanyMap: UserCompanyMap) {
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

  getUserCompanyMapStatus(userCompanyMapStatus: UserCompanyMapStatusEnum): string {
    return this.formatText(UserCompanyMapStatusEnum[userCompanyMapStatus]);
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
    const dialogRef = this.dialog.open(MemberRegisterUserDialogComponent, {
      width: '40%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.save(result);
      }
    });
  }

  openExistsDialog(user: User, userDetails: UserDetails, alreadyRegistered = false) {
    const dialogRef = this.dialog.open(MemberRegisterUserExistsDialogComponent, {
      width: '40%',
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

  openUpdateDialog(userCompanyMap: UserCompanyMap) {
    const dialogRef = this.dialog.open(MemberRegisterUserUpdateDialogComponent, {
      width: '40%',
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

  openContactsDialog(userCompanyMap: UserCompanyMap) {
    this.isLoading$.next(true);

    let userContact = new UserContact();
    this.userService.getUserContact(userCompanyMap.userId).subscribe(result => {
      if (result) {
        userContact = result;
      }

      this.isLoading$.next(false);

      const dialogRef = this.dialog.open(MemberRegisterUserContactsDialogComponent, {
        width: '40%',
        data: { userContact }
      });

      dialogRef.afterClosed().subscribe(contact => {
        this.isLoading$.next(true);
        if (contact) {
          contact.userId = userCompanyMap.userId;
          this.manageUserContact(contact);
        } else {
          this.isLoading$.next(false);
        }
      });
    });
  }

  openConfirmationDialog(userCompanyMap: UserCompanyMap) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Resend Registration Email`,
        text: `Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.resendUserActivation(userCompanyMap);
      }
    });
  }

  resendUserActivation(userCompanyMap: UserCompanyMap) {
    this.isLoading$.next(true);
    this.userService.resendUserActivationEmail(userCompanyMap.userActivationId).subscribe(result => {
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
    const userCompanyMap = new UserCompanyMap();
    userCompanyMap.companyId = this.companyId;
    userCompanyMap.roleName = userDetails.roleName;
    userCompanyMap.userCompanyMapStatus = UserCompanyMapStatusEnum.Active;
    userCompanyMap.userId = user.id;

    this.userService.addUserCompanyMap(userCompanyMap).subscribe(result => {
      if (result) {
        this.alertService.successToastr('User Linked Successfully');
        this.getData();
      }
    });
  }

  save(userDetails: UserDetails) {
    this.isLoading$.next(true);
    let alreadyExists = false;
    this.userService.getUserByUsername(userDetails.userContact.email).subscribe(user => {
      if (user) {
        this.userService.getUserCompanyMaps(user.id).subscribe(results => {
          if (results && results?.length > 0) {
            const index = results.findIndex(s => s.companyId === this.companyId && s.userId === user.id);
            alreadyExists = index > -1;
          }
          this.openExistsDialog(user, userDetails, alreadyExists);
        });
      } else {
        this.userService.getPendingUserActivation(userDetails.userContact.email).subscribe(activationId => {
          if (activationId !== -1) {
            this.userService.getPendingCompanyMaps(this.companyId, activationId).subscribe(pendingUserCompanyMaps => {
              if (pendingUserCompanyMaps && pendingUserCompanyMaps?.length > 0) {
                alreadyExists = true;
                this.openExistsDialog(user, userDetails, alreadyExists);
              } else {
                const userCompanyMap = new UserCompanyMap();
                userCompanyMap.companyId = this.companyId;
                userCompanyMap.roleName = userDetails.roleName;
                userCompanyMap.userActivationId = activationId;
                userCompanyMap.userCompanyMapStatus = UserCompanyMapStatusEnum.Pending;

                this.userService.addUserCompanyMap(userCompanyMap).subscribe(userCompanyMapId => {
                  if (userCompanyMapId) {
                    this.alertService.successToastr('User linked successfully');
                  } else {
                    this.alertService.errorToastr('User link failed');
                  }
                  this.getData();
                  this.isLoading$.next(false);
                });
              }
            });
          } else {
            userDetails.rolePlayerId = this.companyId;
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

  openAuditDialog(userCompanyMap: UserCompanyMap) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.Security,
        clientItemType: SecurityItemTypeEnum.UserCompanyMap,
        itemId: userCompanyMap.userCompanyMapId,
        heading: 'User Company Map Audit',
        propertiesToDisplay: ['UserCompanyMapStatus']
      }
    });
  }
}
