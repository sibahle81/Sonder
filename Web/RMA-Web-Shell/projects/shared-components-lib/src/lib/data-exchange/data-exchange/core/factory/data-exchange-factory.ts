import { dataExchangeModelBase } from "projects/shared-models-lib/src/lib/data-exchange/data-exchange-model";
import { DataExchangeBase } from "../data-exchange";
import { excelFileExchange } from "../fileExchange/excel/excel-file-exchange";
import { excelDataExchangeModel } from "projects/shared-models-lib/src/lib/data-exchange/fileExchange/excel/excel-data-exchange";
import { csvFileExchange } from "../fileExchange/csv/csv-file-exchange";
import { csvDataExchangeModel } from "projects/shared-models-lib/src/lib/data-exchange/fileExchange/csv/csv-data-exchange";

export class DataExchangeFactory {
    CreateDataExchange(dataExchangeModelBase: dataExchangeModelBase): DataExchangeBase {
        if(dataExchangeModelBase instanceof(excelDataExchangeModel))
            return new excelFileExchange();
        if(dataExchangeModelBase instanceof(csvDataExchangeModel))
            return new csvFileExchange();
    }
}