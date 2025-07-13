import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-questionnaire-delete',
  templateUrl: './popup-questionnaire-delete.component.html',
  styleUrls: ['./popup-questionnaire-delete.component.css']
})
export class PopupQuestionnaireDeleteComponent implements OnInit {
  isUploading: boolean;
  message: string;
  form: any;
  constructor(
    public dialogRef: MatDialogRef<PopupQuestionnaireDeleteComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.isUploading = true;
    this.message = this.data.data;
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }


  Delete(): void {
    this.dialogRef.close(true);
  }

  readForm(): string {
    const formModel = this.form.value;
    this.message = formModel.message;
    return this.message;
  }
}
