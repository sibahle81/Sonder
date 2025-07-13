import { Component, OnInit, Inject } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'src/app/shared-utilities/datepicker/dateformat';
import { RolePlayerPolicy } from 'src/app/shared/models/role-player-policy';

@Component({
  selector: 'app-policy-list-dialog',
  templateUrl: './policy-list-dialog.component.html',
  styleUrls: ['./policy-list-dialog.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class PolicyListDialogComponent implements OnInit {

  roleplayerId: number;
  showJoinDate = false;
  policies: RolePlayerPolicy[] = [];

  constructor(
    public dialogRef: MatDialogRef<PolicyListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    console.log('policy dialog data:', data);
    this.roleplayerId = data.roleplayerId;
    this.policies = data.policies;
    this.showJoinDate = data.showJoinDate;
    this.policies.forEach(
      p => {
        const life = p.insuredLives.find(il => il.rolePlayerId === this.roleplayerId);
        if (life) {
          p.policyInceptionDate = life.startDate;
        }
      }
    );
  }

  ngOnInit() { }

  isFirstDay = (d: Date): boolean => {
    const date = d.getDate();
    const val = date / 1 === 1;
    return val;
  }

  getDisplayedColumns(): string[] {
    if (this.showJoinDate) {
      return ['selected', 'policyNumber', 'policyInceptionDate'];
    } else {
      return ['selected', 'policyNumber'];
    }
  }

  selectPolicy(event: any, policy: RolePlayerPolicy): void {
    policy.selected = event.checked;
  }

  saveRoleplayerPolicies(): void {
    console.log('save policies:', this.policies);
    this.dialogRef.close(this.policies);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
