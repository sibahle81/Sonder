-- =============================================
-- Author:		bongani makelane
-- Create date: 06/05/2020
-- =============================================
CREATE   PROCEDURE [billing].[SearchDebtors] -- 'AU003220'
	@searchText  NVARCHAR(MAX)
AS
BEGIN
SELECT DISTINCT F.FinPayeNumber as FinPayeNumber, R.DisplayName, R.EmailAddress, R.RolePlayerId,
CASE WHEN R.RolePlayerIdentificationTypeId = 1 THEN P.IdNumber WHEN R.RolePlayerIdentificationTypeId = 2 THEN C.ReferenceNumber  END as 'Idnumber'
,Policy.PolicyNumber, ISNULL(IC.name,'') IndustryClass, ISNULL(IC.Id,0) IndustryClassId
FROM  client.FinPayee F 
	INNER JOIN client.RolePlayer R ON F.RolePlayerId = R.RolePlayerId
    LEFT JOIN     client.Company C ON F.RolePlayerId = C.RolePlayerId 
    LEFT JOIN      client.Person P ON F.RolePlayerId = P.RolePlayerId
	LEFT JOIN policy.Policy [Policy] ON F.RolePlayerId = Policy.PolicyPayeeId
	LEFT JOIN  billing.Invoice I ON I.PolicyId = Policy.PolicyId
	LEFT JOIN [common].[Industry]	IND ON IND.id = f.IndustryId
	LEFT JOIN common.industryclass		IC ON IC.Id = IND.IndustryClassId
where R.DisplayName like '%' + @searchText+ '%' 
	OR P.IdNumber LIKE '%' + @searchText+ '%'  
	OR C.ReferenceNumber LIKE '%' + @searchText+ '%'
	OR F.FinPayeNumber LIKE '%' + @searchText+ '%'
	OR [Policy].PolicyNumber LIKE '%' + @searchText+ '%'
	OR I.InvoiceNumber LIKE '%' + @searchText+ '%'  	
END
