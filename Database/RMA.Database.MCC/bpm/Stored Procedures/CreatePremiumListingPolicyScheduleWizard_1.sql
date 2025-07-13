CREATE   PROCEDURE [bpm].[CreatePremiumListingPolicyScheduleWizard] @wizardId int, @userId varchar(128)
AS BEGIN

	declare @company varchar(128)
	declare @fileIdentifier uniqueidentifier
	declare @name varchar(max)
	declare @data varchar(max)
	declare @date date = getdate()

	select @company = json_value([Data], '$[0].company'),
		@fileIdentifier = json_value([Data], '$[0].fileIdentifier')
	from [bpm].[Wizard] with (nolock)
	where [Id] = @wizardId
	
	set @name = concat('Group Policy Schedules: ', @company, ' (', @date, ')')
	set @data = concat('[{"company":"',@company,'","fileIdentifier":"',@fileIdentifier,'","date":"',@date,'","groupPolicySchedule":true}]')

	insert into [bpm].[wizard] (WizardConfigurationId, WizardStatusId, LinkedItemId, [Name], [Data], CurrentStepIndex, IsActive, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate, StartDateAndTime)
		values (118, 1, -1, @name, @data, 1, 1, 0, @userId, getdate(), @userId, getdate(), getdate())

END