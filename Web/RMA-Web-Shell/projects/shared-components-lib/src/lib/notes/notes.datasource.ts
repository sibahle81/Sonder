import { Injectable } from '@angular/core';
import { Observable, merge, of } from 'rxjs';

import { Note } from './note';
import { NotesRequest } from './notes-request';
import { NotesService } from './notes.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { map } from 'rxjs/operators';

@Injectable()
export class NotesDatasource extends Datasource {
    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly noteService: NotesService
    ) {
        super(appEventsManager, alertService);
    }

    // used in the wizard if the data is available for use directly
    setNotesData(notes: Note[]): void {
        if (notes.length > 0) {
            of(notes).subscribe(data => {
                this.dataChange.next(data || []);
                this.stopLoading();
            },
                error => {
                    this.showError(error);
                    this.stopLoading();
                });
        } else {
            this.dataChange.next([]);
            this.stopLoading();
        }
    }

    // used in other views when data must be collected from the service
    getData(noteRequest: NotesRequest): void {
        this.noteService.getNotes(noteRequest.serviceType, noteRequest.itemType, noteRequest.itemId).subscribe(
            notes => {
                this.dataChange.next(notes);
                this.stopLoading();
            });
    }

    connect(): Observable<Note[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Note) => {

                const searchStr = (item.text + item.itemType).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
