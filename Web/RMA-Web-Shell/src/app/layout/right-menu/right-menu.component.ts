import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-right-menu',
    templateUrl: './right-menu.component.html',
    styleUrls: ['./right-menu.component.css']
})
export class RightMenuComponent implements OnInit {

    constructor(public dialogRef: MatDialogRef<RightMenuComponent>, ) {
    }
    ngOnInit(): void {
        const container = document.getElementById('rightMenuCard').parentElement;
        container.style.display = 'contents !important';
        container.style.padding = '0';
    }
    closeDialog(): void {
        this.dialogRef.close();
    }
}
