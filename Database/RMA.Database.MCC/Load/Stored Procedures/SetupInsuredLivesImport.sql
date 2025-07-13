CREATE   PROCEDURE [Load].[SetupInsuredLivesImport] (@fileIdentifier uniqueidentifier)
as begin
	set nocount on

	delete from [Load].[InsuredLivesCompany] where [FileIdentifier] = @fileIdentifier
	delete from [Load].[InsuredLivesBenefit] where [FileIdentifier] = @fileIdentifier
	delete from [Load].[InsuredLivesMessage] where [FileIdentifier] = @fileIdentifier
	delete from [Load].[InsuredLivesError] where [FileIdentifier] = @fileIdentifier

	set nocount off
end