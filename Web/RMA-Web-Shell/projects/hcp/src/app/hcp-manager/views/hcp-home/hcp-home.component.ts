import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-hcp-home',
  templateUrl: './hcp-home.component.html',
  styleUrls: ['./hcp-home.component.css'],
})
export class HcpHomeComponent extends PermissionHelper {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  selectedTabIndex: number = 0;

  HcpLogQueryPermission: string = 'Hcp Log Query';

  isContextReady(): boolean {
    const isReady = userUtility.isHCPContextReady();
    return isReady ? isReady : false;
  }

  getSelectedHCPContext(): number {
    const selectedHCPContext = userUtility.getSelectedHCPContext();
    return selectedHCPContext ? selectedHCPContext.healthCareProviderId : null;
  }
}

