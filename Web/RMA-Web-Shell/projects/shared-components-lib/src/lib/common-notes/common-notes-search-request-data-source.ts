
import { CommonNote } from 'projects/shared-models-lib/src/lib/common/common-note';
import { CommonNotesService } from 'projects/shared-services-lib/src/lib/services/common-notes.service';
import { CommonNoteSearchRequest } from 'projects/shared-models-lib/src/lib/common/common-note-search-request';
import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';

@Injectable({
  providedIn: 'root'
})
export class CommonNotesSearchRequestDataSource extends PagedDataSource<CommonNote> {

  noteItemType: NoteItemTypeEnum;
  noteType: NoteTypeEnum;
  noteCategory: NoteCategoryEnum;
  moduleType: ModuleTypeEnum[];
  text:string;
  itemId: number;
  userId: number;
  isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly commonNotesService: CommonNotesService) {
    super();
  }

  getData(page: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy ? orderBy : 'createdDate';
    pagedRequest.page = page ? page : 1;
    pagedRequest.pageSize = pageSize ? pageSize : 5;
    pagedRequest.searchCriteria = query ? query : '';
    pagedRequest.isAscending = sortDirection == 'asc';

    const commonNoteSearchRequest = new CommonNoteSearchRequest();
    commonNoteSearchRequest.noteItemType = this.noteItemType;
    commonNoteSearchRequest.noteType = this.noteType;
    commonNoteSearchRequest.noteCategory = this.noteCategory;
    commonNoteSearchRequest.moduleType = this.moduleType;
    commonNoteSearchRequest.itemId = this.itemId;
    commonNoteSearchRequest.text = query.length > 0 ? query : this.text;

    commonNoteSearchRequest.startDateFilter = null;
    commonNoteSearchRequest.endDateFilter = null;
    commonNoteSearchRequest.pagedRequest = pagedRequest;

    this.commonNotesService.getPagedNotes(commonNoteSearchRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      if (result) {
        this.data = result as PagedRequestResult<CommonNote>;
        this.data.page = page;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.isLoaded$.next(true);
        this.loadingSubject.next(false);
      }
    });
  }
}
