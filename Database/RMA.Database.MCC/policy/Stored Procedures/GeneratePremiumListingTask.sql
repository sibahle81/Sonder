CREATE PROCEDURE [policy].[GeneratePremiumListingTask]
	@COMPANY varchar(50),
	@FILEIDENTIFIER varchar(50),
	@DATE varchar(50),
	@VERSION varchar(4) = '1',
	@USER varchar(128) = 'system@randmutual.co.za',
	@CreateNewPolicies bit = 0
as begin

	declare @name varchar(200)
	declare @nextNumber int

	select @nextNumber = [NextNumber] + 1 from common.DocumentNumbers (nolock) where [Name] = 'PolicyCase'
	update common.DocumentNumbers set [NextNumber] = @nextNumber  where [Name] = 'PolicyCase'

	set @name = concat('Premium Listing PCAS:', cast(@nextNumber as varchar(16)),' - ', @COMPANY)

	declare @newPolicies varchar(8) = iif(@CreateNewPolicies = 1, 'true', 'false')
	declare @data varchar(max) = concat('[{"company":"',@COMPANY,'", "fileIdentifier":"',@FILEIDENTIFIER,'", "date":"',@DATE,'", "version":',@VERSION,', "membersUploaded":false, "createNewPolicies":',@newPolicies,'}]')
	
	insert into [bpm].[wizard]  (WizardConfigurationId,WizardStatusId,LinkedItemId,[Name],[Data],CurrentStepIndex,LockedToUser,CustomStatus,CustomRoutingRoleId,IsActive,IsDeleted,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate,StartDateAndTime,EndDateAndTime)
		values (24, 1, -1, @name, @data, 1, NULL, NULL, NULL, 1, 0, @USER, getdate(), @USER, getdate(), getdate(), NULL)

end
go
