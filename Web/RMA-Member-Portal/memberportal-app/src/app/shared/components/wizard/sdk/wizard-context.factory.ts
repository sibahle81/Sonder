import { Injectable } from '@angular/core';
import { WizardContext } from '../shared/models/wizard-context';

@Injectable({
  providedIn: 'root',
})
export class WizardContextFactory {
  private wizardContexts: WizardContext[];

  constructor() {
    this.wizardContexts = new Array();
  }

  addWizardContext(context: WizardContext, name: string) {
    context.name = name;
    this.wizardContexts.push(context);
  }

  createContext(type: string): WizardContext {
    const localContext = this.wizardContexts.find(context => context.name.toLowerCase() === type.toLowerCase());
    if (localContext === undefined) {
      throw new Error(`Could not create wizard ${type}`);
    }
    return localContext;
  }
}
