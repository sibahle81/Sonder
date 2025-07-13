import { NgModule } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { AuditLogService } from './services/audit-log.service';
import { CommonService } from './services/common/common.service';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [

  ],
  exports: [

  ],
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
    UserService,
    AuditLogService,
    CommonService
  ]
})
export class CoreModule { }
