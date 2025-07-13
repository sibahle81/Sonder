CREATE   procedure [policy].[InsureLifeUploadTask]
@COMPANY varchar(50),
@FILEIDENTIFIER varchar(50),
@DATE varchar(50),
@VERSION varchar(4) = '1',
@USER varchar(128) = 'system@randmutual.co.za'
as begin
	insert into [bpm].[wizard] (TenantId,WizardConfigurationId,WizardStatusId,LinkedItemId,[Name],[Data],CurrentStepIndex,LockedToUser,CustomStatus,CustomRoutingRoleId,IsActive,IsDeleted,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate,StartDateAndTime,EndDateAndTime)
	values (1, 89, 4, -1, 'Insured-Lives: '+@COMPANY+' ('+@DATE+')', '[{"company": "'+@COMPANY+'", "fileIdentifier": "'+@FILEIDENTIFIER+'", "date": "'+@DATE+'", "version": "'+@VERSION+'", "insuredLivesUploaded": false}]', 1, NULL, NULL, NULL, 1, 0, @USER, getdate(), @USER, getdate() + 1, getdate(), NULL)
end