import { Component, Input} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { HolistVopdDialogComponent } from './holist-vopd-dialog/holist-vopd-dialog.component';

@Component({
  selector: 'holistic-vopd-icon',
  templateUrl: './holistic-vopd-icon.component.html',
  styleUrls: ['./holistic-vopd-icon.component.css']
})
export class HolisticVopdIconComponent extends UnSubscribe {

  @Input() rolePlayer: RolePlayer;
  @Input() isWizard = false;
  @Input() personEventId: number;

  constructor(
    public dialog: MatDialog
  ) {
    super();
  }

  showVopdResults() {
    this.dialog.open(HolistVopdDialogComponent, {
      width: '1200px',
      maxHeight: '600px',
      data: {
        rolePlayer: this.rolePlayer,
        personEventId: this.personEventId,
      }
    });
  }
}
