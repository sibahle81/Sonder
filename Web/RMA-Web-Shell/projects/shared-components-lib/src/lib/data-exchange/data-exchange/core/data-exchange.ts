import { dataExchangeModelBase } from "projects/shared-models-lib/src/lib/data-exchange/data-exchange-model"

export abstract class DataExchangeBase {
    ReadData(files: FileList):any{}
    ImportBinaryData(blob:Blob):void{}
    ImportData(dataExchangeModels:dataExchangeModelBase[]):void{}
    ExportData:dataExchangeModelBase[];
    ValidateData(dataExchangeModels:dataExchangeModelBase[]):any{}

    constructor() {
        
    }
}