CREATE   Procedure [marketing].[GetMarketingCampaignTypeApproverList] 
(
@Id int,
@CampaignId int
)
As 
Begin

select  
distinct [marketing].CampaignTypeApprover.Id , 
case when @CampaignId <> 0 then 
isnull([security].[User].Id,'') 
ELSE 0 END UserId,
case when @CampaignId <> 0 then 
isnull(case when isnull([security].[User].UserName,'') ='' then [security].[User].DisplayName else [security].[User].UserName end,'') 
ELSE '' END UserName,  
[security].[Role].Id [RoleId], 
[security].[Role].Name [RoleName], 
[marketing].CampaignTypeApprover.ApproverType,   
[marketing].[CampaignApprovals].MarketingApprovalStatusId, 
(select  [common].[MarketingApprovalStatus].Name from [common].[MarketingApprovalStatus] where [common].[MarketingApprovalStatus].Id= [marketing].[CampaignApprovals].MarketingApprovalStatusId) MarketingApprovalStatusName 
from [marketing].CampaignType 
Left Join [marketing].[CampaignTypeApprover] on [marketing].[CampaignTypeApprover].CampaignMarketingTypeId = [marketing].CampaignType.Id 
Left Join [marketing].[CampaignApprovals] on [marketing].[CampaignApprovals].CampaignTypeApproverId = [marketing].[CampaignTypeApprover].Id  and [marketing].[CampaignApprovals].IsDeleted =0  
left join [marketing].[Campaign] on [marketing].[Campaign].id  = [marketing].CampaignApprovals.CampaignId 
Left Join [security].[User] on [security].[User].Id = [marketing].[CampaignApprovals].ApproverUserId
Left join  [security].[Role] on [security].[Role].Id =[marketing].[CampaignTypeApprover].RoleId 
where [marketing].CampaignType.Id=@Id and [marketing].[CampaignTypeApprover].IsDeleted =0 AND [marketing].CampaignType.IsDeleted =0 
and  
(
			 (@CampaignId=0 )
			OR 
			 (@CampaignId <> 0 AND [Marketing].campaign.id= @CampaignId )
)
order by [marketing].CampaignTypeApprover.ApproverType desc
End

--exec [marketing].[GetMarketingCampaignTypeApproverList] 58,0  -- Parameter  @Id= [marketing].CampaignType.Id  , @CampaignId =25