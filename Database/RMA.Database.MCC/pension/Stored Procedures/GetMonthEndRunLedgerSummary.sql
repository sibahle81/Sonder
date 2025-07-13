/*
	Get grouped monthly ledger details on PensionCase

	
	Who    When             What
	---    ----------     ----------
	LS     June-2025       Init

*/
CREATE OR ALTER PROCEDURE [pension].[GetMonthEndRunLedgerSummary] @monthEndRunDateId INT,
															      @PageIndex	INT = 1,
																  @PageSize	INT = 50,
																  @searchCriteria VARCHAR(50) = ''
AS
BEGIN
	declare @offset int = ((@PageIndex - 1) * @PageSize)

	select mrd.MonthEndRunDateId,pc.PensionCaseId,pc.PensionCaseNumber, per.DisplayName [PensionerDisplayName],SUM(mpl.Amount) [PensionAmount], SUM(mpl.PAYE) [PAYE], SUM(mpl.AdditionalTax) [AdditionalTax]

	from pension.MonthlyPensionLedgerV2 mpl
	inner join pension.[Ledger] l on l.PensionLedgerId = mpl.PensionLedgerId
	inner join pension.PensionClaimMap pcm on pcm.PensionClaimMapId = l.PensionClaimMapId
	inner join pension.MonthlyPensionV2 mp on mp.MonthlyPensionId = mpl.MonthlyPensionId
	inner join pension.MonthEndRunDate mrd on mrd.MonthEndRunDateId = mp.MonthEndRunDateId
	inner join pension.PensionCase pc on pc.PensionCaseId = pcm.PensionCaseId
	inner join pension.Pensioner pen on pen.PensionClaimMapId = l.PensionClaimMapId
	left join client.RolePlayer per on per.RolePlayerId = pen.PersonId	
	where mrd.MonthEndRunDateId = @monthEndRunDateId
	and ((pc.PensionCaseNumber like ('%'+@searchCriteria+'%') OR @searchCriteria = '') OR
	     (per.DisplayName like ('%'+@searchCriteria+'%') OR @searchCriteria = ''))
	group by  mrd.MonthEndRunDateId,pc.PensionCaseId,pc.PensionCaseNumber, per.DisplayName
	order by  pc.PensionCaseNumber, [PensionerDisplayName]
	OFFSET @offset ROWS
	FETCH NEXT @PageSize ROWS ONLY
END
GO