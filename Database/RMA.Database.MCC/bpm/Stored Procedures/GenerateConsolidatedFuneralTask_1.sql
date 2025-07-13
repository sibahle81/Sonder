
CREATE   PROCEDURE [bpm].[GenerateConsolidatedFuneralTask] 
	@fileIdentifier uniqueidentifier, 
	@company varchar(128), 
	@userId varchar(128),
	@createNewPolicies bit,
	@wizardStatus int
AS BEGIN

	declare @name varchar(200)
	declare @data varchar(max)
	declare @nextNumber int
	declare @date datetime = getdate()
	declare @newPolicies varchar(8) = iif(@createNewPolicies = 1, 'true', 'false')

	select @nextNumber = [NextNumber] + 1 from common.DocumentNumbers (nolock) where [Name] = 'PolicyCase'
	update common.DocumentNumbers set [NextNumber] = @nextNumber  where [Name] = 'PolicyCase'

	set @name = concat('Consolidated Funeral PCAS:0', cast(@nextNumber as varchar(16)),' - ', @company)
	set @data = concat('[{"company":"',@company,'","fileIdentifier":"',@fileIdentifier,'","date":"',cast(getdate() as date),'","membersUploaded":false,"createNewPolicies":',@newPolicies,'}]');

	insert into [bpm].[Wizard] ([TenantId], [WizardConfigurationId], [WizardStatusId], [LinkedItemId], [Name], [Data], [CurrentStepIndex], [IsActive], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [StartDateAndTime])
	values (1, 113, @wizardStatus, -1, @name, @data, 1, 1, 0, @userId, @date, @userId, dateadd(minute, 1, @date), dateadd(minute, 1, @date))

	declare @wizardId int
	select @wizardId = SCOPE_IDENTITY()
	
	if @wizardStatus = 5 begin
		insert into [bpm].[Note] ([ItemId], [ItemType], [Text], [IsActive], [IsDeleted], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate])
		values (@wizardId, 'Wizard', 'Automatic rejection by the system', 1, 0, @userId, @date, @userId, @date)
	end

	select @wizardId
END