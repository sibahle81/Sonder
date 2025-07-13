import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';

@Component({
  selector: 'role-display-name',
  templateUrl: './role-display-name.component.html',
  styleUrls: ['./role-display-name.component.css']
})
export class RoleDisplayNameComponent implements OnChanges {

  @Input() roleId: number;
  @Output() roleEmit: EventEmitter<Role> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  role: Role;

  message: string;

  constructor(
    private readonly userService: UserService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.roleId) {
      this.getRole();
    } else {
      this.message = 'N/A';
      this.isLoading$.next(false);
    }
  }

  getRole() {
    this.isLoading$.next(true);
    this.message = null;

    if (this.roleId) {
      this.userService.getRole(this.roleId).subscribe(result => {
        this.role = result;
        this.roleEmit.emit(this.role);
        this.isLoading$.next(false);
      }, error => {
        this.message = this.role?.name ? this.role?.name : '-';
        this.isLoading$.next(false);
      });
    }
  }
}
