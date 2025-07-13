CREATE   PROCEDURE [policy].[MovePolicyBroker] (@policyMovementId int, @policyId int, @newBrokerageId int, @newRepresentativeId int, @juristicRepresentativeId int, @effectiveDate date, @userId varchar(128))
as begin

	begin tran trxMovePolicy

	begin try

		update [policy].[PolicyBroker] set
			[IsDeleted] = 1
		where [PolicyId] = @policyId
			and [EffectiveDate] >= @effectiveDate

		insert into [policy].[PolicyBroker] ([PolicyId], [BrokerageId], [RepId], [JuristicRepId], [EffectiveDate], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsDeleted])
		select top 1 @policyId [PolicyId],
			@newBrokerageId [BrokerageId],
			@newRepresentativeId [RepId],
			@juristicRepresentativeId [JuristicRepId],
			@effectiveDate [EffectiveDate],
			@userId [CreatedBy],
			getdate() [CreatedDate],
			@userId [ModifiedBy],
			getdate() [ModifiedDate],
			0 [IsDeleted]

		update p set
			p.[BrokerageId] = @newBrokerageId,
			p.[RepresentativeId] = @newRepresentativeId,
			p.[JuristicRepresentativeId] = @juristicRepresentativeId,
			p.[PolicyMovementId] =@policyMovementId,
			p.[ModifiedBy] = @userId,
			p.[ModifiedDate] = getdate()
		from [policy].[Policy] p
		where p.[PolicyId] = @policyId

		-- Update child policies. Use the same PolicyMovementId
		update c set 
			c.[BrokerageId] = p.[BrokerageId],
			c.[RepresentativeId] = p.[RepresentativeId],
			c.[JuristicRepresentativeId] = p.[JuristicRepresentativeId],
			c.[PolicyMovementId] = p.[PolicyMovementId],
			c.[ModifiedBy] = p.[ModifiedBy],
			c.[ModifiedDate] = p.[ModifiedDate]
		from [policy].[Policy] p
			inner join [policy].[Policy] c on c.[ParentPolicyId] = p.[PolicyId]
		where p.[PolicyId] = @policyId

		update pb set
			pb.[IsDeleted] = 1
		from [policy].[PolicyBroker] pb
			inner join (
				select c.[PolicyId]
				from [policy].[Policy] p
				inner join [policy].[Policy] c on c.[ParentPolicyId] = p.[PolicyId]
				where p.[PolicyId] = @policyId
			) t on t.[PolicyId] = pb.[PolicyId]
		where pb.[EffectiveDate] >= @effectiveDate

		insert into [policy].[PolicyBroker] ([PolicyId], [RepId], [BrokerageId], [JuristicRepId], [EffectiveDate], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsDeleted])
		select c.[PolicyId],
			c.[RepresentativeId],
			c.[BrokerageId],
			c.[JuristicRepresentativeId],
			@effectiveDate [EffectiveDate],
			@userId [CreatedBy],
			getdate() [CreatedDate],
			@userId [ModifiedBy],
			getdate() [ModifiedDate],
			0 [IsDeleted]
		from [policy].[Policy] p
			inner join [policy].[Policy] c on c.[ParentPolicyId] = p.[PolicyId]
		where p.[PolicyId] = @policyId		

		commit tran trxMovePolicy

	end try
	begin catch
		rollback tran trxMovePolicy
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

end