CREATE PROCEDURE [billing].[GetPolicyInvoice]
/* =============================================
Name:			GetPolicyInvoice
Description:	GetPolicyInvoice
Author:			Baldwin Khosa
Create Date:	2022-10-27
Change Date:	
Culprits:		
============================================= */
@policyId int
AS
BEGIN

SELECT * 
FROM billing.Invoice i
INNER JOIN billing.InvoiceAllocation a on a.InvoiceAllocationId = i.InvoiceId
WHERE i.PolicyId = @policyId 

END