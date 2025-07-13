CREATE   Procedure [marketing].[GetCampaignTypeDetails]
(
@Id as int,
@RecordCount INT = 0 OUTPUT
)
AS
Begin

select 
[marketing].[CampaignType].Id, 
[marketing].[CampaignType].[Name], 
[marketing].[CampaignTypeApprover].Id [CampaignTypeApproverId], 
[marketing].[CampaignApprovals].ApproverUserId,
case when isnull([security].[User].UserName,'')='' then [security].[User].UserName 
else [security].[User].DisplayName  end AppoverUser, 
[marketing].[CampaignTypeApprover].ApproverType, 
[marketing].[CampaignTypeApprover].RoleId,
[security].[Role].Name [RoleName], 
[marketing].[CampaignType].IsDeleted ,
[marketing].[CampaignType].IsActive , 
[marketing].[CampaignType].CreatedBy, 
[marketing].[CampaignType].CreatedDate, 
[marketing].[CampaignType].ModifiedBy , 
[marketing].[CampaignType].ModifiedDate 
from 
[marketing].[CampaignType] 
INNER join [marketing].[CampaignTypeApprover] on [marketing].[CampaignTypeApprover].CampaignMarketingTypeId = [marketing].[CampaignType].Id   
Left join [marketing].[CampaignApprovals] on [marketing].[CampaignApprovals].CampaignTypeApproverId = [marketing].[CampaignTypeApprover].Id  and [marketing].[CampaignTypeApprover].IsDeleted =0 
Inner join [security].[User] on  [security].[User].Id = [marketing].[CampaignApprovals].ApproverUserId
LEFT join [security].[Role] on [security].[Role].Id = [marketing].[CampaignTypeApprover].RoleId
Where [marketing].[CampaignType].Id = @Id and [marketing].[CampaignType].IsDeleted =0

END 

--exec [marketing].[GetCampaignTypeDetails] 17  --(here 1 is CampaignTypeId Parameters) 