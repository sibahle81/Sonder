import { OnInit } from '@angular/core';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';

export abstract class MasterMenuComponent implements OnInit {
    loadingMessage: string;

    protected constructor(
        private readonly appEventsManager: AppEventsManager) {
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
