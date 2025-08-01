CREATE PROCEDURE [policy].[SetupPremiumPaybackNotifications] @userId varchar(128)
AS BEGIN

	declare @campaign varchar(32) = 'Policy Premium Payback'
	declare @count int = 0

	declare @payback table (
		PolicyId int,
		PaybackDate date,
		WhenToSend date,
		MobileNumber varchar(64),
		ValidMobileNumber bit default(0),
		AlreadySent bit default(0)
	)

	insert into @payback (PolicyId, PaybackDate, WhenToSend, MobileNumber)
		select pp.PolicyId,
			pp.PaybackDate,
			dateadd(day, -1, pp.PaybackDate),
			rp.CellNumber
		from policy.PremiumPayback pp (nolock)
			inner join policy.Policy p (nolock) on p.PolicyId = pp.PolicyId
			inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
		where pp.PremiumPaybackStatusId = 7

	update pb set
		AlreadySent = 1
	from @payback pb
		inner join campaign.BulkSmsRequestHeader h on h.Campaign = @campaign and h.WhenToSend = pb.WhenToSend
		inner join campaign.BulkSmsRequestDetail d on d.BulkSmsRequestHeaderId = h.BulkSmsRequestHeaderId and d.ItemType = 'Policy' and d.ItemId = pb.PolicyId

	update @payback set
		ValidMobileNumber = 1
	where isnumeric(MobileNumber) = 1
	  and len(MobileNumber) = 10
	  and left(MobileNumber, 1) = '0'

	if exists (select * from @payback where AlreadySent = 0) begin
		declare @sendDate date
		declare @message varchar(512)
		declare @bulkSmsRequestHeaderId int

		select @sendDate = max(WhenToSend) from @payback
		select @message = [Value] from common.Settings where [Key] = 'PremiumPaybackNotificationSms'

		-- Insert campaign.BulkSmsRequestHeader
		insert into campaign.BulkSmsRequestHeader ([Department], [Campaign], [SmsStatusId], [WhenToSend], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
			select 11 [Department],
				@campaign [Campaign],
				1 [SmsStatusId],
				dateadd(day, -1, @sendDate) [WhenToSend],
				0 [IsDeleted],
				@userId [CreatedBy],
				getdate() [CreatedDate],
				@userId [ModifiedBy],
				getdate() [ModifiedDate]
		select @bulkSmsRequestHeaderId = SCOPE_IDENTITY()
		-- Insert campaign.BulkSmsRequestDetail
		insert into campaign.BulkSmsRequestDetail ([BulkSmsRequestHeaderId], [ItemId], [ItemType], [CellPhoneNumber], [SmsMessage], [SmsStatusId], [SendAttemptCount], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
			select @bulkSmsRequestHeaderId [BulkSmsRequestHeaderId],
				pb.PolicyId [ItemId],
				'Policy' [ItemType],
				pb.MobileNumber [CellPhoneNumber],
				@message [SmsMessage],
				1 [SmsStatusId],
				1 [SendAttemptCount],
				0 [IsDeleted],
				@userId [CreatedBy],
				getdate() [CreatedDate],
				@userId [ModifiedBy],
				getdate() [ModifiedDate]
			from @payback pb
			where pb.AlreadySent = 0
			  and pb.ValidMobileNumber = 1
		select @count = @@ROWCOUNT

		-- Update the PremiumPayback records
		update pp set
			pp.PremiumPaybackStatusId = 5, -- select * from common.PremiumPaybackStatus
			pp.PaybackFailedReason = null,
			pp.NotificationSendDate = getdate(),
			pp.ModifiedBy = @userId,
			pp.ModifiedDate = getdate()
		from @payback pb
			inner join policy.PremiumPayback pp (nolock) on pp.PolicyId = pb.PolicyId
		where pb.AlreadySent = 0
		  and pb.ValidMobileNumber = 1

		update pp set
			pp.PremiumPaybackStatusId = 6, -- select * from common.PremiumPaybackStatus
			pp.PaybackFailedReason = concat('SMS Notification Error: ',pb.MobileNumber,' is not a valid mobile number'),
			pp.ModifiedBy = @userId,
			pp.ModifiedDate = getdate()
		from @payback pb
			inner join policy.PremiumPayback pp (nolock) on pp.PolicyId = pb.PolicyId
		where pb.AlreadySent = 0
		  and pb.ValidMobileNumber = 0
	end

	select @count [Count]

END
GO
