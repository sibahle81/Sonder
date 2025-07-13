/* =============================================
Name:			AllocateTransactionToCorrectIdustry
Description:	
Author:			Baldwin Khosa
Create Date:	2022-07-29
Change Date:	
Culprits:		
============================================= */
CREATE PROCEDURE [billing].[AllocateTransactionToCorrectIndustry]

@roleplayerId int,
@bankAccountNumber varchar(100)
AS
BEGIN
	SELECT F.[RolePlayerId]
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
	FROM [Client].[FinPayee] F
	JOIN [Common].[Industry] I on I.Id= F.Industryid
	JOIN [Common].[IndustryClass] IC on IC.Id = I.IndustryClassId
	JOIN [Product].[ProductBankAccount] PBA on PBA.IndustryClassId = IC.Id
	JOIN [Common].[Bankaccount] BA on BA.Id= PBA.BankAccountId
	WHERE F.RolePlayerId = @roleplayerId
	AND BA.AccountNumber = @bankAccountNumber
END
