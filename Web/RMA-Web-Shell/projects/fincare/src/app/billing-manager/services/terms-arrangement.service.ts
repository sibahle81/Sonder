import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { TermArrangement } from '../models/term-arrangement';
@Injectable()
export class TermsArrangementService {
  private api = 'bill/api/billing/TermsArrangement';

  constructor(private readonly commonService: CommonService) { }
 }
