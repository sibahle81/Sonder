CREATE PROCEDURE [Load].[SaveConsolidatedFuneralImportError] (@wizardId int, @fileIdentifier uniqueidentifier, @errorMessage varchar(max))
AS BEGIN

	update [bpm].[Wizard] set 
		[WizardStatusId] = 1, 
		[CurrentStepIndex] = 1,
		[LockedToUser] = null,
		-- Reset ModifiedBy so that the same person can try to approve again
		[ModifiedBy] = [CreatedBy]
	where [Id] = @wizardId
	delete from [Load].[ConsolidatedFuneralError] where [FileIdentifier] = @fileIdentifier
	insert into [Load].[ConsolidatedFuneralError] ([FileIdentifier], [ErrorCategory], [ErrorMessage], [ErrorDate], [NotificationStatusId])
	values (@fileIdentifier, 'System', @errorMessage, getdate(), 1)
	
END
