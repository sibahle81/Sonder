import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from './confirm-message.component';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ConfirmationDialogsService {

    constructor(private dialog: MatDialog) { }

    public confirm(
        title: string,
        message: string,
        viewContainerRef: ViewContainerRef,
        buttonOkText: string = 'Ok',
        buttonCancelText: string = 'Cancel'): Observable<boolean> {

        let dialogRef: MatDialogRef<ConfirmationDialogComponent>;
        const config = new MatDialogConfig();
        config.viewContainerRef = viewContainerRef;

        dialogRef = this.dialog.open(ConfirmationDialogComponent, config);

        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;
        dialogRef.componentInstance.buttonOkText = buttonOkText;
        dialogRef.componentInstance.buttonCancelText = buttonCancelText;

        return dialogRef.afterClosed();
    }

    public confirmWithoutContainer(
        title: string,
        message: string,
        titleAlign: string = 'center',
        messageAlign: string = 'center',
        buttonOkText: string = 'Ok',
        buttonCancelText: string = 'Cancel'): Observable<boolean> {

        let dialogRef: MatDialogRef<ConfirmationDialogComponent>;
        const config = new MatDialogConfig();

        dialogRef = this.dialog.open(ConfirmationDialogComponent, config);

        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;
        dialogRef.componentInstance.titleAlign = titleAlign;
        dialogRef.componentInstance.messageAlign = messageAlign;
        dialogRef.componentInstance.buttonOkText = buttonOkText;
        dialogRef.componentInstance.buttonCancelText = buttonCancelText;

        return dialogRef.afterClosed();
    }

    messageBoxWithoutContainer(title: string, message: string, titleAlign: string = 'center', messageAlign: string = 'center', buttonOkText: string = 'Ok'): Observable<boolean> {

        let dialogRef: MatDialogRef<ConfirmationDialogComponent>;
        // let config = new MatDialogConfig();
        // config.viewContainerRef = viewContainerRef;

        dialogRef = this.dialog.open(ConfirmationDialogComponent, { disableClose: true });

        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;
        dialogRef.componentInstance.titleAlign = titleAlign;
        dialogRef.componentInstance.messageAlign = messageAlign;
        dialogRef.componentInstance.buttonOkText = buttonOkText;
        dialogRef.componentInstance.showCancelButton = false;

        return dialogRef.afterClosed();
    }
}
