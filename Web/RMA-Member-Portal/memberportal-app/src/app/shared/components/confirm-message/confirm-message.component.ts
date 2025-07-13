import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    templateUrl: './confirm-message.component.html',
})
export class ConfirmationDialogComponent implements OnInit {
    public title: string;
    public message: string;
    public titleAlign?: string;
    public messageAlign?: string;
    public buttonOkText?: string;
    public buttonCancelText?: string;
    public showCancelButton: boolean = true;
    constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) { }

    ngOnInit() {
    }

}
