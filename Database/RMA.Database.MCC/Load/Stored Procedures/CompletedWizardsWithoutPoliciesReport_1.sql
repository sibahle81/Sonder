
CREATE   PROCEDURE [Load].[CompletedWizardsWithoutPoliciesReport]
AS BEGIN
	declare @startDate date
	declare @endDate date = cast(getdate() as date)

	set @startDate = dateadd(month, -6, @startDate)

	exec [Load].[CompletedWizardsWithoutPolicies] @startDate, @endDate
END