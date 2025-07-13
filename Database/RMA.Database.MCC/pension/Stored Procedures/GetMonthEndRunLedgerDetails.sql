/*
	List month end ledgers created for a pension case in a particular month end run
	
	Who    When             What
	---    ----------     ----------
	LS     June-2025       Init

*/
CREATE OR ALTER PROCEDURE [pension].[GetMonthEndRunLedgerDetailsForPensionCase] @monthEndRunDateId INT,
																				@pensionCaseId INT,
																				@PageIndex	INT = 1,
																				@PageSize	INT = 25,
																				@searchCriteria VARCHAR(50) = '',
																				@orderBy VARCHAR(50) = '',
																				@isAscending BIT = 1,
																				@rowCount INT = 0 OUTPUT
AS
BEGIN
	DECLARE @sql NVARCHAR(200)
	DECLARE @sortOrder VARCHAR(4)
	declare @offset int = ((@PageIndex - 1) * @PageSize)

	SELECT mpl.MonthlyPensionLedgerId,
		   mpl.Amount [PensionAmount],
		   cl.ClaimReferenceNumber,
		   rp.DisplayName [BeneficiaryName],
		   mpl.PAYE,
		   mpl.AdditionalTax,
		   mpl.PensionIncreaseId,
		   pin.IncreaseType [PensionIncreaseType],
		   mpl.PensionLedgerPaymentStatusId [PensionLedgerPaymentStatus]
	INTO #tmpResult
	FROM pension.MonthEndRunDate mrd 
	INNER JOIN pension.MonthlyPensionV2 mp ON mp.MonthEndRunDateId = mrd.MonthEndRunDateId
	INNER JOIN pension.MonthlyPensionLedgerV2 mpl ON mpl.MonthlyPensionId = mp.MonthlyPensionId
	INNER JOIN pension.[Ledger] l ON l.PensionLedgerId = mpl.PensionLedgerId
	INNER JOIN pension.PensionClaimMap pcm ON pcm.PensionClaimMapId = l.PensionClaimMapId
	INNER JOIN pension.PensionCase pc ON pc.PensionCaseId = pcm.PensionCaseId
	INNER JOIN claim.Claim cl on cl.ClaimId = pcm.ClaimId
	INNER JOIN pension.Beneficiary b ON b.BeneficiaryId = mpl.BeneficiaryId
	INNER JOIN client.RolePlayer rp ON rp.RolePlayerId = b.PersonId
	LEFT JOIN pension.PensionIncrease pin ON pin.Id = mpl.PensionIncreaseId
	LEFT JOIN common.PensionIncreaseType pet ON pet.Id = pin.IncreaseType
	WHERE mrd.MonthEndRunDateId = @monthEndRunDateId
	AND pc.PensionCaseId = @pensionCaseId

	SELECT @rowCount = COUNT(1)
	FROM #tmpResult

	SELECT @sortOrder = IIF(@isAscending = 1, 'ASC', 'DESC')

	SET @sql = N'SELECT * FROM #tmpResult
				 ORDER BY '+QUOTENAME(@orderBy)+' '+@sortOrder+' '
			+   'OFFSET '+CONVERT(VARCHAR(6),@offset)+' ROWS
				FETCH NEXT '+CONVERT(VARCHAR(5),@PageSize)+' ROWS ONLY'


	EXEC sp_executesql @sql
END
GO
