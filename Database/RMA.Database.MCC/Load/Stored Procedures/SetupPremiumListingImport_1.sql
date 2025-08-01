CREATE PROCEDURE [Load].[SetupPremiumListingImport] (@fileIdentifier uniqueidentifier)
as begin
	set nocount on

	delete from [Load].[PremiumListingCompany] where [FileIdentifier] = @fileIdentifier
	delete from [Load].[PremiumListingBenefit] where [FileIdentifier] = @fileIdentifier
	delete from [Load].[PremiumListingMessage] where [FileIdentifier] = @fileIdentifier
	delete from [Load].[PremiumListingError] where [FileIdentifier] = @fileIdentifier

	set nocount off
end
