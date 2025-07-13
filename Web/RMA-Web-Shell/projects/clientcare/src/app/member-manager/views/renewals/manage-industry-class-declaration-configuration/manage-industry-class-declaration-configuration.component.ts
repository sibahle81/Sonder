import { Component, OnInit } from '@angular/core';
import { IndustryClassDeclarationConfiguration } from '../../../models/industry-class-declaration-configuration';
import { DeclarationService } from '../../../services/declaration.service';

@Component({
  selector: 'manage-industry-class-declaration-configuration',
  templateUrl: './manage-industry-class-declaration-configuration.component.html',
  styleUrls: ['./manage-industry-class-declaration-configuration.component.css']
})
export class ManageIndustryClassDeclarationConfigurationComponent implements OnInit {

  industryClassDeclarationConfigurations: IndustryClassDeclarationConfiguration[];

  constructor(
    private readonly declarationService: DeclarationService
  ) { }

  ngOnInit(): void {
    this.declarationService.getIndustryClassDeclarationConfigurations().subscribe(result => {
      this.industryClassDeclarationConfigurations = result;
    });
  }

}
