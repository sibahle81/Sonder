
export class PolicyDocumentCommunicationMatrix
{
    policyDocumentCommunicationMatrixId: number;
    policyId: number;
    sendPolicyDocsToBroker: boolean;
    sendPolicyDocsToAdmin: boolean;
    sendPolicyDocsToMember: boolean;
    sendPolicyDocsToScheme: boolean;
    sendPaymentScheduleToBroker: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}