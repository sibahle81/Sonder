CREATE PROCEDURE [bpm].[GeneratePolicyPremiumPaybackTask] @userId varchar(128)
AS BEGIN

	declare @caseNumber varchar(32)
	declare @name varchar(128)
	declare @data varchar(max)
	declare @nextNumber int

	declare @wizardConfigurationId int = 159

	set @userId = isnull(@userId, 'BackendProcess')
	
	declare @date date = getdate()
	set @date = datefromparts(year(@date), month(@date), 1)

	select @data = concat('[',(
		select t.policyId,
			t.policyNumber,
			t.policyInceptionDate,
			t.RolePlayerId,
			t.policyOwner,
			t.mobileNumber,
			t.premiumPaybackId,
			t.paybackDate,
			t.notificationDate,
			t.premiumPaybackStatus,
			t.paybackAmount,
			t.paybackFailedReason,
			t.rolePlayerBankingId,
			t.bankAccountType,
			t.accountNumber,
			t.bankId,
			t.bankBranchId,
			t.branchCode
		from (
			select p.policyId,
				p.policyNumber,
				p.policyInceptionDate,
				rp.RolePlayerId,
				upper(concat(per.FirstName, ' ', per.Surname)) [PolicyOwner],
				rp.cellNumber [mobileNumber],
				pp.premiumPaybackId,
				pp.paybackDate,
				pp.notificationSendDate [notificationDate],
				pp.premiumPaybackStatusId [premiumPaybackStatus],
				cast(pp.paybackAmount as money) [paybackAmount],
				pp.paybackFailedReason,
				ba.rolePlayerBankingId,
				ba.bankAccountTypeId [bankAccountType],
				ba.accountNumber,
				ba.bankId,
				ba.bankBranchId,
				ba.branchCode
			from policy.Policy p (nolock)
				inner join policy.PremiumPayback pp (nolock) on pp.PolicyId = p.PolicyId
				inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
				inner join client.Person per (nolock) on per.RolePlayerId = rp.RolePlayerId
				left join client.RolePlayerBankAccount ba (nolock) on ba.RolePlayerId = rp.RolePlayerId
			where pp.PremiumPaybackStatusId = 3 -- select * from common.PremiumPaybackStatus
			  and pp.PaybackDate > @date
			  and pp.IsDeleted = 0
		) t
		for json auto, root('paybackItems')), ']')

	if len(@data) > 4 begin
		select @nextNumber = [NextNumber] from common.DocumentNumbers (nolock) where [Name] = 'PremiumPayback'
		update common.DocumentNumbers set [NextNumber] = @nextNumber + 1 where [Name] = 'PremiumPayback'

		set @caseNumber = trim(str(@nextNumber, 32))
		set @name = concat('Policy Cash Back PCB:', iif(len(@caseNumber) > 6, @caseNumber, right(concat('000000', @caseNumber), 6)))

		insert into bpm.Wizard ([TenantId], [WizardConfigurationId], [WizardStatusId], [LinkedItemId], [Name], [Data], [CurrentStepIndex], [IsActive], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [StartDateAndTime])
		select 1 [TenantId],
			@wizardConfigurationId [WizardConfigurationId],
			1 [WizardStatusId],
			-1 [LinkedItemId],
			@name [Name],
			@data [Data],
			1 [CurrentStepIndex],
			1 [IsActive],
			0 [IsDeleted],
			@userId [CreatedBy],
			getdate() [CreatedDate],
			@userId [ModifiedBy],
			getdate() [ModifiedDate],
			getdate() [StartDateAndTime]
	
		declare @wizardId int
		select @wizardId = SCOPE_IDENTITY()

		select [Name] [WizardName] from bpm.Wizard where Id = @wizardId
	end else begin	 
		select '' [WizardName]
	end

END
