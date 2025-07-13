import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';

import { TemplateSearchDataSource } from './template-search.datasource';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Template } from 'projects/admin/src/app/campaign-manager/shared/entities/template';

@Component({
  templateUrl: './template-search.component.html',

  selector: 'template-search'
})
export class TemplateSearchComponent implements OnInit {
  form: UntypedFormGroup;
  currentQuery: string;

  displayedColumns = ['templateName', 'template', 'actions'];
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  constructor(
    public readonly dataSource: TemplateSearchDataSource,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.clearData();
  }

  onSelect(item: Template): void {
    const itemType = item.campaignTemplateType === 1 ? 'Email' : 'Sms';
    this.router.navigate(['campaign-manager/template-details', itemType, item.id]);
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.query as string;
  }

  search(): void {
    if (this.form.valid) {
      this.currentQuery = this.readForm();
      this.dataSource.getData(this.currentQuery);
    }
  }

  clearFilter(): void {
    this.form.patchValue({ query: '' });
  }
}
