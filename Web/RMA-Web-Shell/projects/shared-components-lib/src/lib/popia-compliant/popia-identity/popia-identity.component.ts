import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { PopiaAccessLevelEnum } from '../popia-sensitivity-level-enum';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'popia-identity',
  templateUrl: './popia-identity.component.html',
  styleUrls: ['./popia-identity.component.css']
})
export class PopiaIdentityComponent implements OnInit, OnChanges {
  // Usage: <popia-identity [rolePlayer]="member"></popia-identity>

  // ----- start default inputs and values for all components -----
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  // ---------------------------------------------------

  // ------- generic inputs for this components --------
  @Input() rolePlayer: RolePlayer;
  // ---------------------------------------------------

  // internal variables
  form: UntypedFormGroup;
  currentUserAccessLevel = PopiaAccessLevelEnum.ViewNone;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
  ) { this.createForm(); }

  ngOnInit() {
    this.setCurrentUserAccessLevel();
  }

  setCurrentUserAccessLevel() {
    this.currentUserAccessLevel = userUtility.hasPermission('POPIA View Sensitive Data') ?
      PopiaAccessLevelEnum.ViewSensitiveData : PopiaAccessLevelEnum.ViewNone;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createForm();
    this.setForm();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      identityNumber: [{ value: '', disabled: this.isReadOnly }],
    });
  }

  setForm() {
    this.form.patchValue({ identityNumber: this.formatData('8403065091082') });
  }

  formatData(value: string): string {
    switch (this.currentUserAccessLevel) {
      case PopiaAccessLevelEnum.ViewNone: return value.replace(/.(?=.{4,}$)/g, '*');
      case PopiaAccessLevelEnum.ViewSensitiveData: return value;
    }
  }
}
