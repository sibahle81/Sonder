import { Component, EventEmitter, Input, OnInit, Output, ViewChild, } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ReferralTypeLimitConfiguration } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-referral/referral-type-limit-configuration';
import { AuthorityLimitsEditComponent } from '../authority-limits-edit/authority-limits-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { PermissionGroup } from 'projects/shared-models-lib/src/lib/security/permissiongroup';
import { Permission } from 'projects/shared-models-lib/src/lib/security/permission';

@Component({
  selector: 'app-authority-limits-list',
  templateUrl: './authority-limits-list.component.html',
  styleUrls: ['./authority-limits-list.component.css'],
})
// <!--THIS COMPONENT WILL BE DEPRECATED...PLEASE USE THE NEW AUTHORITY LIMITS FRAMEWORK COMPONENTS-->
export class AuthorityLimitsListComponent implements OnInit {

  @Input() showSelectButton: boolean = false;
  @Input() showEditButton: boolean = true;
  @Input() inEditPermissionsMode = false;
  @Input() permissionGroup: PermissionGroup;

  @Output() singleCheckedReferral: EventEmitter<number> = new EventEmitter();

  @Input() selectedComponentPermissions: number[] = [];
  @Input() currentEntityPermissions: number[] = [];
  @Input() roleSecurityRank: number;

  permissionSecurityRank: number;

  isLoading = false;
  isConfiguring$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  dataSource: MatTableDataSource<ReferralTypeLimitConfiguration>;
  displayColumns = ['referralname', 'amount', 'action'];
  referralTypeLimitConfiguration: ReferralTypeLimitConfiguration[];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private readonly claimCareService: ClaimCareService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.dataSource = new MatTableDataSource<ReferralTypeLimitConfiguration>();
    this.getReferralTypeLimitConfig();
  }

  switchReferralPermission(item: ReferralTypeLimitConfiguration): Permission {
    return this.permissionGroup?.permissions?.find(
      (x) => x?.name == item?.permissionName
    );
  }

  getReferralTypeLimitConfig() {
    this.isLoading = true;
    this.claimCareService.GetReferralTypeLimitConfiguration().subscribe((result: ReferralTypeLimitConfiguration[]) => {
      this.dataSource.data = result;
      setTimeout(() => (this.dataSource.paginator = this.paginator));
      this.isLoading = false;
    });
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  onEdit(item: ReferralTypeLimitConfiguration) {
    let ref = this.dialog.open(AuthorityLimitsEditComponent, {
      data: item,
      width: '600px',
    });

    ref.afterClosed().subscribe(() => {
      this.getReferralTypeLimitConfig();
    });
  }

  onSelect(item: ReferralTypeLimitConfiguration, elem: any) {
    if (elem.checked) {
      const found =
        this.selectedComponentPermissions.indexOf(
          this.switchReferralPermission(item).id,
          0
        ) > -1;
      if (!found) {
        this.selectedComponentPermissions.push(
          this.switchReferralPermission(item).id
        );
      }
    } else {
      const index = this.selectedComponentPermissions.indexOf(
        this.switchReferralPermission(item).id,
        0
      );
      this.selectedComponentPermissions.splice(index, 1);
    }
    this.singleCheckedReferral.emit(elem);
  }

  isChecked(item: ReferralTypeLimitConfiguration): boolean {
    let permissionId = this.permissionGroup.permissions.find(
      (x) => x.name == item.permissionName
    ).id;
    let result = this.selectedComponentPermissions.includes(permissionId, 0);
    return result;
  }
}
