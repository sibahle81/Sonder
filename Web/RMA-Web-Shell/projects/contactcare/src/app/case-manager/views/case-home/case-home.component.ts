import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';

@Component({
  templateUrl: './case-home.component.html',
  styleUrls: ['./case-home.component.css']
})
export class CaseHomeComponent extends PermissionHelper implements OnInit {

  targetModuleType = ModuleTypeEnum.ContactCare;

  constructor(
    public router: Router,
  ) {
    super();
  }

  ngOnInit() {
  }
}
