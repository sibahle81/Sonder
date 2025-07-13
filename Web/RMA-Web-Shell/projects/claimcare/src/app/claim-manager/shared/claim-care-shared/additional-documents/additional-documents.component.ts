import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { ClaimAdditionalRequiredDocument } from '../../entities/claim-additional-required-document';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'additional-documents',
  templateUrl: './additional-documents.component.html',
  styleUrls: ['./additional-documents.component.css']
})
export class AdditionalDocumentsComponent implements OnInit {
  
  @Input() personEvent: PersonEventModel;
  @Input() isAdditionalDocumentsLoading = false;
  @Input() additionalRequiredDocuments: ClaimAdditionalRequiredDocument[];
  @Output() fetchAdditionalRequiredDocuments = new EventEmitter<void>();
  
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading additional documents...please wait');
  constructor(
    private readonly claimService: ClaimCareService,
  ) { }

  ngOnInit(): void {
    this.fetchAdditionalRequiredDocuments.emit();
  }

  update(): void {
    this.fetchAdditionalRequiredDocuments.emit();
    }
}
