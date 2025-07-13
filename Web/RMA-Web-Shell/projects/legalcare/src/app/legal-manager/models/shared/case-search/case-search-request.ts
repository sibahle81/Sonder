export class ClaimSearchRequest {
    request: Request;
}

export class Request {
    claimReferenceNo: string;
    sourceSystemReference: string;
    sourceSystemRoutingID: string;
    medicalReportSystemSourceId: number;
}
