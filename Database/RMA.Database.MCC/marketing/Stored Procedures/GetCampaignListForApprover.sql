CREATE   Procedure [marketing].[GetCampaignListForApprover]
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
	
SET @SelectCount = (select 
		Count (*)
	from 
	 [marketing].[Campaign]	 
			LEFT Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].[Id]  = [marketing].[Campaign].[Id] 
			LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].[CampaignId] = [marketing].[Campaign].[Id]
			LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].[Id] = [marketing].[Campaign].[CampaignMarketingTypeId] 
			where [marketing].[Campaign].IsDeleted = 0
			and 
			 ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
			)
			and (
			 (@status='ongoing' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) = convert(varchar,getdate(),112))
			OR 
			 (@status='upcoming' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) > convert(varchar,getdate(),112))
			OR
			(@status='all' AND 1=1)
			))

SET @RecordCount = (select 
		Count (*)
	from 
		[marketing].[Campaign] 
			LEFT Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].Id  = [marketing].[Campaign] .Id 
			LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id
			LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].Id = [marketing].[Campaign].CampaignMarketingTypeId 
			where [marketing].[Campaign].IsDeleted = 0
			and 
			 ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
			)
			and (
			 (@status='ongoing' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) = convert(varchar,getdate(),112))
			OR 
			 (@status='upcoming' AND convert(varchar,[marketing].[CampaignSchedule].StartDate,112) > convert(varchar,getdate(),112))
			OR
			(@status='all' AND 1=1)
			))

select [marketing].[Campaign].Id, 
[marketing].[Campaign].Name, 
[marketing].[Campaign].CampaignMarketingTypeId,
[marketing].[CampaignType].Name [CampaignTypeName],
 [marketing].[Campaign].CreatedDate [DateTime], 
 (select stuff((select distinct ', '+  convert(varchar,[marketing].[Channel].Name)  
  From [marketing].[Channel] INNER Join [marketing].[CampaignTemplateChannels] on [marketing].[CampaignTemplateChannels].ChannelId  =[marketing].[Channel].Id  
  LEFT Join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =  [marketing].[CampaignTemplateChannels].CampaignTemplateId 
  LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignTemplatesId  =  [marketing].[CampaignTemplates].Id 
  where [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id 
  for XML PATH('')),1,1,'') ) ChannelName,
[marketing].[TemplatesInformation].[CampaignTemplatesId] [CampaignTemplateId], 
[marketing].[Campaign].IsDeleted , 
[marketing].[Campaign].IsActive  ,
[marketing].[Campaign].CreatedBy , 
[marketing].[Campaign].CreatedDate , 
[marketing].[Campaign].ModifiedBy , 
[marketing].[Campaign].ModifiedDate, 
[marketing].[CampaignSchedule].StartDate ScheduledDate, 
case when isnull([marketing].[CampaignSchedule].StartDate,'') ='' then '-' else 'Scheduled' End IsScheduled 
,@RecordCount  
from [marketing].[Campaign] 
LEFT Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].Id  = [marketing].[Campaign] .Id 
LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignId =[marketing].[Campaign].Id
LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].Id=[marketing].[Campaign].CampaignMarketingTypeId 
where [marketing].[Campaign].IsDeleted = 0
and 
 ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
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

--exec [marketing].[GetCampaignListForApprover] 23,1,10,'','','a', 'all'   -- (1st parameter a =   Searching pramns , 2 parameter is  ongoing, upcoming, all  - ongoing is current schedule date and current date, upcoming is next scheduled date, all means all)