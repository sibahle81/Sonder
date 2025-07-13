CREATE PROCEDURE [bpm].[GetUserWizards] (@userId int, @wizardConfigurations varchar(max))
AS 
BEGIN
	/*
		declare @userId  INT = 2063;
		declare @wizardConfigurations varchar(max) = '<WizardConfiguration><Id>20</Id><Id>21</Id><Id>22</Id><Id>24</Id><Id>24</Id><Id>54</Id></WizardConfiguration>'
		declare @xml xml = cast(cast(@wizardConfigurations as varbinary(max)) as xml)
		declare @configuration table (WizardConfigurationId int primary key)
		insert into @configuration select distinct x.rec.value('.', 'int') as 'WizardConfigurationId' from @xml.nodes('/WizardConfiguration/Id') as x(rec)

		select * from  [security].[fnUserTenantMap] (@userId)

		EXEC [bpm].[GetUserWizards] @userId, @wizardConfigurations;

		update bpm.wizard set tenantid = 102 where Id = 14705
		select * from bpm.wizard where Id = 45710 

		*/

	-- Select the specified wizard configurations from the XML parameter into a table variable
	declare @xml xml = cast(cast(@wizardConfigurations as varbinary(max)) as xml)
	declare @configuration table (WizardConfigurationId int primary key)
	insert into @configuration select distinct x.rec.value('.', 'int') as 'WizardConfigurationId' from @xml.nodes('/WizardConfiguration/Id') as x(rec)

	-- Get all the wizards that the user has permission to view
	select w.[Id],
		w.TenantId,
        w.[WizardConfigurationId],
        w.[WizardStatusId] [WizardStatus],
        w.[LinkedItemId],
        w.[Name],
        '' [Data],
        w.[CurrentStepIndex],
        w.[LockedToUser],
        w.[CustomStatus],
        w.[CustomRoutingRoleId],
        w.[IsActive],
        w.[IsDeleted],
        w.[CreatedBy],
        w.[CreatedDate],
        w.[ModifiedBy],
        w.[ModifiedDate],
        w.[StartDateAndTime],
        w.[EndDateAndTime]
	from [bpm].[Wizard] w with (nolock)
		inner join @configuration c on c.[WizardConfigurationId] = w.[WizardConfigurationId]		 
	where w.[WizardStatusId] in (1, 4, 6)
	  and w.[IsDeleted] = 0 
	  and w.TenantId in (Select TenantId from [security].[fnUserTenantMap] (@userId))
	order by w.[StartDateAndTime]

END
