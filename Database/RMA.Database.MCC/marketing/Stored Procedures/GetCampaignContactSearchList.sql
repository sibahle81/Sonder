CREATE   Procedure [marketing].[GetCampaignContactSearchList]
(
 @ContactName as varchar(200), 
 @PageNumber AS INT,
 @RowsOfPage AS INT,
 @RecordCount INT = 0 OUTPUT
)
AS 
BEGIN
	BEGIN
	SET @RecordCount = (select count(*) From ( SELECT 
 				distinct [client].[Roleplayer].RolePlayerId, 
 				[Client].[FinPayee].FinPayeNumber [MemberNumber],
 				[client].[Roleplayer].DisplayName [ContactName], 
 				isnull([client].[RolePlayerContact].ContactNumber,'') ContactNumber, 
 				[client].[RolePlayerContact].ContactDesignationTypeId, 
 				[common].[ContactDesignationType].Name [Designation], 
				[client].[Roleplayer].EmailAddress , 
 				[Company].Name [CompanyName] ,
 				'' [CompanyNo],
 				[common].[IndustryClass].Name [Category], 
 				CASE WHEN [Roleplayer].RolePlayerIdentificationTypeId = 2 THEN 'Company'
				ELSE 'Individual' END AS [Type]				
				From [client].[Roleplayer] 
				inner join [client].[RolePlayerContact] on [client].[RolePlayerContact].RolePlayerId = [client].[Roleplayer].RolePlayerId
				Inner Join [Client].[FinPayee] on [Client].[FinPayee].RolePlayerId = [client].[Roleplayer].RolePlayerId
				LEFT  join [common].[ContactDesignationType] on [common].[ContactDesignationType].Id = [client].[RolePlayerContact].ContactDesignationTypeId 
				LEFT JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [client].[Roleplayer].RolePlayerId
				left join [common].[IndustryClass] on [common].[IndustryClass].Id  =  [Company].IndustryClassId 
				where [client].[Roleplayer].DisplayName like '%'+ @ContactName +'%'
				and [client].[Roleplayer].IsDeleted =0 ) as t 	
		)
	END

	SELECT 
 	distinct [client].[Roleplayer].RolePlayerId, 
 	[Client].[FinPayee].FinPayeNumber [MemberNumber],
 	[client].[Roleplayer].DisplayName [ContactName], 
 	isnull([client].[RolePlayerContact].ContactNumber,'') ContactNumber, 
 	[client].[RolePlayerContact].ContactDesignationTypeId, 
 	[common].[ContactDesignationType].Name [Designation], 
 	[client].[Roleplayer].EmailAddress , 
 	[Company].Name [CompanyName] ,
 	'' [CompanyNo],
 	[common].[IndustryClass].Name [Category], 
 	CASE WHEN [Roleplayer].RolePlayerIdentificationTypeId = 2 THEN 'Company'
				ELSE 'Individual' END AS [Type],
	@RecordCount  
	From [client].[Roleplayer] 
	inner join [client].[RolePlayerContact] on [client].[RolePlayerContact].RolePlayerId = [client].[Roleplayer].RolePlayerId
	Inner Join [Client].[FinPayee] on [Client].[FinPayee].RolePlayerId = [client].[Roleplayer].RolePlayerId
	LEFT  join [common].[ContactDesignationType] on [common].[ContactDesignationType].Id = [client].[RolePlayerContact].ContactDesignationTypeId 
	LEFT JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [client].[Roleplayer].RolePlayerId
	left join [common].[IndustryClass] on [common].[IndustryClass].Id  =  [Company].IndustryClassId 
	where [client].[Roleplayer].DisplayName like '%'+ @ContactName +'%'
	and [client].[Roleplayer].IsDeleted =0 
	order by [client].[Roleplayer].DisplayName  
OFFSET (@PageNumber+-1)* @RowsOfPage
	ROW FETCH NEXT @RowsOfPage ROWS ONLY
END 

--exec [marketing].[GetCampaignContactSearchList] 'a',1,10  -- Parameter @ContactName = a