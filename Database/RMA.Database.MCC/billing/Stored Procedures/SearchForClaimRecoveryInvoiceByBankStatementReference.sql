CREATE PROCEDURE [billing].[SearchForClaimRecoveryInvoiceByBankStatementReference]
/* =============================================
Name:			SearchForClaimRecoveryInvoiceByBankStatementReference
Description:	Search For Claim Recovery Invoice By Bank Statement Reference
Author:			Sibahle Senda
Create Date:	2020-06-23
Change Date:	
Culprits:		
============================================= */
@statementReference varchar(100)
AS
BEGIN
		SELECT C.ClaimReferenceNumber, F.FinPayeNumber, C.ClaimId, I.ClaimRecoveryInvoiceId, R.RolePlayerId
		FROM [client].[RolePlayer] R INNER JOIN [billing].[Transactions] T
		ON T.RolePlayerId = R.RolePlayerId INNER JOIN [billing].[ClaimRecoveryInvoice] I
		ON I.ClaimRecoveryInvoiceId = T.ClaimRecoveryInvoiceId  INNER JOIN [claim].[Claim] C
		ON C.[ClaimId] = I.ClaimId INNER JOIN [client].[FinPayee] F
		ON F.RolePlayerId = R.[RolePlayerId]
		WHERE C.IsDeleted = 0 AND R.IsDeleted = 0
		AND T.TransactionTypeId = 14 -- claim recovery invoice transaction type
		AND I.InvoiceStatusId in (2,3,4) -- pending, partial,unpaid
		AND (CHARINDEX(lower(C.ClaimReferenceNumber), lower(@statementReference)) > 0 OR CHARINDEX(lower(F.FinPayeNumber), lower(@statementReference)) > 0)
		ORDER BY I.CreatedDate ASC
END
