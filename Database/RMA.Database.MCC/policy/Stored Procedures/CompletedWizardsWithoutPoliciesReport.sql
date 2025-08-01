CREATE PROCEDURE [Load].[CompletedWizardsWithoutPoliciesReport]
AS BEGIN
	declare @startDate date
	declare @endDate date = cast(getdate() as date)

	set @startDate = dateadd(month, -6, @endDate)

	exec [Load].[CompletedWizardsWithoutPolicies] @startDate, @endDate
END
GO
