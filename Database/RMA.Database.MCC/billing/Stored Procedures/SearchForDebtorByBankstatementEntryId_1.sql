CREATE    PROCEDURE [billing].[SearchForDebtorByBankstatementEntryId]  
/* =============================================
Name:			[SearchForDebtorByBankstatentEntryId]
Description:	
Author:			Bongani Makelane
Create Date:	2022-10-25
Change Date:	
Culprits:		
============================================= */
@bankstatementEntryId int
AS
BEGIN
	
declare
@userReference varchar(100)=NULL,
@userReference2 varchar(100) =NULL,
@code2 varchar(100) =NULL

declare @bankstatementEntry table(userReference varchar(100),userReference2 varchar(100),code2 varchar(100))

insert into @bankstatementEntry 
select userReference,userReference2,code2 from finance.BankStatementEntry
where BankStatementEntryId = @bankstatementEntryId

select @userReference=userReference,@userReference2=userReference2,@code2 = code2 from @bankstatementEntry

declare @rolePlayerIdentificationTypeId int =0;

SELECT @rolePlayerIdentificationTypeId= R.RolePlayerIdentificationTypeId
 FROM [client].[RolePlayer] R 
		INNER JOIN [policy].[Policy] P (nolock) ON P.[PolicyOwnerId] = R.RolePlayerId 
		INNER JOIN [client].[FinPayee] F (nolock) ON F.RolePlayerId = P.[PolicyPayeeId]
		LEFT JOIN [client].[Company] c (nolock) on c.RolePlayerId = r.RolePlayerId
		where 
		lower(c.name) in ( lower(@userReference), lower(@userReference2), lower(@code2) ) 
		OR replace((Replace( REPLACE(P.PolicyNumber, ' ',''), '-','')),'/','') in( replace((Replace( REPLACE(@userReference, ' ',''), '-','')),'/',''),
		 replace((Replace( REPLACE(@userReference2, ' ',''), '-','')),'/',''), replace((Replace( REPLACE(@code2, ' ',''), '-','')),'/','')) 
		OR lower(F.FinPayeNumber) in (lower(@userReference),lower(@userReference2),lower(@code2) )
		OR lower(P.ClientReference)in ( lower(@userReference),lower(@userReference2),lower(@code2))		
		
if @rolePlayerIdentificationTypeId =1 Or  @rolePlayerIdentificationTypeId Is Null---individual
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
		INNER JOIN [policy].[Policy] P (nolock) ON P.[PolicyOwnerId] = R.RolePlayerId 
		INNER JOIN [client].[FinPayee] F (nolock) ON F.RolePlayerId = P.[PolicyOwnerId]		
		where 
		replace((Replace( REPLACE(P.PolicyNumber, ' ',''), '-','')),'/','') 
		in( replace((Replace( REPLACE(@userReference, ' ',''), '-','')),'/',''),
		replace((Replace( REPLACE(@userReference2, ' ',''), '-','')),'/',''), replace((Replace( REPLACE(@code2, ' ',''), '-','')),'/','') )
		
		OR lower(F.FinPayeNumber) in ( lower(@userReference),lower(@userReference2),lower(@code2) )
		OR lower(P.ClientReference) in ( lower(@userReference),lower(@userReference2),lower(@code2) )
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
		INNER JOIN [policy].[Policy] P (nolock) ON P.[PolicyOwnerId] = R.RolePlayerId 
		INNER JOIN [policy].[Policy] Parent (nolock) ON Parent.[PolicyId] = P.ParentPolicyId
		INNER JOIN [client].[FinPayee] F (nolock) ON F.RolePlayerId = Parent.[PolicyOwnerId]		 
		where 
		replace((Replace( REPLACE(P.PolicyNumber, ' ',''), '-','')),'/','') in(replace((Replace( REPLACE(@userReference, ' ',''), '-','')),'/',''),
		replace((Replace( REPLACE(@userReference2, ' ',''), '-','')),'/',''),
		replace((Replace( REPLACE(@code2, ' ',''), '-','')),'/','')
		)  
		OR lower(P.ClientReference)in ( lower(@userReference),lower(@userReference2),lower(@code2) )
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
		INNER JOIN [policy].[Policy] P (nolock) ON P.[PolicyPayeeId] = R.RolePlayerId 
		INNER JOIN [client].[FinPayee] F (nolock) ON F.RolePlayerId = P.[PolicyPayeeId]
		INNER JOIN	client.Company c (nolock) on c.RolePlayerId = r.RolePlayerId
		where 
		replace((Replace( REPLACE(P.PolicyNumber, ' ',''), '-','')),'/','') in ( replace((Replace( REPLACE(@userReference, ' ',''), '-','')),'/',''),
		replace((Replace( REPLACE(@userReference2, ' ',''), '-','')),'/',''),
		replace((Replace( REPLACE(@code2, ' ',''), '-','')),'/','')
		) 
		OR lower(F.FinPayeNumber) in ( lower(@userReference),lower(@userReference2),lower(@code2)  )
		OR lower(P.ClientReference) in ( lower(@userReference),lower(@userReference2),lower(@code2) )
		OR lower(c.Name) in ( lower(@userReference),lower(@userReference2),lower(@code2) )
	end

END