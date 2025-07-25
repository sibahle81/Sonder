--=============================================
 --Author:		bongani makelane
 --Create date: 27/06/2020
 --=============================================
CREATE   PROCEDURE [billing].[GetRefundAmountBasedOnAllocations]
	@policyId INT
AS
BEGIN
Select IA.*   from billing.InvoiceAllocation IA
inner join  billing.Invoice I on IA.InvoiceId = I.InvoiceId
inner join billing.Transactions T on IA.TransactionId = T.transactionId
where I.PolicyId = @policyId AND T.TransactionTypeId = 3 
END
