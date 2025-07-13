import { NgModule } from '@angular/core';
import { FrameworkModule } from 'src/app/framework.module';
import { ContactMainRoutingModule } from 'projects/contactcare/src/app/app-routing.module';
import { CaseManagerModule } from 'projects/contactcare/src/app/case-manager/case-manager.module';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    FrameworkModule,
    CaseManagerModule,
    ContactMainRoutingModule
  ],
  exports: [],
  providers: [
    DatePipe
  ],
  bootstrap: []
})
export class ContactMainAppModule { }

