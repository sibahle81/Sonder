import { dataExchangeModelBase } from "projects/shared-models-lib/src/lib/data-exchange/data-exchange-model";
import { fileExchangeBase } from "../file-exchange";
import * as XLSX from 'xlsx';

export class excelFileExchange extends fileExchangeBase {
    constructor() {
        super();
    }

    ImportData(dataExchangeModels: dataExchangeModelBase[]) {
        
    }
}