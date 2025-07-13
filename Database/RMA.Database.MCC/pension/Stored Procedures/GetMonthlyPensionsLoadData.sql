 /*
	Get ledgers to use for creating monthly pensions i.e. Get the data for 
	month end payment run
	Who    When             What
	---    ----------     ----------
	LS     May-2025       Init
	LS     Jun-2025       Apply pro-rata on bonus payments
	LS     Jun-2025       Insert data into the tables at this point EF takes way too long

*/
CREATE OR ALTER PROCEDURE [pension].[GetMonthlyPensionsLoadData] @monthEndRunDateId int,
															     @userId int,
																 @writeData bit = 0
AS
BEGIN

	CREATE TABLE #tmpMonthlyRunLedger (Id INT NOT NULL IDENTITY, PensionLedgerId INT NOT NULl, PaymentTypeId INT NOT NULL, 
									   PaymentAmount DECIMAL(18,0), PAYE DECIMAL(9,2), AdditionalTax DECIMAL(9,2), BeneficiaryId INT NOT NULL,
									   CanRelease BIT NOT NULL DEFAULT 1, IsTaxable BIT , PensionIncreaseId INT, Age INT, PensionLedgerPaymentStatusId INT NOT NULL,
									   LedgerRecoveryId INT NULL, PaymentItemId INT NULL, AmountRecovered DECIMAL(9,2) NULL,RolePlayerBankingId INT NULL, AnnualIncome AS ([PaymentAmount] * 12))
	CREATE NONCLUSTERED INDEX IDX_TmpMonthlyLedgers_LedgerId ON #tmpMonthlyRunLedger(PensionLedgerId)
	
	CREATE TABLE #tmpBonusPayLedger(PensionLedgerId INT,  TotalAnnualIncome DECIMAL(9,2))
	CREATE NONCLUSTERED INDEX IDX_TmpBonusLedgers_LedgerId ON #tmpBonusPayLedger(PensionLedgerId)


	DECLARE @monthEndRunMonth DateTime,
			@taxYearId INT,
			@taxYear INT

	DECLARE @PensionIncreseId INT,
			@PensionIncreaseAmountTypeId INT,
			@IncreasePercentage INT,
			@IncreaseAmount DECIMAL(18,0)

	SELECT @monthEndRunMonth = DATEFROMPARTS( [Year], MonthId, 1)
	FROM pension.MonthEndRunDate
	WHERE MonthEndRunDateId = @monthEndRunDateId

	SELECT @taxYearId = ty.Id
	FROM pension.TaxYear ty
	WHERE ty.[Year] = (SELECT CASE WHEN DATEPART(MONTH,rd.PaymentDate) <= 2 THEN DATEPART(YEAR,rd.PaymentDate) ELSE DATEPART(YEAR,rd.PaymentDate) + 1 END
					    FROM pension.MonthEndRunDate rd
						WHERE rd.MonthEndRunDateId = @monthEndRunDateId)
	
	INSERT INTO #tmpMonthlyRunLedger(PensionLedgerId, PaymentTypeId, PaymentAmount, PAYE, AdditionalTax, BeneficiaryId, Age, PensionLedgerPaymentStatusId, RolePlayerBankingId)
	SELECT l.PensionLedgerId, 7, l.NormalMonthlyPensionPayeExcludingTax, 0, 0, l.BeneficiaryId, DATEDIFF(YEAR, p.DateOfBirth, @monthEndRunMonth), CASE WHEN l.PensionLedgerStatusId = 2 
																																	   THEN 1 
																																	   ELSE 3 
																																END,
	      lr.RolePlayerBankingId
	FROM pension.Ledger l
	INNER JOIN pension.Beneficiary b ON b.BeneficiaryId = l.BeneficiaryId
	INNER JOIN client.Person p ON p.RolePlayerId = b.PersonId
	LEFT JOIN pension.LedgerRecipient lr ON lr.PensionLedgerId = l.PensionLedgerId
		AND lr.IsDeleted = 0
	WHERE l.PensionLedgerStatusId IN (2,3) --running
	AND l.IsDeleted = 0
	AND l.NormalMonthlyPensionPayeExcludingTax IS NOT NULl AND l.NormalMonthlyPensionPayeExcludingTax > 0
	
	--apply recovery
	UPDATE #tmpMonthlyRunLedger
	SET AmountRecovered = lr.MonthlyPaybackAmount,
		LedgerRecoveryId = lr.LedgerRecoveryId
	FROM #tmpMonthlyRunLedger ml
	INNER JOIN pension.LedgerRecovery lr ON lr.PensionLedgerId = ml.PensionLedgerId
	WHERE lr.IsDeleted = 0
	 AND lr.EffectiveDate = (select MAX(l2.EffectiveDate) from pension.LedgerRecovery l2
								where l2.PensionLedgerId = ml.PensionLedgerId
								and l2.EffectiveDate <= @monthEndRunMonth)
	--load corrective entries
	INSERT INTO #tmpMonthlyRunLedger(PensionLedgerId, PaymentTypeId, PaymentAmount, PAYE, AdditionalTax, BeneficiaryId, Age, PensionLedgerPaymentStatusId, PaymentItemId, RolePlayerBankingId)
	SELECT ml.PensionLedgerId, 11, ce.Amount, ce.VATAmount, 0, ml.BeneficiaryId,ml.Age,ml.PensionLedgerPaymentStatusId, ce.CorrectiveEntryId, rbd.RolePlayerBankingId
	FROM #tmpMonthlyRunLedger ml 
	INNER JOIN pension.CorrectiveEntry ce ON ce.LedgerId = ml.PensionLedgerId
	LEFT JOIN pension.PensionRecipient pr ON pr.PensionRecipientId = ce.RecipientId
	LEFT JOIN client.RolePlayerBankingDetails rbd ON rbd.RolePlayerId = pr.PersonId
	WHERE ce.ScheduleTypeId = 3
		AND ce.EntryStatusId = 2
		AND (ce.AddedToMonthlyPension IS NULl OR ce.AddedToMonthlyPension = 0)
		AND (ce.PaymentId IS NULL OR ce.PaymentId = 0)
		AND ce.IsDeleted = 0
	
	--Apply Tax
	UPDATE #tmpMonthlyRunLedger
	SET IsTaxable = CASE WHEN (t.PaymentAmount * 12) < ta.Amount THEN 0 ELSE 1 END
	FROM #tmpMonthlyRunLedger t
	INNER JOIN pension.TaxableAmount ta ON t.Age >= ta.AgeFrom
	AND (t.Age < ta.AgeTo OR ta.AgeTo IS NULL)
	WHERE ta.TaxYearId = @taxYearId
	AND ta.IsDeleted = 0
	AND t.PaymentTypeId = 7

	UPDATE #tmpMonthlyRunLedger
	SET PAYE =  ((r.StandardTaxRate + ((t.AnnualIncome - r.StandardTaxRate) * r.TaxPercentageRate/100)) - ISNULL((SELECT CASE WHEN (t.Age >= 1 AND t.Age < 65) THEN tr.[Primary]
																													  WHEN (t.Age >= 65 AND t.Age < 75) THEN tr.[Secondary]
																													  WHEN (t.Age >= 75) THEN tr.Tertiary
																												 END
																											FROM pension.TaxRebate tr
																											INNER JOIN pension.TaxYear y ON y.[Year] = tr.[Year]
																												AND y.Id = @taxYearId
																												), 0))/12
	FROM #tmpMonthlyRunLedger t
	INNER JOIN pension.TaxRate r ON  t.AnnualIncome >= r.FromIncome
		AND t.AnnualIncome <= r.ToIncome
	WHERE IsTaxable = 1
	AND r.TaxRateYearId = @taxYearId
	AND t.PaymentTypeId = 7
	AND t.PensionIncreaseId IS NULL
	

	SELECT @PensionIncreseId = i.Id, 
	       @IncreaseAmount = i.Amount, 
		   @IncreasePercentage = i.Percentage, 
		   @PensionIncreaseAmountTypeId = i.PensionIncreaseAmountType
		FROM pension.PensionIncrease i
		WHERE i.IncreaseType = 1
			AND i.EffectiveDate = @monthEndRunMonth
			AND i.IsDeleted = 0
			AND i.PensionIncreaseStatusId = 3 -- Scheduled

	IF @@ROWCOUNT > 0 --bonus payment month
	BEGIN
		
		INSERT INTO #tmpMonthlyRunLedger(PensionLedgerId, PaymentTypeId, PaymentAmount, PAYE, AdditionalTax, BeneficiaryId, PensionLedgerPaymentStatusId, Age, PensionIncreaseId, IsTaxable, RolePlayerBankingId)
		SELECT PensionLedgerId,PaymentTypeId, CASE @PensionIncreaseAmountTypeId WHEN 1 THEN @IncreaseAmount
																				WHEN 2 THEN (PaymentAmount * @IncreasePercentage)/100
												  ELSE 0
											   END,
				0, 0, BeneficiaryId, PensionLedgerPaymentStatusId, Age, @PensionIncreseId, 1, RolePlayerBankingId
		FROM #tmpMonthlyRunLedger

		INSERT INTO #tmpBonusPayLedger
		SELECT PensionLedgerId, SUM(AnnualIncome)
		FROM #tmpMonthlyRunLedger
		WHERE PaymentTypeId = 7
		GROUP BY PensionLedgerId


		UPDATE #tmpMonthlyRunLedger
		SET IsTaxable = CASE WHEN bp.TotalAnnualIncome < ta.Amount THEN 0 ELSE 1 END
		FROM #tmpMonthlyRunLedger l
		INNER JOIN #tmpBonusPayLedger bp ON bp.PensionLedgerId = l.PensionLedgerId
			AND l.PensionIncreaseId IS NOT NULL
			AND l.PaymentTypeId = 7
		INNER JOIN pension.TaxableAmount ta ON l.Age >= ta.AgeFrom
			AND (l.Age < ta.AgeTo OR ta.AgeTo IS NULL)
			AND ta.IsDeleted = 0


		UPDATE #tmpMonthlyRunLedger
		SET PAYE =  ((r.StandardTaxRate + ((bp.TotalAnnualIncome - r.StandardTaxRate) * r.TaxPercentageRate/100)) - ISNULL((SELECT CASE WHEN (t.Age >= 1 AND t.Age < 65) THEN tr.[Primary]
																														  WHEN (t.Age >= 65 AND t.Age < 75) THEN tr.[Secondary]
																														  WHEN (t.Age >= 75) THEN tr.Tertiary
																													 END
																												FROM pension.TaxRebate tr
																												INNER JOIN pension.TaxYear y ON y.[Year] = tr.[Year]
																													AND y.Id = @taxYearId
																													), 0))/12
		FROM #tmpBonusPayLedger bp
		INNER JOIN #tmpMonthlyRunLedger t ON t.PensionLedgerId = bp.PensionLedgerId
		INNER JOIN pension.TaxRate r ON  bp.TotalAnnualIncome >= r.FromIncome
			AND bp.TotalAnnualIncome  <= r.ToIncome
		WHERE 
		r.TaxRateYearId = @taxYearId
		AND t.PensionIncreaseId IS NOT NULL
		AND t.PaymentTypeId = 7
		AND t.IsTaxable = 1

		UPDATE [b]
		SET PAYE = b.PAYE - r.PAYE
		FROM #tmpMonthlyRunLedger r
		INNER JOIN #tmpMonthlyRunLedger b ON b.PensionLedgerId = r.PensionLedgerId
			AND b.PaymentTypeId = r.PaymentTypeId
		WHERE r.PensionIncreaseId IS NULL
		AND b.PensionIncreaseId IS NOT NULL
		AND r.PaymentTypeId = 7

	END
	

	/****
	* Insert data
	********************************/
	BEGIN TRY
		IF(@writeData = 1)
		BEGIN
			BEGIN TRAN 
				DECLARE @monthlyPension TABLE(Id INT)
				DECLARE @monthlyPensionLedgers TABLE(Id INT)
				DECLARE @userEmail VARCHAR(50)

				SELECT @userEmail = Email
				FROM [security].[User]
				WHERE Id = @userId

				INSERT INTO [pension].[MonthlyPensionV2](MonthEndRunDateId, Amount, ReleasedAmount, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
				OUTPUT INSERTED.MonthlyPensionId INTO @monthlyPension
				SELECT @monthEndRunDateId, (SELECT SUM(PaymentAmount) FROM #tmpMonthlyRunLedger), 0, 0, @userEmail, GETDATE(), @userEmail, GETDATE()

				INSERT INTO [pension].[MonthlyPensionLedgerV2](MonthlyPensionId,PensionLedgerId, PaymentTypeId, PaymentItemId, Amount, PAYE, AdditionalTax, BeneficiaryId,
															   PensionIncreaseId, PensionLedgerPaymentStatusId, RolePlayerBankingId, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
				SELECT mp.Id, mrl.PensionLedgerId, mrl.PaymentTypeId, mrl.PaymentItemId, mrl.PaymentAmount, mrl.PAYE, mrl.AdditionalTax, mrl.BeneficiaryId,
					   mrl.PensionIncreaseId, mrl.PensionLedgerPaymentStatusId, mrl.RolePlayerBankingId, 0, @userEmail, GETDATE(), @userEmail, GETDATE()
				FROM #tmpMonthlyRunLedger mrl
				CROSS JOIN @monthlyPension mp

				INSERT INTO [pension].[LedgerRecoveryPayment](LedgerRecoveryId, AmountRecovered, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
				SELECT mrl.LedgerRecoveryId, mrl.AmountRecovered, 0, @userEmail, GETDATE(), @userEmail, GETDATE()
				FROM #tmpMonthlyRunLedger mrl
				WHERE mrl.LedgerRecoveryId IS NOT NULL

				UPDATE [pension].[CorrectiveEntry]
				SET AddedToMonthlyPension = 1,
					ModifiedBy = @userEmail,
					ModifiedDate = GETDATE()
				FROM [pension].[CorrectiveEntry] ce
				INNER JOIN #tmpMonthlyRunLedger mrl ON mrl.PaymentItemId = ce.CorrectiveEntryId
					AND mrl.PaymentTypeId = 11 
			COMMIT TRAN
		END
	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0
			ROLLBACK TRAN;


		DECLARE @err_severity INT
		,@err_new_state INT
		,@err_number INT
		,@err_line INT
		,@err_procedure NVARCHAR(126)
		,@err_message NVARCHAR(4000);

	SELECT @err_severity = error_severity()
		,@err_new_state = error_state() + 1
		,@err_number = error_number()
		,@err_line = error_line()
		,@err_procedure = error_procedure()
		,@err_message = error_message();

	RAISERROR (
			'SQL error %d occured in line %d of procedure %s: %s'
			,@err_severity
			,@err_new_state
			,@err_number
			,@err_line
			,@err_procedure
			,@err_message
			);
	END CATCH

	IF(@writeData = 0)
	BEGIN
		SELECT PensionLedgerId, PaymentTypeId, PaymentAmount [Amount], PAYE, AdditionalTax, BeneficiaryId, PensionIncreaseId, NULL [MonthEndReleaseId], PensionLedgerPaymentStatusId,
			   AmountRecovered, LedgerRecoveryId, PaymentItemId, RolePlayerBankingId
		FROM #tmpMonthlyRunLedger
		ORDER BY PensionLedgerId
	END
	
	DROP TABLE #tmpMonthlyRunLedger
	DROP TABLE #tmpBonusPayLedger
END
GO