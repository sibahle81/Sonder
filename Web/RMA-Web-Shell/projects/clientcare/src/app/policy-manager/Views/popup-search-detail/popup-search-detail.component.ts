import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-search-detail',
  templateUrl: './popup-search-detail.component.html',
  styleUrls: ['./popup-search-detail.component.css']
})
export class PopupSearchDetailComponent implements OnInit {
  isUploading: boolean;
  isNatural: boolean;
  scheme: string;
  parentPolicy:string;
  broker: string;
  relationship: string;
  benefitAmount: string;
  benefit: string;
  currPremium: string;
  annualPremium: string;

  rowData: any;
  form: any;
  constructor(
    public dialogRef: MatDialogRef<PopupSearchDetailComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.isUploading = true;
    const arrayData: any[] = JSON.parse(this.data.data);
    this.broker = arrayData[0].PolicyRecord.BrokerName;
    this.scheme = arrayData[0].PolicyRecord.SchemeName;
    this.relationship = arrayData[0].PolicyRecord.Relation;
    this.parentPolicy = arrayData[0].PolicyRecord.Parentpolicynumber;
    this.benefit = arrayData[0].PolicyRecord.BenefitName;
    this.benefitAmount = arrayData[0].PolicyRecord.BenefitAmount;
    this.currPremium = arrayData[0].PolicyRecord.CurrentPremium;
    this.annualPremium = arrayData[0].PolicyRecord.AnnualPremium;
    
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }


}
