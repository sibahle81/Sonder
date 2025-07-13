CREATE Procedure [marketing].GetMarketingCareCampaignScheduledDeliveryReport 
(
	@CampaignScheduleId int
)
AS
BEGIN
	select  
	[marketing].[CampaignTargetAudience].[Name] ,
	[marketing].[CampaignTargetAudience].SurName ,
	[marketing].[CampaignTargetAudience].Email ,
	[marketing].[CampaignTargetAudience].Phone ,
	[marketing].Campaign.Name [CampaignName],  
	[marketing].CampaignType.Name [CampaignTypeName],
	[marketing].Channel.Name [ChannelName],
	[marketing].CampaignTemplates.Name [CampaignTemplateName],
	[marketing].[CampaignTargetAudience].IsSent ,
	[marketing].[CampaignTargetAudience].IsDelivered 
	from [marketing].[CampaignTargetAudience]
		INNER Join [marketing].Campaign on [marketing].Campaign.Id = [marketing].[CampaignTargetAudience].CampaignId 
		INNER Join [marketing].CampaignType on [marketing].CampaignType.Id =[marketing].Campaign.CampaignMarketingTypeId 
		INNER Join [marketing].Channel on [marketing].Channel.Id = [marketing].[CampaignTargetAudience].ChannelId 
		INNER Join [marketing].CampaignTemplates on [marketing].CampaignTemplates.Id = [marketing].[CampaignTargetAudience].CampaignTempateId 
	where [marketing].[CampaignTargetAudience].IsDeleted = 0 
		and [marketing].[CampaignTargetAudience].CampaignScheduleId = @CampaignScheduleId
			
END 

-- exec [marketing].GetMarketingCareCampaignScheduledDeliveryReport 58 -- Parameter @CampaignScheduleId = 58