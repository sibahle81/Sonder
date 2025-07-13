import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { interval } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { UserIdleService } from 'projects/shared-services-lib/src/lib/services/user-idle/user-idle.service';

@Component({
    templateUrl: './idle-dialog.component.html',
})
export class IdleDialogComponent implements OnInit {
    value: number;
    seconds: number;
    countDown: number;
    color: string;

    constructor(public dialogRef: MatDialogRef<IdleDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private readonly userIdleService: UserIdleService,
                private readonly authService: AuthService,
                private readonly router: Router,
                private readonly appEventsManager: AppEventsManager,
                private readonly matDialogs: MatDialog) {
        this.dialogRef.disableClose = true;
    }

    ngOnInit() {
        this.color = 'primary';
        this.value = 100;
        this.seconds = this.userIdleService.getConfigValue().timeout;
        this.countDown = this.seconds;
        this.internalTimer();
        this.subscribeCounter();
    }

    /**
     * Subscribe to timeout..
     */
    subscribeCounter(): void {
        this.userIdleService.onTimeout().subscribe(isDone => {
            if (isDone) {
                this.timeout();
            }
        });
    }

    /**
     * Internal timer
     */
    private internalTimer(): void {
        const seconds = interval(1000);
        seconds.subscribe((n: number) => {
            this.countDown -= 1;
            this.value = ((this.countDown / this.seconds) * 100);

            if (this.countDown <= 15) {
                this.color = 'warn';
            }
        });
    }

    /**
     * Ccontinue to use the system
     */
    onContinueClick(): void {
        this.userIdleService.resetTimer();
        this.dialogRef.close();
    }

    /**
     * On Manual Logoff
     */
    onLogoffClick(): void {
        this.userIdleService.stopTimer();
        this.dialogRef.close();
        this.matDialogs.closeAll();
        this.router.navigate(['sign-in']);
        this.authService.logout();
        this.appEventsManager.setLoggedInUser(null);
    }

    timeout(): void {
        this.userIdleService.stopTimer();
        this.dialogRef.close();
        this.matDialogs.closeAll();
        this.router.navigate(['sign-in'], { queryParams: { returnUrl: this.router.routerState.snapshot.url } });
        this.authService.logout();
        this.appEventsManager.setLoggedInUser(null);
    }
}
