CREATE   PROCEDURE [billing].[SearchMultipleDebtorsByBankStatementReference] --'CJP two Holdings'  
/* =============================================
Name:			[SearchMultipleDebtorsByBankStatementReference]
Description:	
Author:			Bongani Makelane
Create Date:	2020-05-05
Change Date:	
Culprits:		
============================================= */
@userReference varchar(100)=NULL,
@userReference2 varchar(100) =NULL
AS
BEGIN
	declare @rolePlayerIdentificationTypeId int =0;

SELECT @rolePlayerIdentificationTypeId= R.RolePlayerIdentificationTypeId
 FROM [client].[RolePlayer] R 
		INNER JOIN [policy].[Policy] P ON P.[PolicyOwnerId] = R.RolePlayerId 
		INNER JOIN [client].[FinPayee] F ON F.RolePlayerId = P.[PolicyPayeeId]
		LEFT JOIN [client].[Company] c on c.RolePlayerId = r.RolePlayerId
		where 
		lower(c.name) in ( lower(@userReference), lower(@userReference2) ) 
		OR replace((Replace( REPLACE(P.PolicyNumber, ' ',''), '-','')),'/','') in( replace((Replace( REPLACE(@userReference, ' ',''), '-','')),'/',''),
		 replace((Replace( REPLACE(@userReference2, ' ',''), '-','')),'/','')) 
		OR lower(F.FinPayeNumber) in (lower(@userReference),lower(@userReference2))
		OR lower(P.ClientReference)in ( lower(@userReference),lower(@userReference2))		
		
if @rolePlayerIdentificationTypeId =1 ---individual
	begin
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
		FROM [client].[RolePlayer] R 
		INNER JOIN [policy].[Policy] P ON P.[PolicyOwnerId] = R.RolePlayerId 
		INNER JOIN [client].[FinPayee] F ON F.RolePlayerId = P.[PolicyOwnerId]		
		where 
		replace((Replace( REPLACE(P.PolicyNumber, ' ',''), '-','')),'/','') 
		in( replace((Replace( REPLACE(@userReference, ' ',''), '-','')),'/',''),
		replace((Replace( REPLACE(@userReference2, ' ',''), '-','')),'/','') )
		
		OR lower(F.FinPayeNumber) in ( lower(@userReference),lower(@userReference2) )
		OR lower(P.ClientReference) in ( lower(@userReference),lower(@userReference2) )
	UNION
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
		FROM [client].[RolePlayer] R 
		INNER JOIN [policy].[Policy] P ON P.[PolicyOwnerId] = R.RolePlayerId 
		INNER JOIN [policy].[Policy] Parent ON Parent.[PolicyId] = P.ParentPolicyId
		INNER JOIN [client].[FinPayee] F ON F.RolePlayerId = Parent.[PolicyOwnerId]		 
		where 
		replace((Replace( REPLACE(P.PolicyNumber, ' ',''), '-','')),'/','') in(replace((Replace( REPLACE(@userReference, ' ',''), '-','')),'/',''),
		replace((Replace( REPLACE(@userReference2, ' ',''), '-','')),'/',''))  
		OR lower(P.ClientReference)in ( lower(@userReference),lower(@userReference2) )
	end

if @rolePlayerIdentificationTypeId =2 ---company
	begin
	SELECT distinct F.[RolePlayerId]
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
		INNER JOIN	client.Company c on c.RolePlayerId = r.RolePlayerId
		where 
		replace((Replace( REPLACE(P.PolicyNumber, ' ',''), '-','')),'/','') in ( replace((Replace( REPLACE(@userReference, ' ',''), '-','')),'/',''),
		replace((Replace( REPLACE(@userReference2, ' ',''), '-','')),'/','')) 
		OR lower(F.FinPayeNumber) in ( lower(@userReference),lower(@userReference2) )
		OR lower(P.ClientReference) in ( lower(@userReference),lower(@userReference2) )
		OR lower(c.Name) in ( lower(@userReference),lower(@userReference2) )
	end
END