
-- =============================================
-- Author:		Gram Letoaba
-- Create date: 04/03/2020
-- Modified date: 23/04/2020
-- Culprits: Sibahle Senda

-- EXEC [billing].[SearchAccounts] NULL, '21011866',0
-- =============================================
CREATE       PROCEDURE [billing].[SearchAccounts]
	@FilterType INT = NULL,
	@Filter VARCHAR(50),
	@ShowActive bit = 1
AS
BEGIN
	SELECT F.RolePlayerId,
			R.DisplayName,
			R.EmailAddress,
			F.FinPayeNumber,
			[Policy].PolicyId,
			[Policy].PolicyNumber,
			ISNULL([Policy].ClientReference,'') ClientReference,
			ISNULL(PS.IdNumber,'') AS IdNumber,
			ISNULL(C.ReferenceNumber,'') CompanyRegistration,
			ISNULL(InvoiceNumber,'') InvoiceNumber,
			ic.Name IndustryClass	
	FROM	 client.FinPayee F 
	INNER JOIN client.RolePlayer R ON F.RolePlayerId = R.RolePlayerId
    LEFT JOIN     client.Company C ON F.RolePlayerId = C.RolePlayerId 
    LEFT JOIN      client.Person PS ON F.RolePlayerId = PS.RolePlayerId
	LEFT JOIN policy.Policy [Policy] ON F.RolePlayerId = Policy.PolicyPayeeId
	LEFT JOIN  billing.Invoice I ON I.PolicyId = Policy.PolicyId
	LEFT JOIN [common].[Industry]	IND ON IND.id = f.IndustryId
	LEFT JOIN common.industryclass		IC ON IC.Id = IND.IndustryClassId
	WHERE R.DisplayName like '%' + @Filter+ '%' 
	OR PS.IdNumber LIKE '%' + @Filter+ '%'  
	OR C.ReferenceNumber LIKE '%' + @Filter+ '%'
	OR F.FinPayeNumber LIKE '%' + @Filter+ '%'
	OR [Policy].PolicyNumber LIKE '%' + @Filter+ '%'
	OR I.InvoiceNumber LIKE '%' + @Filter+ '%'  
	
	END
