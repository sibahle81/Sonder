CREATE   PROCEDURE [billing].[SearchForDebtorBankStatementReference]
/* =============================================
Name:			SearchForDebtorBankStatementReference
Description:	
Author:			Sibahle Senda
Create Date:	2020-05-05
Change Date:	2024-11-29
Culprits:	Sibahle Senda	
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
		FROM [client].[RolePlayer] R 
		INNER JOIN [policy].[Policy] P ON P.[PolicyOwnerId] = R.RolePlayerId 
		INNER JOIN [client].[FinPayee] F ON F.RolePlayerId = P.[PolicyOwnerId]
		AND (LOWER(LTRIM(RTRIM(P.PolicyNumber))) LIKE '%' + LOWER(LTRIM(RTRIM(@statementReference))) + '%'
		OR LOWER(LTRIM(RTRIM(F.FinPayeNumber))) LIKE '%' + LOWER(LTRIM(RTRIM(@statementReference))) + '%'
		OR LOWER(LTRIM(RTRIM(P.ClientReference))) LIKE '%' + LOWER(LTRIM(RTRIM(@statementReference))) + '%')
	UNION
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
		FROM [client].[RolePlayer] R 
		INNER JOIN [policy].[Policy] P ON P.[PolicyOwnerId] = R.RolePlayerId 
		INNER JOIN [policy].[Policy] Parent ON Parent.[PolicyId] = P.ParentPolicyId
		INNER JOIN [client].[FinPayee] F ON F.RolePlayerId = Parent.[PolicyOwnerId]
        AND (LOWER(LTRIM(RTRIM(P.PolicyNumber))) LIKE '%' + LOWER(LTRIM(RTRIM(@statementReference))) + '%'
		OR LOWER(LTRIM(RTRIM(P.ClientReference))) LIKE '%' + LOWER(LTRIM(RTRIM(@statementReference))) + '%')
END