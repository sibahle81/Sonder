CREATE PROCEDURE [billing].[GetPoliciesWithTwoConsecutiveUnmets]
	@invoiceStatusId int,
	@monthEndDate DATETIME 
AS BEGIN		
	SELECT   BI.[PolicyId], 
		CR.CellNumber, 
		CR.EmailAddress, 
		PP.PolicyNumber, 
		CR.PreferredCommunicationTypeId, 
		BR.Email AS CCEmail, 
		CR.DisplayName,
		CR.TellNumber
		,BI.InvoiceDate
	FROM [billing].[Invoice] BI with (nolock)
		JOIN [policy].[Policy] PP with (nolock) ON BI.PolicyId = PP.PolicyId
		JOIN [client].[RolePlayer] CR with (nolock) ON PP.PolicyOwnerId = CR.RolePlayerId
		LEFT JOIN [broker].[Representative] BR with (nolock) ON PP.RepresentativeId = BR.Id
	WHERE BI.PolicyId IN (
		SELECT  in1.PolicyId
		FROM billing.Invoice in1
		WHERE InvoiceDate = any (SELECT DATEADD(mm, 1, InvoiceDate)
		FROM billing.Invoice in2, billing.Transactions t
		WHERE in1.PolicyId = in2.PolicyId
		AND t.InvoiceId = in2.InvoiceId
		AND (SELECT dbo.GetTransactionBalance(t.TransactionId)) = t.Amount)) AND PP.PolicyStatusId IN (SELECT Id FROM  [common].[PolicyStatus] 
		WHERE Name in ('Active','Reinstated')
	)
	AND PP.ParentPolicyId IS NULL

END
