 /*
	Link Monthly pension ledgers to release
	
	Who    When             What
	---    ----------     ----------
	LS     Jul-2025       Initial

*/
CREATE OR ALTER PROCEDURE [pension].[UpdateMonthlyPensionLedgerReleaseDetails] @monthEndReleaseId INT
AS
BEGIN
	
	CREATE TABLE #MonthEndLedgerPayments( MonthlyPensionLedgerId INT NOT NULL, PaymentTypeId INT NOT NULL, Amount NUMERIC(9,2) NOT NULL, Tax NUMERIC(9,2), Reference VARCHAR(250) NOT NULL, LedgerPaymentStatusId INT NULL)
	
	INSERT INTO #MonthEndLedgerPayments(MonthlyPensionLedgerId, PaymentTypeId, Amount, Tax, Reference)
	SELECT mpl.MonthlyPensionLedgerId, mpl.PaymentTypeId, mpl.Amount, mpl.PAYE + mpl.AdditionalTax,CONVERT(VARCHAR(250),mpl.MonthlyPensionLedgerId)
	FROM pension.MonthlyPensionLedgerV2 mpl
	INNER JOIN pension.MonthlyPensionV2 mp on mp.MonthlyPensionId = mpl.MonthlyPensionId
	INNER JOIN pension.MonthEndRunRelease mer on mer.MonthEndRunDateId = mp.MonthEndRunDateId
	WHERE mer.MonthEndReleaseId = @monthEndReleaseId
	
	UPDATE #MonthEndLedgerPayments
	SET LedgerPaymentStatusId = 2
	FROM #MonthEndLedgerPayments lp
	INNER JOIN payment.Payment p ON p.PaymentTypeId = lp.PaymentTypeId
		AND p.Reference = lp.Reference
		AND p.IsDeleted = 0

	UPDATE #MonthEndLedgerPayments
	SET LedgerPaymentStatusId = 6
	FROM #MonthEndLedgerPayments lp
	LEFT JOIN payment.Payment p ON p.PaymentTypeId = 13
		AND p.Reference = lp.Reference
		AND p.IsDeleted = 0
	WHERE lp.Tax > 0
	AND lp.LedgerPaymentStatusId = 2
	AND p.PaymentId IS NULL

	UPDATE #MonthEndLedgerPayments
	SET LedgerPaymentStatusId = 5
	FROM #MonthEndLedgerPayments ml
	WHERE EXISTS(select 1 from payment.PaymentErrorAudit pea
					where pea.Reference = CONVERT(VARCHAR(25), ml.MonthlyPensionLedgerId)
					and pea.PaymentTypeId = ml.PaymentTypeId
					and pea.IsDeleted = 0)
	AND ml.LedgerPaymentStatusId IS NULL

	UPDATE [pension].[MonthlyPensionLedgerV2]
	SET PensionLedgerPaymentStatusId = m.LedgerPaymentStatusId,
		MonthEndReleaseId = @monthEndReleaseId
	FROM pension.MonthlyPensionLedgerV2 mpl
	INNER JOIN #MonthEndLedgerPayments m ON m.MonthlyPensionLedgerId = mpl.MonthlyPensionLedgerId
	WHERE m.LedgerPaymentStatusId IS NOT NULL

	UPDATE [pension].[MonthEndRunRelease]
	SET Amount = (select SUM(Amount) from #MonthEndLedgerPayments
					where LedgerPaymentStatusId IS NOT NULL)
	WHERE MonthEndReleaseId = @monthEndReleaseId

	UPDATE [pension].[MonthEndRunDate]
	SET MonthEndRunStatusId = CASE WHEN EXISTS(select 1 from #MonthEndLedgerPayments where LedgerPaymentStatusId IS NULL)
								   THEN 5 --payment failed
								   ELSE 3
							  END
	FROM pension.MonthEndRunDate merd
	INNER JOIN pension.MonthEndRunRelease meer ON meer.MonthEndRunDateId = merd.MonthEndRunDateId
	WHERE meer.MonthEndReleaseId = @monthEndReleaseId


END
