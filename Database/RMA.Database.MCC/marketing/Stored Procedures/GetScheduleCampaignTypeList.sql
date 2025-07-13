CREATE   Procedure [marketing].[GetScheduleCampaignTypeList]
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
	from [marketing].[CampaignSchedule]
			inner join [marketing].[Campaign] on [marketing].[Campaign].id=[marketing].[CampaignSchedule].CampaignId 
			Left join [marketing].[CampaignApprovals] on [marketing].[CampaignApprovals].CampaignId =[marketing].[CampaignSchedule].CampaignId  and [marketing].[CampaignApprovals].IsDeleted =0 
			where [marketing].[CampaignSchedule].IsDeleted  = 0 
			and ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%')
			))

SET @RecordCount = (select 
		Count (*)	from ( select distinct 
[marketing].[CampaignSchedule].Id ,
[marketing].[CampaignSchedule].CampaignId, 
[marketing].[Campaign].Name [CampaignName], 
case when [marketing].[CampaignSchedule].MarketingAudienceTypeId =1 THEN 
(select stuff((select ', '+  convert(varchar,[marketing].[CampaignGroups].GroupName)  
From [marketing].[CampaignGroups]
inner join [marketing].[CampaignScheduleGroup] on [marketing].[CampaignScheduleGroup].GroupId = [marketing].[CampaignGroups].id 
and [marketing].[CampaignScheduleGroup].CampaignScheduleId  = [marketing].[CampaignSchedule].Id 
for XML PATH('')),1,1,'') ) else '-' END Groups,

isnull( case when [marketing].[CampaignSchedule].MarketingAudienceTypeId = 1 THEN  
 (select stuff((select ', '+  convert(varchar,[marketing].[CampaignGroups].Id)  
From [marketing].[CampaignGroups]
inner join [marketing].[CampaignScheduleGroup] on [marketing].[CampaignScheduleGroup].GroupId = [marketing].[CampaignGroups].id 
and [marketing].[CampaignScheduleGroup].CampaignScheduleId  = [marketing].[CampaignSchedule].Id  
for XML PATH('')),1,1,'') ) else '0,' END,'0,') CampaignGroupIds,
0 CampaignContactIds,  
[marketing].[CampaignSchedule].MarketingAudienceTypeId ,
[marketing].[CampaignSchedule].StartDate,
isnull([marketing].[CampaignApprovals].MarketingApprovalStatusId,0) MarketingApprovalStatusId,
 
(select stuff((select distinct ', '+  convert(varchar,[marketing].[Channel].Name)  
  From [marketing].[Channel] inner join [marketing].[CampaignTemplateChannels] on [marketing].[CampaignTemplateChannels].ChannelId  =[marketing].[Channel].Id  
  inner join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignTemplatesId = [marketing].[CampaignTemplateChannels].CampaignTemplateId 
  where [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id   
  for XML PATH('')),1,1,'') ) ChannelName,
  [marketing].[CampaignSchedule].MarketingCampaignScheduleStatusId MarketingCampaignScheduleStatus, 
  [marketing].[CampaignSchedule].IsActive ,  
  [marketing].[CampaignSchedule].IsDeleted ,  
  [marketing].[CampaignSchedule].CreatedBy , 
  [marketing].[CampaignSchedule].CreatedDate , 
  [marketing].[CampaignSchedule].ModifiedBy ,
  [marketing].[CampaignSchedule].ModifiedDate 
		from [marketing].[CampaignSchedule]
			inner join [marketing].[Campaign] on [marketing].[Campaign].id=[marketing].[CampaignSchedule].CampaignId 
			Left join [marketing].[CampaignApprovals] on [marketing].[CampaignApprovals].CampaignId =[marketing].[CampaignSchedule].CampaignId  and [marketing].[CampaignApprovals].IsDeleted =0 
			where [marketing].[CampaignSchedule].IsDeleted  = 0 
			and ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%')
			)) as tblTmp)

select distinct 
[marketing].[CampaignSchedule].Id ,
[marketing].[CampaignSchedule].CampaignId, 
[marketing].[Campaign].Name [CampaignName], 
case when [marketing].[CampaignSchedule].MarketingAudienceTypeId =1 THEN 
(select stuff((select ', '+  convert(varchar,[marketing].[CampaignGroups].GroupName)  
From [marketing].[CampaignGroups]
inner join [marketing].[CampaignScheduleGroup] on [marketing].[CampaignScheduleGroup].GroupId = [marketing].[CampaignGroups].id 
and [marketing].[CampaignScheduleGroup].CampaignScheduleId  = [marketing].[CampaignSchedule].Id 
for XML PATH('')),1,1,'') ) else '-' END Groups,

isnull( case when [marketing].[CampaignSchedule].MarketingAudienceTypeId = 1 THEN  
 (select stuff((select ', '+  convert(varchar,[marketing].[CampaignGroups].Id)  
From [marketing].[CampaignGroups]
inner join [marketing].[CampaignScheduleGroup] on [marketing].[CampaignScheduleGroup].GroupId = [marketing].[CampaignGroups].id 
and [marketing].[CampaignScheduleGroup].CampaignScheduleId  = [marketing].[CampaignSchedule].Id  
for XML PATH('')),1,1,'') ) else '0,' END,'0,') CampaignGroupIds,
0 CampaignContactIds,  
[marketing].[CampaignSchedule].MarketingAudienceTypeId ,
[marketing].[CampaignSchedule].StartDate,
isnull([marketing].[CampaignApprovals].MarketingApprovalStatusId,0) MarketingApprovalStatusId,
 
(select stuff((select distinct ', '+  convert(varchar,[marketing].[Channel].Name)  
  From [marketing].[Channel] inner join [marketing].[CampaignTemplateChannels] on [marketing].[CampaignTemplateChannels].ChannelId  =[marketing].[Channel].Id  
  inner join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignTemplatesId = [marketing].[CampaignTemplateChannels].CampaignTemplateId 
  where [marketing].[TemplatesInformation].CampaignId = [marketing].[Campaign].Id   
  for XML PATH('')),1,1,'') ) ChannelName,
  [marketing].[CampaignSchedule].MarketingCampaignScheduleStatusId MarketingCampaignScheduleStatus, 
  [marketing].[CampaignSchedule].IsActive ,  
  [marketing].[CampaignSchedule].IsDeleted ,  
  [marketing].[CampaignSchedule].CreatedBy , 
  [marketing].[CampaignSchedule].CreatedDate , 
  [marketing].[CampaignSchedule].ModifiedBy ,
  [marketing].[CampaignSchedule].ModifiedDate 
  , @RecordCount 
from [marketing].[CampaignSchedule]
inner join [marketing].[Campaign] on [marketing].[Campaign].id=[marketing].[CampaignSchedule].CampaignId 
Left join [marketing].[CampaignApprovals] on [marketing].[CampaignApprovals].CampaignId =[marketing].[CampaignSchedule].CampaignId  and [marketing].[CampaignApprovals].IsDeleted =0 
where [marketing].[CampaignSchedule].IsDeleted  = 0 
and ([marketing].[Campaign].Name LIKE ('%'+ @SearchCreatia +'%') 
) 
order by [marketing].[CampaignSchedule].ModifiedDate  DESC 
OFFSET (@PageNumber+-1)* @RowsOfPage
	ROW FETCH NEXT @RowsOfPage ROWS ONLY
END

--exec [marketing].[GetScheduleCampaignTypeList] 23,1,100,'','',''   -- Parameter @SearchCreatia =a