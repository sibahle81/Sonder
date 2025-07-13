import { OnInit, Directive } from '@angular/core';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Directive()
export abstract class MasterMenuComponent extends PermissionHelper implements OnInit {
    loadingMessage: string;

    protected constructor(
        private readonly appEventsManager: AppEventsManager) {
        super();
    }

    ngOnInit(): void {
        this.subscribeToLoadingChanged();
    }

    subscribeToLoadingChanged() {
        this.appEventsManager.loadingMessageChanged.subscribe(loadingMessage => {
            this.loadingMessage = loadingMessage;
        });
    }
}
