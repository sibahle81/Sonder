CREATE   Procedure [marketing].[GetCampaignList]
(
@userId int,
@PageNumber AS INT,
@RowsOfPage AS INT,
@SortingCol AS VARCHAR(100) ='StartDateAndTime',
@SortType AS VARCHAR(100) = 'DESC',
@SearchCreatia as VARCHAR(150) = '',
@Status as varchar(20),
@RecordCount INT = 0 OUTPUT
)
As
Begin 	
	DECLARE @SelectCount As NVARCHAR(MAX)
	Declare @UserRoleName varchar(50)
	Declare @UserRoleId int
	Declare @UserPermissionName varchar(50)
	Declare @StatusCountS int =0 
	
SET @UserRoleName= (select [security].[Role].Name from [security].[User] inner join [security].[Role] on  [security].[Role].Id = [security].[User].RoleId where [security].[User].Id = @userId)
SET @UserRoleId= (select [security].[User].RoleId from [security].[User] where [security].[User].Id = @userId)
SET @UserPermissionName= (select top(1) [security].[Permission].Name from [security].Permission inner join [security].[RolePermission] on [security].[RolePermission].PermissionId =[security].Permission.Id 
							where [security].[RolePermission].RoleId = @UserRoleId and [security].[Permission].Name in ('Approve Campaign'))
 
If @UserPermissionName = 'Approve Campaign' 
	Begin
	   SET @SelectCount = (select 
				Count (*)
			from [marketing].[Campaign] 
		LEFT Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].CampaignId  = [marketing].[Campaign].Id  and [marketing].[CampaignSchedule].IsDeleted =0 
		LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id
		LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].Id=[marketing].[Campaign].CampaignMarketingTypeId  and [marketing].[CampaignType].IsDeleted = 0 
		Left Join [marketing].[CampaignApprovals] on [marketing].[CampaignApprovals].CampaignId = [marketing].[Campaign].Id 
		where [marketing].[Campaign].IsDeleted = 0
			  and [marketing].[CampaignApprovals].ApproverUserId in (@userId) and [marketing].[CampaignApprovals].IsDeleted = 0
		  	and ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
				  )
		  	and (
				(@status='ongoing' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) = convert(varchar,getdate(),112))
				OR 
				(@status='upcoming' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) > convert(varchar,getdate(),112))
				OR
				(@status='all' AND 1=1)
					))
		SET @RecordCount = (select count(*) from (select distinct [marketing].[Campaign].Id, 
		[marketing].[Campaign].Name, 
		[marketing].[Campaign].CampaignMarketingTypeId,
		[marketing].[CampaignType].Name [CampaignTypeName],
		[marketing].[Campaign].CreatedDate [DateTime], 
		isnull( (select top(1) stuff((select distinct ', '+  convert(varchar,[marketing].[Channel].Name)  
		  From [marketing].[Channel] inner join [marketing].[CampaignTemplateChannels] on [marketing].[CampaignTemplateChannels].ChannelId  =[marketing].[Channel].Id  
		  LEFT Join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =  [marketing].[CampaignTemplateChannels].CampaignTemplateId 
		  LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignTemplatesId  =  [marketing].[CampaignTemplates].Id 
		  where [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id   
		  for XML PATH('')),1,1,'') ),'') ChannelName,
		--isnull([marketing].[TemplatesInformation].[CampaignTemplatesId],0) [CampaignTemplateId],	 	
		--(select top(1) stuff((select distinct ', '+ convert(varchar,[marketing].[CampaignTemplates].Id) 
	--	  From [marketing].[TemplatesInformation]
	--	  left join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =[marketing].[TemplatesInformation].CampaignTemplatesId 
	--	  where [marketing].[TemplatesInformation].CampaignId= [marketing].[Campaign].Id
	--	  for XML PATH('')),1,1,'') ) CampaignTemplateId,
		  (select top(1) [marketing].[CampaignTemplates].Id
		  From [marketing].[TemplatesInformation]
		  left join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =[marketing].[TemplatesInformation].CampaignTemplatesId 
		  where [marketing].[TemplatesInformation].CampaignId= [marketing].[Campaign].Id) CampaignTemplateId,
		case when (select count(*) from marketing.CampaignApprovals 
			inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
					where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0) = 
					(select  count(*) from marketing.CampaignApprovals 
			inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
					where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=1) then 'Pending'
		when (select count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
					where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0) = 
					(select  count(*) from marketing.CampaignApprovals 
			inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
					where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=4) then 'Approved'
		when 0 <> (select  count(*) from marketing.CampaignApprovals 
			inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
					where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=3) then 'Rejected'
		when 0 <> (select  count(*) from marketing.CampaignApprovals 
			inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
					where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=2) then 'Onhold'
		ELSE 'Pending' End Status, 				
		[marketing].[Campaign].IsDeleted , 
		[marketing].[Campaign].CreatedBy , 
		[marketing].[Campaign].CreatedDate , 
		[marketing].[Campaign].ModifiedBy , 
		[marketing].[Campaign].ModifiedDate, 
		--[marketing].[CampaignSchedule].StartDate ScheduledDate,
		NULL ScheduledDate,
		case when isnull([marketing].[CampaignSchedule].StartDate,'') ='' then '-' else 'Scheduled' End IsSchedule--IsScheduled 
		,[marketing].[Campaign].IsActive 
			from [marketing].[Campaign] 
		LEFT Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].CampaignId  = [marketing].[Campaign].Id  and [marketing].[CampaignSchedule].IsDeleted =0 
		LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id
		LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].Id=[marketing].[Campaign].CampaignMarketingTypeId  and [marketing].[CampaignType].IsDeleted = 0 
		Left Join [marketing].[CampaignApprovals] on [marketing].[CampaignApprovals].CampaignId = [marketing].[Campaign].Id 
		where [marketing].[Campaign].IsDeleted = 0
			  and [marketing].[CampaignApprovals].ApproverUserId in (@userId) and [marketing].[CampaignApprovals].IsDeleted = 0
			  and ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
				  )
			  and (
				(@status='ongoing' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) = convert(varchar,getdate(),112))
				OR 
				(@status='upcoming' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) > convert(varchar,getdate(),112))
				OR
				(@status='all' AND 1=1)
					)) as tblTmp) 
				
				
	select distinct [marketing].[Campaign].Id, 
	[marketing].[Campaign].Name ,  
	[marketing].[Campaign].CampaignMarketingTypeId,
	[marketing].[CampaignType].Name [CampaignTypeName],
	[marketing].[Campaign].CreatedDate [DateTime], 
	isnull( (select top(1) stuff((select distinct ', '+  convert(varchar,[marketing].[Channel].Name)  
	  From [marketing].[Channel] inner join [marketing].[CampaignTemplateChannels] on [marketing].[CampaignTemplateChannels].ChannelId  =[marketing].[Channel].Id  
	  LEFT Join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =  [marketing].[CampaignTemplateChannels].CampaignTemplateId 
	  LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignTemplatesId  =  [marketing].[CampaignTemplates].Id 
	  where [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id   
	  for XML PATH('')),1,1,'') ),'') ChannelName,
--	isnull([marketing].[TemplatesInformation].[CampaignTemplatesId],0) [CampaignTemplateId],	 
--	(select top(1) stuff((select distinct ', '+ convert(varchar,[marketing].[CampaignTemplates].Id) 
--	  From [marketing].[TemplatesInformation]
--	  left join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =[marketing].[TemplatesInformation].CampaignTemplatesId 
--	  where [marketing].[TemplatesInformation].CampaignId= [marketing].[Campaign].Id
	  --for XML PATH('')),1,1,'') ) CampaignTemplateId,
	  (select top(1) [marketing].[CampaignTemplates].Id
	  From [marketing].[TemplatesInformation]
	  left join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =[marketing].[TemplatesInformation].CampaignTemplatesId 
	  where [marketing].[TemplatesInformation].CampaignId= [marketing].[Campaign].Id) CampaignTemplateId,
	case when (select count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0) = 
				(select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=1) then 'Pending'
	when (select count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0) = 
				(select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=4) then 'Approved'
	when 0 <> (select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=3) then 'Rejected'
	when 0 <> (select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=2) then 'Onhold'
	ELSE 'Pending' End Status, 				
	[marketing].[Campaign].IsDeleted , 
	[marketing].[Campaign].CreatedBy , 
	[marketing].[Campaign].CreatedDate , 
	[marketing].[Campaign].ModifiedBy , 
	[marketing].[Campaign].ModifiedDate, 
	--[marketing].[CampaignSchedule].StartDate ScheduledDate,
	NULL ScheduledDate,
	case when isnull([marketing].[CampaignSchedule].StartDate,'') ='' then '-' else 'Scheduled' End IsSchedule--IsScheduled 
	,[marketing].[Campaign].IsActive 
	, @RecordCount 
	from [marketing].[Campaign] 
	LEFT Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].CampaignId  = [marketing].[Campaign].Id  and [marketing].[CampaignSchedule].IsDeleted =0 
	LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id
	LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].Id=[marketing].[Campaign].CampaignMarketingTypeId  and [marketing].[CampaignType].IsDeleted = 0 
	Left Join [marketing].[CampaignApprovals] on [marketing].[CampaignApprovals].CampaignId = [marketing].[Campaign].Id --and [marketing].[CampaignApprovals].IsDeleted = 0 
	where [marketing].[Campaign].IsDeleted = 0
		  and [marketing].[CampaignApprovals].ApproverUserId in (@userId) and [marketing].[CampaignApprovals].IsDeleted = 0
		  and ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
			  )
		  and (
			(@status='ongoing' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) = convert(varchar,getdate(),112))
			OR 
			(@status='upcoming' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) > convert(varchar,getdate(),112))
			OR
			(@status='all' AND 1=1)
			)
  	order by [marketing].[Campaign].CreatedDate  desc
	OFFSET (@PageNumber+-1)* @RowsOfPage
	ROW FETCH NEXT @RowsOfPage ROWS ONLY
	
	END
	
Else 
  BEGIN
	SET @SelectCount = (select 
			Count (*)
		from [marketing].[Campaign] 
	LEFT Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].CampaignId = [marketing].[Campaign] .Id and [marketing].[CampaignSchedule].IsDeleted =0  
	LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].Id=[marketing].[Campaign].CampaignMarketingTypeId and [marketing].[CampaignType].IsDeleted = 0  
	where [marketing].[Campaign].IsDeleted = 0
	and  ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
		  )
	and (
	(@status='ongoing' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) = convert(varchar,getdate(),112))
	OR 
	(@status='upcoming' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) > convert(varchar,getdate(),112))
	OR
	(@status='all' AND 1=1)
				))
	SET @RecordCount = ( select count(*) from (
	select distinct [marketing].[Campaign].Id, 
	[marketing].[Campaign].Name, 
	[marketing].[Campaign].CampaignMarketingTypeId,
	[marketing].[CampaignType].Name [CampaignTypeName],
	[marketing].[Campaign].CreatedDate [DateTime], 
	isnull( (select  top(1) stuff((select distinct ', '+  convert(varchar,[marketing].[Channel].Name)  
	  From [marketing].[Channel] inner join [marketing].[CampaignTemplateChannels] on [marketing].[CampaignTemplateChannels].ChannelId  =[marketing].[Channel].Id  
	  LEFT Join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =  [marketing].[CampaignTemplateChannels].CampaignTemplateId 
	  LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignTemplatesId  =  [marketing].[CampaignTemplates].Id 
	  where [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id   
	  for XML PATH('')),1,1,'') ),'') ChannelName,		  
     (select top(1) stuff((select distinct ', '+ convert(varchar,[marketing].[CampaignTemplates].Name) 
	  From [marketing].[TemplatesInformation]
	  left join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =[marketing].[TemplatesInformation].CampaignTemplatesId 
	  where [marketing].[TemplatesInformation].CampaignId= [marketing].[Campaign].Id
	  for XML PATH('')),1,1,'') ) CampTempName,
	 case when (select count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0) = 
				(select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=1) then 'Pending'
	when (select count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0) = 
				(select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=4) then 'Approved'
	when 0 <> (select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=3) then 'Rejected'
	when 0 <> (select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=2) then 'Onhold'
	ELSE 'Pending' End Status, 
	[marketing].[Campaign].IsDeleted , 
	[marketing].[Campaign].CreatedBy , 
	[marketing].[Campaign].CreatedDate , 
	[marketing].[Campaign].ModifiedBy , 
	[marketing].[Campaign].ModifiedDate,	
	case when isnull([marketing].[CampaignSchedule].StartDate,'') ='' then '-' else 'Scheduled' End IsSchedule--IsScheduled 
 	,[marketing].[Campaign].IsActive 	
		from [marketing].[Campaign] 
	LEFT Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].CampaignId = [marketing].[Campaign] .Id and [marketing].[CampaignSchedule].IsDeleted =0  
	LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].Id=[marketing].[Campaign].CampaignMarketingTypeId and [marketing].[CampaignType].IsDeleted = 0  
	where [marketing].[Campaign].IsDeleted = 0
	and  ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
		  )
	and (
	(@status='ongoing' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) = convert(varchar,getdate(),112))
	OR 
	(@status='upcoming' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) > convert(varchar,getdate(),112))
	OR
	(@status='all' AND 1=1)
				)	) as tbltmp)
		
	select distinct [marketing].[Campaign].Id, 
	[marketing].[Campaign].Name, 
	[marketing].[Campaign].CampaignMarketingTypeId,
	[marketing].[CampaignType].Name [CampaignTypeName],
	[marketing].[Campaign].CreatedDate [DateTime], 
	isnull( (select  top(1) stuff((select distinct ', '+  convert(varchar,[marketing].[Channel].Name)  
	  From [marketing].[Channel] inner join [marketing].[CampaignTemplateChannels] on [marketing].[CampaignTemplateChannels].ChannelId  =[marketing].[Channel].Id  
	  LEFT Join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =  [marketing].[CampaignTemplateChannels].CampaignTemplateId 
	  LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignTemplatesId  =  [marketing].[CampaignTemplates].Id 
	  where [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id   
	  for XML PATH('')),1,1,'') ),'') ChannelName,		  
     (select top(1) stuff((select distinct ', '+ convert(varchar,[marketing].[CampaignTemplates].Name) 
	  From [marketing].[TemplatesInformation]
	  left join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =[marketing].[TemplatesInformation].CampaignTemplatesId 
	  where [marketing].[TemplatesInformation].CampaignId= [marketing].[Campaign].Id
	  for XML PATH('')),1,1,'') ) CampTempName,
	 case when (select count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0) = 
				(select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=1) then 'Pending'
	when (select count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0) = 
				(select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=4) then 'Approved'
	when 0 <> (select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=3) then 'Rejected'
	when 0 <> (select  count(*) from marketing.CampaignApprovals 
		inner join [common].MarketingApprovalStatus on [common].MarketingApprovalStatus.Id =marketing.CampaignApprovals.MarketingApprovalStatusId 
				where marketing.CampaignApprovals.CampaignId = [marketing].[Campaign].Id and marketing.CampaignApprovals.IsDeleted =0 and marketing.CampaignApprovals.MarketingApprovalStatusId=2) then 'Onhold'
	ELSE 'Pending' End Status, 
	[marketing].[Campaign].IsDeleted , 
	[marketing].[Campaign].CreatedBy , 
	[marketing].[Campaign].CreatedDate , 
	[marketing].[Campaign].ModifiedBy , 
	[marketing].[Campaign].ModifiedDate, 
	--[marketing].[CampaignSchedule].StartDate ScheduledDate,
	NULL ScheduledDate,
	case when isnull([marketing].[CampaignSchedule].StartDate,'') ='' then '-' else 'Scheduled' End IsSchedule--IsScheduled 
 	,[marketing].[Campaign].IsActive 
	, @RecordCount 
	from [marketing].[Campaign] 
	LEFT Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].CampaignId = [marketing].[Campaign] .Id and [marketing].[CampaignSchedule].IsDeleted =0  
	LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].Id=[marketing].[Campaign].CampaignMarketingTypeId and [marketing].[CampaignType].IsDeleted = 0  
	where [marketing].[Campaign].IsDeleted = 0
	and  ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
		  )
	and (
	(@status='ongoing' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) = convert(varchar,getdate(),112))
	OR 
	(@status='upcoming' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) > convert(varchar,getdate(),112))
	OR
	(@status='all' AND 1=1)
	)
  	order by [marketing].[Campaign].CreatedDate  desc
	OFFSET (@PageNumber+-1)* @RowsOfPage
	ROW FETCH NEXT @RowsOfPage ROWS ONLY
  END
END

--exec [marketing].[GetCampaignList] 1624,1,100,'','','', 'all'   -- (1st parameter a =   Searching pramns , 2 parameter is  ongoing, upcoming, all  - ongoing is current schedule date and current date, upcoming is next scheduled date, all means all)1
-- Condition Review 30102023
-- condition reloacated with discuss MM 22-11-2023