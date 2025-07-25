CREATE PROCEDURE [billing].[GetUnpaidInvoicesByPolicyId]
@unpaidStatusId int,
@policyId int,
@pendingStatusId int,
@partiallyPaidStatusId int  
AS
    BEGIN	
		SELECT   InvoiceId
					FROM [billing].[Invoice]
					WHERE    InvoiceStatusId in (@unpaidStatusId,@pendingStatusId,@partiallyPaidStatusId) and PolicyId = @policyId
    END
