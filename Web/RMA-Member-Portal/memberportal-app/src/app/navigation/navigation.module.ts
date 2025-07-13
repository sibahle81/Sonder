import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from '../app-routing.module';
import { AngularMaterialsModule } from '../modules/angular-materials.module';

@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    RouterModule,
    AppRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularMaterialsModule,
  ],
  exports: [
    HeaderComponent,
    RouterModule,
    AppRoutingModule
  ]
})
export class NavigationModule { }
