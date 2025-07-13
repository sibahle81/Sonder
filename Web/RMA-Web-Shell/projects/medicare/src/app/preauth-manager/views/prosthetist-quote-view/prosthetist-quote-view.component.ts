import { Component, OnInit } from '@angular/core';
import { MediCarePreAuthService } from '../../services/medicare-preauth.service';
import { ProsthetistQuote } from '../../models/prosthetistquote';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProstheticQuoteStatusEnum } from '../../../medi-manager/enums/prosthetic-quote-status-enum';
import { ProstheticQuotationTypeEnum } from '../../../medi-manager/enums/prosthetic-quotation-type-enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { Location } from '@angular/common';

@Component({
  selector: 'app-prosthetist-quote-view',
  templateUrl: './prosthetist-quote-view.component.html',
  styleUrls: ['./prosthetist-quote-view.component.css']
})
export class ProsthetistQuoteViewComponent implements OnInit {

  prosthetistQuote: ProsthetistQuote;
  loading$ = new BehaviorSubject<boolean>(false);
  prostheticQuoteStatusEnum: typeof ProstheticQuoteStatusEnum = ProstheticQuoteStatusEnum;
  prostheticQuotationTypeEnum: typeof ProstheticQuotationTypeEnum = ProstheticQuotationTypeEnum;
  prosthetistQuotationsById: number

  documentSet = DocumentSetEnum.MedicalProstheticDocuments;
  requiredDocumentsUploaded = false;
  documentSystemName = DocumentSystemNameEnum.MediCareManager;
  preAuthId: number;

  constructor(private readonly mediCarePreAuthService: MediCarePreAuthService, private readonly location: Location,
    private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.prosthetistQuotationsById = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.loading$.next(true);

    this.mediCarePreAuthService.getProsthetistQuotationsById(this.prosthetistQuotationsById).subscribe(res => {
      this.prosthetistQuote = res
      this.loading$.next(false);
    })
  }

  onNavigateBack() {
    this.location.back();
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
  }

}
