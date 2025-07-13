Create   Procedure [marketing].GetMarketingCareCampaignScheduleGroupRecordDetails 
(
	@CampaignScheduleId int 
)
AS
Begin
	select CampaignGroupId,Entity,ConditionOperator,Value,Operator
		from marketing.CampaignGroupConditions
		where CampaignGroupId in (select GroupId from marketing.CampaignScheduleGroup where CampaignScheduleId = @CampaignScheduleId)
		and IsDeleted = 0 order by CampaignGroupId
END 

--exec [marketing].GetMarketingCareCampaignScheduleGroupRecordDetails 79  --  Parameter @CampaignScheduleId = 79 