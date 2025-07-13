CREATE   Procedure [marketing].[GetCampaignSearchList]
(
@userId int,
@PageNumber AS INT,
@RowsOfPage AS INT,
@SortingCol AS VARCHAR(100) ='StartDateAndTime',
@SortType AS VARCHAR(100) = 'DESC',
@SearchCreatia as VARCHAR(150) = '',
@RecordCount INT = 0 OUTPUT
)
As
Begin 	
	DECLARE @SelectCount As NVARCHAR(MAX)
	
SET @SelectCount = (select 
		Count (*)
	from 
	 [marketing].[Campaign] 
		LEFT Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].Id  = [marketing].[Campaign] .Id 
		LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignId =[marketing].[Campaign].Id
		LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].Id=[marketing].[Campaign].CampaignMarketingTypeId 
		where [marketing].[Campaign].IsDeleted = 0
		and
		([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
		)
		)
		
SET @RecordCount = (select 
		Count (*)
	from 
	 [marketing].[Campaign] 
		LEFT Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].Id  = [marketing].[Campaign] .Id 
		LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignId =[marketing].[Campaign].Id
		LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].Id=[marketing].[Campaign].CampaignMarketingTypeId 
		where [marketing].[Campaign].IsDeleted = 0
		and
		([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
		)
		)

select [marketing].[Campaign].Id, 
[marketing].[Campaign].Name, 
[marketing].[Campaign].CampaignMarketingTypeId,
[marketing].[CampaignType].Name [CampaignTypeName],
 [marketing].[Campaign].CreatedDate [DateTime], 
 isnull((select stuff((select distinct ', '+  convert(varchar,[marketing].[Channel].Name)  
  From [marketing].[Channel] INNER Join [marketing].[CampaignTemplateChannels] on [marketing].[CampaignTemplateChannels].ChannelId  =[marketing].[Channel].Id  
  inner join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignTemplatesId  = [marketing].[CampaignTemplateChannels].CampaignTemplateId 
  where [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id   
  for XML PATH('')),1,1,'') ),'') ChannelName,
  isnull([marketing].[TemplatesInformation].[CampaignTemplatesId],0) [CampaignTemplateId], 
[marketing].[Campaign].IsActive, 
[marketing].[Campaign].IsDeleted , 
[marketing].[Campaign].CreatedBy , 
[marketing].[Campaign].CreatedDate , 
[marketing].[Campaign].ModifiedBy , 
[marketing].[Campaign].ModifiedDate, 
[marketing].[CampaignSchedule].StartDate ScheduledDate,
case when isnull([marketing].[CampaignSchedule].StartDate,'') ='' then '-' else 'Scheduled' End IsScheduled 
, @RecordCount 
from [marketing].[Campaign] 
left Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].Id  = [marketing].[Campaign] .Id 
LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignId =[marketing].[Campaign].Id
LEFT Join [marketing].[CampaignType] on [marketing].[CampaignType].Id=[marketing].[Campaign].CampaignMarketingTypeId 
where [marketing].[Campaign].IsDeleted = 0
and 
([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') OR [marketing].[CampaignType].Name LIKE ('%'+ @SearchCreatia +'%')
)
  order by [marketing].[Campaign].CreatedDate  desc
  	OFFSET (@PageNumber+-1)* @RowsOfPage
	ROW FETCH NEXT @RowsOfPage ROWS ONLY
END

--exec [marketing].[GetCampaignSearchList] 23,1,10,'','',''   -- (Search for Campaign Name, CampaignTypeName, Approval Status)