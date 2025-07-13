import { Payment } from "./payment.model";

export class PagedPaymentResponse{
    data : Payment[];
    rowCount : number;
    page : number;
    pageSize : number;

}