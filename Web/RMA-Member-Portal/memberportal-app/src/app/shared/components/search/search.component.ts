import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-search-input',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})

export class SearchComponent implements OnInit {
    searchWord = '';
    @Input() placeHolder: string;
    @Output() searchcriteria = new EventEmitter<string>();
    @Output() emptyData = new EventEmitter<boolean>();

    constructor() { }

    ngOnInit() {

    }

    searchData() {
        this.searchcriteria.emit(this.searchWord);

        this.resetTablePaginator();
    }

    clearInput() {
        this.searchcriteria.emit(this.searchWord = '');

        this.resetTablePaginator();
    }

    resetTablePaginator() {
        if (this.searchWord == '') {
            this.emptyData.emit(true);
        }
    }
}
