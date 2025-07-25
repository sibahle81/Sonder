CREATE PROCEDURE [billing].[SearchForClaimRecoveryDebtorByBankStatementReference]
/* =============================================
Name:			SearchForClaimRecoveryDebtorByBankStatementReference
Description:	
Author:			Sibahle Senda
Create Date:	2020-06-23
Change Date:	
Culprits:		
============================================= */
@statementReference varchar(100)
AS
BEGIN
	SELECT TOP 1 F.[RolePlayerId]
      ,F.[FinPayeNumber]
      ,F.[IsAuthorised]
      ,F.[AuthroisedBy]
      ,F.[AuthorisedDate]
      ,F.[IsDeleted]
      ,F.[CreatedBy]
      ,F.[CreatedDate]
      ,F.[ModifiedBy]
      ,F.[ModifiedDate]
	  ,ISNULL(F.[IndustryId], 0) IndustryId
		FROM [client].[RolePlayer] R INNER JOIN [billing].[Transactions] T
		ON T.RolePlayerId = R.RolePlayerId INNER JOIN [billing].[ClaimRecoveryInvoice] I
		ON I.ClaimRecoveryInvoiceId = T.ClaimRecoveryInvoiceId  INNER JOIN [claim].[Claim] C
		ON C.[ClaimId] = I.ClaimId INNER JOIN [client].[FinPayee] F
		ON F.RolePlayerId = R.[RolePlayerId]
		WHERE C.IsDeleted = 0 AND R.IsDeleted = 0
		AND T.TransactionTypeId = 14 -- claim recovery invoice transaction type
		AND (CHARINDEX(lower(C.ClaimReferenceNumber), lower(@statementReference)) > 0 OR CHARINDEX(lower(F.FinPayeNumber), lower(@statementReference)) > 0)
END
