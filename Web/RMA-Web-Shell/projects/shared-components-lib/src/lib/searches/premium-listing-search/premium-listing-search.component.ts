import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-premium-listing-search',
  templateUrl: './premium-listing-search.component.html',
  styleUrls: ['./premium-listing-search.component.css']
})
export class PremiumListingSearchComponent implements OnInit {
  @Output() searchcriteria = new EventEmitter<any>(); 
  @Input() companies: { id: number, name: string }[] = []; 
  @Input() branches: { id: number, name: string }[] = []; 
  @Input() controls: { id: number, number: number, name: string }[] = []; 

  searchForm: UntypedFormGroup;

  constructor(private readonly formBuilder: UntypedFormBuilder) {
    this.createForm();
  }

  ngOnInit(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged() 
      )
      .subscribe((filters) => {
        const emitFilters = {
          ...filters,
          controlNumber: filters.controlNumber
        };
        this.searchcriteria.emit(emitFilters);
      });
  }

  createForm(): void {
    this.searchForm = this.formBuilder.group({
      company: [''],
      branch: [''],  
      controlNumber: [-1], 
      startDate: [''], 
      endDate: [''],
      searchText: ['']
    });
  }

  clear(): void {
    this.searchForm.reset({
      company: '',
      branch: '',
      controlNumber: -1,
      startDate: '',
      endDate: '',
      searchText: ''
    });
    this.searchcriteria.emit(this.searchForm.value);
  }

}