CREATE   PROCEDURE [marketing].[GetScheduleIdEmailSMSDetails] 
(
	@CampaignScheduleId int,
	@TemplateId int
)
AS
BEGIN 
select  
[marketing].CampaignTargetAudience.Id [TargetAudienceId], 
[marketing].CampaignScheduleContact.ContactName [Name], 
[marketing].CampaignScheduleContact.ContactNumber [Phone1], 
'ksharma@randmutual.co.za' EMAIL,
[marketing].CampaignScheduleContact.CampaignScheduleId, 
[marketing].[CampaignSchedule].CampaignId, 
[marketing].Channel.Id [ChannelId], 
[marketing].Channel.Name [ChannelName], 
[marketing].CampaignTemplates.Name [TemplateName], 
[marketing].CampaignTemplateChannels.EmailSubject, 
[marketing].CampaignTemplates.Id [TemplateId], 
[marketing].CampaignTemplateChannels.Message,
[marketing].CampaignScheduleContact.IsActive 
from [marketing].CampaignScheduleContact  
Inner Join [marketing].[CampaignSchedule] on [marketing].[CampaignSchedule].Id= [marketing].CampaignScheduleContact.CampaignScheduleId   
Inner Join [Client].[FinPayee] on [Client].[FinPayee].FinPayeNumber =[marketing].CampaignScheduleContact.MemberNumber 
Inner Join  [client].[Roleplayer] on  [client].[Roleplayer].RolePlayerId =[Client].[FinPayee].RolePlayerId 
inner join [marketing].Campaign on [marketing].Campaign.id=[marketing].CampaignSchedule.CampaignId 
inner join [marketing].TemplatesInformation on [marketing].TemplatesInformation.CampaignId =[marketing].Campaign.id
inner join [marketing].CampaignTemplateChannels on [marketing].CampaignTemplateChannels.CampaignTemplateId =[marketing].TemplatesInformation.CampaignTemplatesId 
inner join [marketing].Channel on [marketing].Channel.Id = [marketing].CampaignTemplateChannels.ChannelId 
inner join [marketing].CampaignTemplates on [marketing].CampaignTemplates.Id = [marketing].CampaignTemplateChannels.CampaignTemplateId and [marketing].CampaignTemplates.Id = @TemplateId 
LEFT Join [marketing].CampaignTargetAudience on [marketing].CampaignTargetAudience.CampaignScheduleId = [marketing].CampaignScheduleContact.CampaignScheduleId  
and [marketing].CampaignTargetAudience.CampaignId =  [marketing].Campaign.Id and [marketing].CampaignTargetAudience.Name = [marketing].CampaignScheduleContact.ContactName 
and [marketing].CampaignScheduleContact.IsDeleted = 0 and [marketing].CampaignTargetAudience.IsDeleted = 0
AND [marketing].CampaignTargetAudience.ChannelId =[marketing].Channel.Id 
where [marketing].CampaignScheduleContact.CampaignScheduleId= @CampaignScheduleId   and [marketing].CampaignTemplateChannels.IsDeleted = 0 and [marketing].TemplatesInformation.IsDeleted =0
and [marketing].Campaign.IsDeleted =0 and [marketing].CampaignTemplates.IsDeleted =0 
order by  [marketing].Channel.Id ,[client].[Roleplayer].DisplayName  
END 

--exec [marketing].[GetScheduleIdEmailSMSDetails] 83, 103   ---  Parameter is = CampaignScheduleId   =  @CampaignScheduleId   , @TemplateId 