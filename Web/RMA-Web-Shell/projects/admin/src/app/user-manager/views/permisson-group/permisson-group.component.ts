import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PermissionGroup } from 'projects/shared-models-lib/src/lib/security/permissiongroup';

@Component({
  selector: 'permisson-group',
  templateUrl: './permisson-group.component.html',
  styleUrls: ['./permisson-group.component.css'],
})
export class PermissonGroupComponent implements OnChanges {

  @Input() permissionGroup: PermissionGroup;
  @Input() selectedComponentPermissions: number[] = [];
  @Input() currentEntityPermissions: number[] = [];
  @Input() inEditPermissionsMode = false;
  @Input() roleSecurityRank: number;

  @Output() multipleChecked: EventEmitter<number> = new EventEmitter();
  @Output() multipleUnChecked: EventEmitter<number> = new EventEmitter();
  @Output() singleChecked: EventEmitter<number> = new EventEmitter();

  permissionSecurityRank: number;
  permissionGroupId = 0;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.filterGroupPermissions();
  }

  onSelect(item: any) {
    if (item.checked) {
      this.selectedComponentPermissions.push(item.value);
    } else {
      const index = this.selectedComponentPermissions.indexOf(
        parseInt(item.value)
      );
      if (index > -1) {
        this.selectedComponentPermissions.splice(index, 1);
      }
    }
    this.singleChecked.emit(item);
  }
  
  onSelectAll(item: any) {
    if (item.checked) {
      this.selectedComponentPermissions = [];
      this.selectedComponentPermissions = this.getAllGroupPermissions();
    } else {
      this.selectedComponentPermissions = [];
    }
    this.multipleChecked.emit(item);
  }

  filterGroupPermissions(): void {
    var permissions = this.permissionGroup.permissions.map((c) => c.id);

    this.currentEntityPermissions.forEach((item) => {
      const index = permissions.indexOf(item, 0);
      if (index > -1) {
        this.selectedComponentPermissions.push(item);
      }
    });

    if (this.permissionGroup.name == 'Claim Limits') {
      this.permissionGroupId = this.permissionGroup.id;
    }
  }

  getAllGroupPermissions(): number[] {
    return this.permissionGroup.permissions.map((c) => c.id);
  }
}
