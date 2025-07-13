CREATE    Procedure [marketing].[GetCampaignDetails]
(
	@Id Int
)
As
Begin
	
Select   
[marketing].[Campaign].Id, 
[marketing].[Campaign].Name, 
[marketing].[Campaign].CampaignMarketingTypeId, 
[marketing].[CampaignType].[Name] [CampaignTypeName], 
[marketing].[CampaignTemplates].[Id] [CampaignTemplateId],
[marketing].[CampaignTemplates].[Name] [MarketingTemplateName],
[marketing].[Campaign].IsDeleted , 
[marketing].[Campaign].IsActive, 
[marketing].[Campaign].CreatedDate,
[marketing].[Campaign].CreatedBy, 
[marketing].[Campaign].ModifiedBy, 
[marketing].[Campaign].ModifiedDate  
from [marketing].[Campaign]
INNER Join [marketing].[CampaignType] on [marketing].[CampaignType].Id = [marketing].[Campaign].CampaignMarketingTypeId 
INNER Join [marketing].[CampaignApprovals] on [marketing].[CampaignApprovals].CampaignId = [marketing].[Campaign].Id 
LEFT Join [marketing].[TemplatesInformation] on [marketing].[TemplatesInformation].CampaignId =[marketing].[Campaign].Id 
LEFT Join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id =  [marketing].[TemplatesInformation].CampaignTemplatesId 
where [marketing].[Campaign].Id = @Id and [marketing].[Campaign].IsDeleted = 0 

END
--exec [marketing].[GetCampaignDetails] 1 --( 1 is Campaign Id)