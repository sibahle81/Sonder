import { DataExchangeBase } from "../data-exchange";

export abstract class fileExchangeBase extends DataExchangeBase {
    header: any[][];
    data: any[][];
    evtData:any;

    invalidHeader: any[][];
    invalidData: any[][] = [];

    files: FileList;
    protected reader: FileReader = new FileReader();

    constructor() {
        super();
        
    }

    ImportBinaryData(data:any): void {
        const target: DataTransfer = <DataTransfer>(data);
        this.files = target.files;
    }
}