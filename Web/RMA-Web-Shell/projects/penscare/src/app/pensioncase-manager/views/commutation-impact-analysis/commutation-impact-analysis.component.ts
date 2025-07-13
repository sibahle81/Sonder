import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormUtil } from 'projects/shared-utilities-lib/src/lib/form-utility/form-utility';
import { CommutationImpactAnalysis } from '../../models/commutation-impact-analysis.model';
import { CommutationService } from '../../services/commutation.service';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';

interface Iform {
  impactValue: FormControl<string|null>,
  availAmount: FormControl<string|null>,
  requiredAmount: FormControl<Date|null>,
  currentNMP: FormControl<Date|null>,
  newNMP: FormControl<number|null>,
  value: FormControl<string|null>,
}

class ComponentInputData {
  id: number;
  pensionLedger?: PensionLedger;
  impactAnalysis?: CommutationImpactAnalysis
}

@Component({
  selector: 'app-commutation-impact-analysis',
  templateUrl: './commutation-impact-analysis.component.html',
  styleUrls: ['./commutation-impact-analysis.component.css']
})
export class CommutationImpactAnalysisComponent {
  @Input() componentInputData: ComponentInputData;

  form: FormGroup;
  formUtil = new FormUtil();

  constructor(private readonly _fb: FormBuilder,
              private readonly _commutationService: CommutationService,
              private readonly _router: Router,
              private _activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.createForm();
    this._activatedRoute.params.subscribe((params: any) => {
      if (params.pensionLedgerId) {
        this.componentInputData = new ComponentInputData();
        this.componentInputData['id'] = params.pensionLedgerId;
        this._commutationService.calculateImpactAnalysis(params.pensionLedgerId).subscribe((res) => {
            this.componentInputData.impactAnalysis = res;
        })
      }
    });

  }

  poulateForm(item: CommutationImpactAnalysis) {
      this.form.patchValue({
        newNMP: item.nMP,
        impactValue: item.impactAmount,
        availAmount: item.maximumAmount,
        currentNMP: this.componentInputData.pensionLedger.currentMonthlyPension
      })
  }

  createForm(): void {

    this.form = this._fb.group<Iform>({
      impactValue: new FormControl(),
      availAmount: new FormControl(),
      requiredAmount: new FormControl(null, { validators: Validators.required }),
      currentNMP: new FormControl(),
      newNMP:new FormControl(),
      value:new FormControl()
    });
  }
}
