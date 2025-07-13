import { Component, Input } from '@angular/core';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

@Component({
  templateUrl: './last-modified-by.component.html',
  // tslint:disable-next-line:component-selector
  selector: 'last-modified-by'
})
export class LastModifiedByComponent {
  @Input() type: string;
  lastModifiedBy: string;
  lastModifiedDate: Date;

  constructor(
    public readonly privateUserService: UserService,
    private readonly authService: AuthService) {
  }

  getDisplayName(baseClass: BaseClass): void {
    if (!baseClass || !baseClass.modifiedBy || baseClass.modifiedBy === '') { return; }

    const currentUser = this.authService.getUserEmail();
    this.lastModifiedDate = baseClass.modifiedDate;

    if (currentUser === baseClass.modifiedBy) {
      this.lastModifiedBy = 'you';
    } else {
      this.privateUserService.getLastModifiedByUserDetails(baseClass.modifiedBy).subscribe(
        user => this.lastModifiedBy = user.name,
        () => this.lastModifiedBy = baseClass.modifiedBy);
    }
  }

  getDisplayNameByField(modifiedBy: string, modifiedDate: Date): void {
    if (!modifiedBy || modifiedBy === '') { return; }

    const currentUser = this.authService.getUserEmail();
    this.lastModifiedDate = modifiedDate;

    if (currentUser === modifiedBy) {
      this.lastModifiedBy = 'you';
    } else {
      this.privateUserService.getLastModifiedByUserDetails(modifiedBy).subscribe(
        user => this.lastModifiedBy = user.name,
        () => this.lastModifiedBy = modifiedBy);
    }
  }


  clearDisplayName(): void {
    this.lastModifiedBy = null;
  }
}
