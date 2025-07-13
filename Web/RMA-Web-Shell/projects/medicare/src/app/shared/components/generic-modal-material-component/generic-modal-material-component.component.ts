import { Component, OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-generic-modal-material-component',
  templateUrl: './generic-modal-material-component.component.html',
  styleUrls: ['./generic-modal-material-component.component.css']
})
export class GenericModalMaterialComponentComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  selectedPersonEvent: PersonEventModel
  event: EventModel;
  isWizard = false;
  isReadOnly = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<GenericModalMaterialComponentComponent>,
  ) { }

  ngOnInit() {
    this.isLoading$.next(true);
    this.getInputValues()

  }

  getInputValues() {
    if (this.data.inputs) {
      Object.keys(this.data.inputs).forEach(inputName => {
        switch (inputName) {
          case 'personEvent':
            this.selectedPersonEvent = this.data.inputs[inputName]
            break;
          case 'event':
            this.event = this.data.inputs[inputName]
            break;
          case 'isWizard':
            this.isWizard = this.data.inputs[inputName]
            break;
          case 'isReadOnly':
            this.isReadOnly = this.data.inputs[inputName]
            break;
          default:
            break;
        }
      })
    }
    this.isLoading$.next(false);
  }

  onClose() {
    this.dialogRef.close()
  }

}