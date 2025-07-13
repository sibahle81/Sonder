CREATE PROCEDURE [bpm].[GeneratePolicyPremiumPaybackRemainingErrorTask] @paybackData varchar(max), @userId varchar(128)
AS BEGIN

	declare @caseNumber varchar(32)
	declare @name varchar(128)
	declare @nextNumber int

	declare @wizardConfigurationId int = 165

	set @userId = isnull(@userId, 'BackendProcess')

	-- Update status of policies where the bank account details are completely missing
	update ppb set
		PremiumPaybackStatusId = 4,
		PaybackFailedReason = 'Bank Account Error: Missing banking details'
	from policy.PremiumPayback ppb
		inner join policy.Policy p on p.PolicyId = ppb.PolicyId
		left join client.RolePlayerBankAccount ba on ba.RolePlayerId = p.PolicyOwnerId
	where ppb.PremiumPaybackStatusId = 2
	  and ba.RolePlayerBankingId is null

	set @paybackData = '[{"paybackItems": ' + @paybackData + '}]';

	-- Create the wizard if data could be found
	select @nextNumber = [NextNumber] from common.DocumentNumbers (nolock) where [Name] = 'PremiumPayback'
	update common.DocumentNumbers set [NextNumber] = @nextNumber + 1 where [Name] = 'PremiumPayback'

	set @caseNumber = trim(str(@nextNumber, 32))
	set @name = concat('Policy Cash Back Error PCB:', iif(len(@caseNumber) > 6, @caseNumber, right(concat('000000', @caseNumber), 6)))

	insert into bpm.Wizard ([TenantId], [WizardConfigurationId], [WizardStatusId], [LinkedItemId], [Name], [Data], [CurrentStepIndex], [IsActive], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [StartDateAndTime])
	select 1 [TenantId],
		@wizardConfigurationId [WizardConfigurationId],
		1 [WizardStatusId],
		-1 [LinkedItemId],
		@name [Name],
		@paybackData [Data],
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

END
go
