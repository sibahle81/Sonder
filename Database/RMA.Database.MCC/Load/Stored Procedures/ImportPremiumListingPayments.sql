CREATE PROCEDURE [Load].[ImportPremiumListingPayments] (@fileIdentifier uniqueidentifier,  @userId varchar(64))
as begin

	--declare @fileIdentifier uniqueidentifier = '093481D9-14BD-4421-8260-020093E66895'
	--declare @userId varchar(64) = 'ccilliers@randmutual.co.za'

	set nocount on
	delete from [Load].[PremiumListingPaymentError] where [FileIdentifier] = @fileIdentifier

	begin try
		begin tran trxPayments

		declare @count int

		declare @company table (
			RolePlayerId int,
			PolicyId int not null index idx_company_policy,
			primary key (RolePlayerId, PolicyId)
		)

		declare @errors table (
			[Company] [varchar](256) NULL,
			[GroupPolicyNumber] [varchar](64) NULL,
			[MemberPolicyNumber] [varchar](64) NULL,
			[MemberIdNumber] [varchar](32) NULL,
			[PaymentDate] [varchar](32) NULL,
			[PaymentAmount] [varchar](32) NULL,
			[Comment] varchar(512)
		)

		insert into @company
			select p.[PolicyOwnerId], p.[PolicyId]
			from [Load].[PremiumListingPayment] pp with (nolock)
				inner join [policy].[Policy] p with (nolock) on p.[PolicyNumber] = pp.[GroupPolicyNumber]
			where pp.[FileIdentifier] = @fileIdentifier
			group by p.[PolicyId], p.[PolicyOwnerId]

		if @@rowcount = 0 begin
			insert into @errors ([Company], [GroupPolicyNumber], [Comment])
				select top 1 [Company], [GroupPolicyNumber], 'Company or group policy does not exist'
				from [Load].[PremiumListingPayment] pp with (nolock)
				where pp.[FileIdentifier] = @fileIdentifier
		end

		declare @parentPolicyId int
		declare @policyNumber varchar(64)
		declare @companyName varchar(256)
		
		select top 1 @parentPolicyId = PolicyId from @company
		select top 1 @companyName = Company, @policyNumber = GroupPolicyNumber
		from [Load].[PremiumListingPayment] with (nolock)
		where FileIdentifier = @fileIdentifier

		insert into @errors ([Company], [GroupPolicyNumber], [MemberPolicyNumber], [MemberIdNumber], [PaymentDate], [PaymentAmount], [Comment])
			select [Company], [GroupPolicyNumber], [MemberPolicyNumber], [MemberIdNumber], [PaymentDate], [PaymentAmount], 'Payment date for member is invalid.'
			from [Load].[PremiumListingPayment] pp with (nolock)
			where pp.[FileIdentifier] = @fileIdentifier
				and isdate(pp.[PaymentDate]) = 0

		insert into @errors ([Company], [GroupPolicyNumber], [MemberPolicyNumber], [MemberIdNumber], [PaymentDate], [PaymentAmount], [Comment])
			select [Company], [GroupPolicyNumber], [MemberPolicyNumber], [MemberIdNumber], [PaymentDate], [PaymentAmount], 'Payment amount for member is invalid.'
			from [Load].[PremiumListingPayment] pp with (nolock)
			where pp.[FileIdentifier] = @fileIdentifier
				and isnumeric(pp.[PaymentAmount]) = 0

		declare @member table (
			RolePlayerId int index tmp_member_roleplayerId,
			PolicyId int index tmp_member_policyId,
			PolicyNumber varchar(64),
			IdNumber varchar(64),
			PaymentId int null index idx_member_paymentid,
			PaymentDate date index idx_member_paymentdate,
			InvoiceAmount float,
			PaymentAmount float,
			AlreadyPaid bit
		)

		insert into @member
			select isnull(pn.[RolePlayerId], 0),
				isnull(p.[PolicyId], 0),
				pp.[MemberPolicyNumber],
				pp.[MemberIdNumber],
				null [PaymentId],
				pp.[PaymentDate],
				0.0 [InvoiceAmount],
				pp.[PaymentAmount],
				0 [AlreadyPaid]
			from [Load].[PremiumListingPayment] pp with (nolock)
				left join [client].[Person] pn with (nolock) on pn.[IdNumber] = pp.[MemberIdNumber]
				left join [policy].[Policy] p with (nolock) on p.[PolicyNumber] = pp.[MemberPolicyNumber]
			where pp.[FileIdentifier] = @fileIdentifier

		insert into @errors ([Company], [GroupPolicyNumber], [MemberPolicyNumber], [MemberIdNumber], [PaymentDate], [PaymentAmount], [Comment])
			select @companyName, @policyNumber, [PolicyNumber], [IdNumber], [PaymentDate], [PaymentAmount], 'Member policy number cannot not be found in the system.'
			from @member
			where PolicyId = 0

		insert into @errors ([Company], [GroupPolicyNumber], [MemberPolicyNumber], [MemberIdNumber], [PaymentDate], [PaymentAmount], [Comment])
			select @companyName, @policyNumber, [PolicyNumber], [IdNumber], [PaymentDate], [PaymentAmount], 'Member ID number cannot not be found in the system.'
			from @member 
			where RolePlayerId = 0

		-- Update payments that have already been made
		update m set m.[AlreadyPaid] = 1
		from @member m
			inner join [billing].[PremiumListingTransaction] pt on
				pt.[RolePlayerId] = m.[RolePlayerId] and
				pt.[PolicyId] = m.[PolicyId] and
				pt.[PaymentDate] = m.[PaymentDate]

		-- Update new payments
		update m set m.[PaymentId] = t.[Id]
		from @member m inner join (
			select max(pt.[Id]) [Id],
				pt.[RolePlayerId],
				pt.[PolicyId]
			from @member m
				inner join [billing].[PremiumListingTransaction] pt on
					pt.[RolePlayerId] = m.[RolePlayerId] and
					pt.[PolicyId] = m.[PolicyId]
			where pt.[InvoiceDate] <= m.[PaymentDate]
			group by pt.[RolePlayerId],
				pt.[PolicyId]
		) t on t.[RolePlayerId] = m.[RolePlayerId]
		   and t.[PolicyId] = m.[PolicyId]

		insert into @errors ([Company], [GroupPolicyNumber], [MemberPolicyNumber], [MemberIdNumber], [PaymentDate], [PaymentAmount], [Comment])
			select @companyName, @policyNumber, [PolicyNumber], [IdNumber], [PaymentDate], [PaymentAmount], 'Transaction for member cannot not be matched to an invoice using the ID and policy numbers.'
			from @member
			where [PolicyId] > 0 and [RolePlayerId] > 0
			  and [PaymentId] is null

		-- Check if any members on the group policy do not have an entry in the file
		insert into @errors ([Company], [GroupPolicyNumber], [MemberPolicyNumber], [MemberIdNumber], [PaymentDate], [PaymentAmount], [Comment])
			select @companyName, @policyNumber, p.[PolicyNumber], per.[IdNumber], null [PaymentDate], p.[InstallmentPremium] [PaymentAmount], 'Policy member was not included in the premium payment file'
			from policy.Policy p with (nolock)
				inner join client.Person per with (nolock) on per.RolePlayerId = p.PolicyOwnerId
				left join @member m on m.RolePlayerId = per.RolePlayerId
			where m.RolePlayerId is null
			  and p.ParentPolicyId = @parentPolicyId
			  and p.PolicyStatusId in (1, 8, 15)
		
		select @count = count(*) from @errors

		if @count = 0 begin
			update pt set
				pt.[PaymentDate] = m.[PaymentDate],
				pt.[PaymentAmount] = pt.[PaymentAmount] + m.[PaymentAmount],
				pt.[PaymentStatusId] = 3,
				pt.[ModifiedBy] = @userId,
				pt.[ModifiedDate] = getdate()
			from @member m
				inner join [billing].[PremiumListingTransaction] pt on pt.[Id] = m.[PaymentId]
			select @@rowcount [Count]
			commit tran trxPayments
		end else begin
			declare @msg varchar(64) = concat('Validation: ', @fileIdentifier)
			raiserror(@msg, 11, 1)
		end
		set nocount off
	end try
	begin catch
		rollback tran trxPayments
		insert into [Load].[PremiumListingPaymentError] ([FileIdentifier], [Company], [GroupPolicyNumber], [MemberPolicyNumber], [MemberIdNumber], [PaymentDate], [PaymentAmount], [ErrorMessage])
			select @fileIdentifier, [Company], [GroupPolicyNumber], [MemberPolicyNumber], [MemberIdNumber], [PaymentDate], [PaymentAmount], [Comment]
			from @errors
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	end catch

end
