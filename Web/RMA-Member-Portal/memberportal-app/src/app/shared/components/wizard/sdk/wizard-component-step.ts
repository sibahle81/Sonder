// wiki: http:// bit.ly/2H1xoAn
// The wizard component step is used in the wizard component factory. It provides a string name to component mapping.

import { Type } from '@angular/core';
import { WizardComponentInterface } from './wizard-component.interface';

export class WizardComponentStep {
  constructor(
    public index: number,
    public name: string,
    public componentType: Type<WizardComponentInterface>,
    public isApprovalStep = false,
    public rejectOnCondition = false,
    public showfinishRejectionWithCondition = false) {
  }
}
