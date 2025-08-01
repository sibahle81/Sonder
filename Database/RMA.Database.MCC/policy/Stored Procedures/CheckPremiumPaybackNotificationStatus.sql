CREATE PROCEDURE [policy].[CheckPremiumPaybackNotificationStatus] @userId varchar(128)
AS BEGIN

	--declare @userId varchar(128) = 'ccilliers@randmutual.co.za'

	update pp set
		pp.PremiumPaybackStatusId = 4,
		pp.ModifiedBy = @userId,
		pp.ModifiedDate = getdate()
	from policy.PremiumPayback pp
		inner join campaign.EmailAudit ea on 
			ea.ItemType = 'Policy' and 
			ea.ItemId = pp.PolicyId		
	where pp.PremiumPaybackStatusId = 5
	  and ea.IsSuccess = 1
	  and cast(ea.CreatedDate as date) = cast(pp.NotificationSendDate as date)
	  and ea.[Subject] like '%premium cash back%'

	update pp set
		pp.PremiumPaybackStatusId = 4,
		pp.ModifiedBy = @userId,
		pp.ModifiedDate = getdate()
	from policy.PremiumPayback pp
		inner join campaign.SmsAudit sa on 
			sa.ItemType = 'Policy' and 
			sa.ItemId = pp.PolicyId		
	where pp.PremiumPaybackStatusId = 5
	  and sa.IsSuccess = 1
	  and cast(sa.CreatedDate as date) = cast(pp.NotificationSendDate as date)
	  and sa.[Message] like '%premium cash back%'

END
