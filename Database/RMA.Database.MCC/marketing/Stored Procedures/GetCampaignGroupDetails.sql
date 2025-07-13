CREATE     Procedure [marketing].[GetCampaignGroupDetails]
(
@Id as int
)
AS
Begin

select 
[marketing].[CampaignGroups].Id, 
[marketing].[CampaignGroups].GroupName, 
[marketing].[CampaignGroupConditions].Id [CampaignGroupConditionsId], 
[marketing].[CampaignGroupConditions].Entity,
[marketing].[CampaignGroupConditions].Operator,
[marketing].[CampaignGroupConditions].Value, 
[marketing].[CampaignGroupConditions].ConditionOperator, 
[marketing].[CampaignGroups].IsActive,
[marketing].[CampaignGroups].IsDeleted , 
[marketing].[CampaignGroups].CreatedBy , 
[marketing].[CampaignGroups].CreatedDate , 
[marketing].[CampaignGroups].ModifiedBy, 
[marketing].[CampaignGroups].ModifiedDate  
from [marketing].[CampaignGroups]
inner join [marketing].[CampaignGroupConditions] on [marketing].[CampaignGroupConditions].CampaignGroupId = [marketing].[CampaignGroups].Id
where [marketing].[CampaignGroups].Id = @Id and [marketing].[CampaignGroups].IsDeleted = 0 and [marketing].[CampaignGroupConditions].IsDeleted  = 0 

END

--exec [marketing].[GetCampaignGroupDetails] 53  --(here 1 is GroupId Parameters  , CampaignGroupConditionsId = [marketing].[CampaignGroupConditions].Id  ) 