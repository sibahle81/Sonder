import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-search-input',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
  })

export class SearchComponent implements OnInit {
    searchWord = '';
    @Input() placeHolder: string;
    @Output() searchcriteria = new EventEmitter<String>();

    constructor() {}

    ngOnInit() {

    }

    searchData() {
        this.searchcriteria.emit(this.searchWord);
    }

    clearInput() {
        this.searchcriteria.emit(this.searchWord = '');
    }

}
