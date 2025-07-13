CREATE   PROCEDURE [bpm].[GetConsolidatedFuneralWizardName] @fileIdentifier uniqueidentifier
AS BEGIN
	select [Name] from [bpm].[Wizard]
	where [WizardConfigurationId] = 113
	  and json_value([Data], '$[0].fileIdentifier') = @fileIdentifier
END