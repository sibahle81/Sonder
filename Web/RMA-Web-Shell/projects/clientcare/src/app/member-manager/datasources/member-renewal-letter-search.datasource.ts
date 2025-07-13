import { catchError, finalize } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { MemberService } from '../services/member.service';
import { EmailAudit } from 'projects/shared-models-lib/src/lib/common/emailAudit';
import { EmailNotificationAuditService } from 'projects/shared-components-lib/src/lib/email-notification-audit/email-notification-audit.service';

export class MemberRenewalLetterSearchDataSource extends PagedDataSource<EmailAudit> {
  constructor(private readonly memberService: MemberService,
    private readonly service: EmailNotificationAuditService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'CreatedDate', sortDirection: string = 'desc', query: string = '') {
    const itemType = 'Member Renewal Letter';
    this.loadingSubject.next(true);
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'CreatedDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    this.memberService.getPagedMemberRenewalEmailAudit(itemType, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<EmailAudit>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }

  getEmailAuitAndAttachmentData(auditId: number): Observable<EmailAudit> {
    return this.service.GetEmailAuditAndAttachment(auditId);
  }
}
