import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../lib/services/common/common.service';
import { PagedRequestResult } from '../../../../shared-models-lib/src/lib/pagination/PagedRequestResult';
import { CommonNote } from 'projects/shared-models-lib/src/lib/common/common-note';
import { CommonNoteSearchRequest } from 'projects/shared-models-lib/src/lib/common/common-note-search-request';

@Injectable({
  providedIn: 'root'
})
export class CommonNotesService {
  private apiUrl = 'mdm/api/CommonSystemNote';

  constructor(private readonly commonService: CommonService) {
  }

  addNote(note: CommonNote): Observable<number> {
    return this.commonService.postGeneric<CommonNote, number>(`${this.apiUrl}/CreateCommonSystemNote`, note);
  }

  editNote(note: CommonNote): Observable<boolean> {
    return this.commonService.edit<CommonNote>(note, `${this.apiUrl}/UpdateCommonSystemNote`);
  }

  getPagedNotes(commonNoteSearchRequest: CommonNoteSearchRequest): Observable<PagedRequestResult<CommonNote>> {
    return this.commonService.postGeneric<CommonNoteSearchRequest, PagedRequestResult<CommonNote>>(`${this.apiUrl}/GetPagedCommonSystemNotes`, commonNoteSearchRequest);
  }

  getNote(noteId: number): Observable<CommonNote> {
    return this.commonService.get<CommonNote>(noteId,`${this.apiUrl}/GetCommonSystemNote`);
  }

}