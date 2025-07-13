CREATE     PROCEDURE [marketing].getMarketingCareCampaignSheduleIds 
AS 
select distinct 
[marketing].[Campaign].Id CampId,
[marketing].CampaignSchedule.Id CampScheduleId, 
 (select stuff((select distinct ', '+  convert(varchar,[marketing].[Channel].Id)  
  From [marketing].[Channel] inner join [marketing].[CampaignTemplateChannels] on [marketing].[CampaignTemplateChannels].ChannelId  =[marketing].[Channel].Id  
  Inner Join [marketing].[CampaignTemplates] on [marketing].[CampaignTemplates].Id  = [marketing].[CampaignTemplateChannels].CampaignTemplateId 
  Inner Join [marketing].TemplatesInformation on [marketing].TemplatesInformation.CampaignId = [marketing].[Campaign].Id  
  where 
    [marketing].[CampaignTemplates].IsDeleted =0 and [marketing].[Channel].IsDeleted =0 and [marketing].[CampaignTemplateChannels].IsDeleted =0 and 
    [marketing].TemplatesInformation.CampaignId = [marketing].[Campaign].Id for XML PATH('')),1,1,'') ) ChannelName 
    ,[marketing].CampaignSchedule.StartDate ScheduleDate, [marketing].CampaignTemplates.Id [TemplateId], [marketing].CampaignTemplates.Name  TemplateName    
    ,[marketing].CampaignTemplates.ScheduleDay
    , DateAdd(Day, [marketing].CampaignTemplates.ScheduleDay-1, [marketing].CampaignSchedule.StartDate)+[marketing].CampaignTemplates.ScheduleTime ScheduledTemplateDateTime
    
 from  [marketing].CampaignSchedule  
 Inner Join [marketing].[Campaign]  on [marketing].[Campaign].Id =[marketing].CampaignSchedule.CampaignId and [marketing].[Campaign].IsDeleted = 0 
 Inner Join [marketing].TemplatesInformation on [marketing].TemplatesInformation.CampaignId = [marketing].[Campaign].Id and [marketing].TemplatesInformation.IsDeleted= 0 
 Inner Join [marketing].CampaignTemplates on [marketing].[CampaignTemplates].Id = [marketing].TemplatesInformation.CampaignTemplatesId  and [marketing].CampaignTemplates.IsDeleted =0  
 left join  [marketing].CampaignTargetAudience on  [marketing].CampaignTargetAudience.CampaignScheduleId = [marketing].CampaignSchedule.Id and  [marketing].CampaignTargetAudience.CampaignId =  [marketing].[Campaign].Id 
 and  [marketing].CampaignTargetAudience.CampaignTempateId = [marketing].[CampaignTemplates].Id  and [marketing].CampaignTargetAudience.IsDeleted =0
 where --convert(varchar, [marketing].CampaignSchedule.StartDate,112)= convert(varchar,getdate(),112)   
 --convert(varchar,DateAdd(Day, [marketing].CampaignTemplates.ScheduleDay-1, [marketing].CampaignSchedule.StartDate)+[marketing].CampaignTemplates.ScheduleTime,112) <= convert(varchar,getdate(),112)   
 DateAdd(Day, [marketing].CampaignTemplates.ScheduleDay-1, [marketing].CampaignSchedule.StartDate)+[marketing].CampaignTemplates.ScheduleTime <= getdate()
and isnull([marketing].CampaignTargetAudience.Id,'') = '' and [marketing].CampaignSchedule.IsDeleted =0 

 --exec [marketing].getMarketingCareCampaignSheduleIds 