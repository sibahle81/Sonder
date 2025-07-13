import { AfterContentChecked, AfterViewChecked, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";

import { LookupService } from "projects/shared-services-lib/src/lib/services/lookup/lookup.service";
import { Lookup } from "projects/shared-models-lib/src/lib/lookup/lookup";

@Component({
  selector: 'lib-refresh-document-reason',
  templateUrl: './refresh-document-reason.component.html',
  styleUrls: ['./refresh-document-reason.component.css']
})
export class RefreshDocumentReasonComponent implements OnInit, AfterContentChecked {

  reasons: Lookup[] = [];
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RefreshDocumentReasonComponent>,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly lookupService: LookupService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      reason: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.lookupService.getDocumentRefreshReasons().subscribe({
      next: (data: Lookup[]) => {
        this.reasons = data;
      }
    });
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.reason);
    }
  }
}
