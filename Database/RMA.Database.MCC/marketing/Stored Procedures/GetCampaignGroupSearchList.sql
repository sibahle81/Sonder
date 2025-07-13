CREATE Procedure [marketing].[GetCampaignGroupSearchList]
(
	@GroupName as varchar(250)
)
AS
Begin

select 
[marketing].[CampaignGroups].Id, 
[marketing].[CampaignGroups].GroupName
from 
[marketing].CampaignGroups
Where 	[marketing].[CampaignGroups].IsDeleted = 0 and  
		[marketing].[CampaignGroups].GroupName like '%'+ @GroupName +'%'
		order by [marketing].[CampaignGroups].GroupName
END 

--exec [marketing].[GetCampaignGroupSearchList] 'pay'  --(here 'har' is GroupName Parameters) 