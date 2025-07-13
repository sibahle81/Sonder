import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { HcpUserContextDialogComponent } from '../hcp-user-context-dialog/hcp-user-context-dialog.component';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';

@Component({
  selector: 'hcp-user-context-view',
  templateUrl: './hcp-user-context-view.component.html',
  styleUrls: ['./hcp-user-context-view.component.css']
})
export class HcpUserContextViewComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  userId: number;
  selectedHCPContext: UserHealthCareProvider;

  showIcon = true;

  constructor(
      public dialog: MatDialog,
      private authService: AuthService,
      private readonly userService: UserService
  ) { }

  ngOnInit() {
      const user = this.authService.getCurrentUser();

      this.userId = user.id;

      const hcpContext = userUtility.getSelectedHCPContext()

      if (hcpContext && hcpContext.healthCareProviderId > 0) {
        this.setContext(hcpContext);
        userUtility.setHCPContextReady(true);
        this.isLoading$.next(false);
      } else {
        userUtility.clearSelectedHCPContext();
        userUtility.setHCPContextReady(false);

        this.getDefault();
      }
  }

  getDefault() {
      this.userService.getUserHealthCareProviders(this.authService.getUserEmail()).subscribe(results => {
          if (results && results.length > 0) {
              this.setContext(results[0]);
          }
          userUtility.setHCPContextReady(true);
          this.isLoading$.next(false);
      });
  }

  setContext(result: UserHealthCareProvider) {
      userUtility.clearSelectedLinkedUserContext();
      this.selectedHCPContext = result;
      userUtility.setSelectedHCPContext(this.selectedHCPContext);
  }

  openHCPContextDialog() {
      const dialogRef = this.dialog.open(HcpUserContextDialogComponent, {
          width: '70%',
          disableClose: true,
          data: { userId: this.userId }
      });

      dialogRef.afterClosed().subscribe(result => {
          if (result) {
              this.setContext(result);
          }
      });
  }
}
