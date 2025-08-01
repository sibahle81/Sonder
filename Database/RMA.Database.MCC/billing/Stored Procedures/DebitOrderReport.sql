CREATE PROCEDURE [billing].[DebitOrderReport]
	@periodYear nvarchar(250) = NULL,
	@periodMonth nvarchar(250) = NULL,
	@startDate nvarchar(250) = NULL,
	@endDate nvarchar(250) = NULL,
	@IndustryId int = 0,
	@ProductId int = 0,
	@DebitOrderTypeId int = 0,
	@RMABankAccount nvarchar(250) = NULL
AS BEGIN

	DECLARE
		--@periodYear nvarchar(250) = NULL,
		--@periodMonth nvarchar(250) = NULL,
		--@startDate nvarchar(250) = '2023-01-01',
		--@endDate nvarchar(250) = '2024-12-30',
		--@IndustryId int = 0,
		--@ProductId int = 0,
		--@DebitOrderTypeId int = 3,
		--@RMABankAccount nvarchar(250) ='0',
		@eofmonthday int,
		@maxreginstallment int,
		@enddateday int

		IF @startDate = '-1' begin set @startDate = NULL end
		IF @endDate = '-1' begin set @endDate = NULL end

		if @startDate is null begin
			set @startDate = datefromparts(@periodYear, @periodMonth, 1)
		end
		if @endDate is null begin
			set @endDate = EOMONTH(@startDate)
		end

		set @eofmonthday = DAY(EOMONTH(@endDate))
		set @maxreginstallment =(select max(RegularInstallmentDayOfMonth) from policy.policy)
		set @enddateday=day(@endDate)

		IF @eofmonthday=@enddateday BEGIN
			 IF (@enddateday = @maxreginstallment
					or @enddateday = @maxreginstallment -1
					or @enddateday = @maxreginstallment -2
					or @enddateday = @maxreginstallment -3)
			begin
				set @enddateday = @maxreginstallment
			end else begin
				set @enddateday = @enddateday
			end
		END

		IF @periodMonth = 0 or @periodMonth = -1 begin set @periodMonth = NULL end
		IF @periodYear = 1970 or @periodYear = -1 begin set @periodYear = NULL end
		IF @IndustryId = 0 begin set @IndustryId = NULL end
		IF @ProductId = 0 begin set @ProductId = NULL end
		IF @DebitOrderTypeId = 0 begin set @DebitOrderTypeId = NULL end
		IF @RMABankAccount = '0' begin set @RMABankAccount = NULL end

		DECLARE @SearchTable TABLE (
			ControlNumber VARCHAR(250),
			ControlName VARCHAR(250),
			[Year] INT,
			Period INT,
			DebitOrderDay int,
			AccountNumber VARCHAR(250),
			DebtorName VARCHAR(250),
			InvoiceId INT,
			InvoiceNumber VARCHAR(250),
			PolicyId INT,
			PolicyNumber VARCHAR(250),
			DebitOrdeAmount Decimal(18,2),
			ClientBankAccountNumber VARCHAR(250),
			BankAccountType VARCHAR(250),
			BranchCode VARCHAR(20),
			BankAccountNumber VARCHAR(250),
			ActionDate Date,
			[Message] VARCHAR(250),
			RMACode VARCHAR(20),
			RMAMessage VARCHAR(250),
			HyphenDate Date,
			HyphenErrorCode VARCHAR(20),
			HyphenErrorMessage VARCHAR(250),
			BankDate Date,
			BankErrorCode VARCHAR(20),
			BankErrorMessage VARCHAR(250),
			AccountHolder VARCHAR(250),
			CollectionStatus VARCHAR(250),
			DecemberDebitDay INT,
			MissedPayments INT,
			Balance Decimal(18,2)
		);

	 If @DebitOrderTypeId = 1 --Normal Debit order
	 BEGIN
		INSERT INTO @SearchTable
			 SELECT DISTINCT
			 CASE WHEN (CBA.AccountNumber = '62679223942' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
			 WHEN (CBA.AccountNumber = '50510037788' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1)
			 WHEN (CBA.AccountNumber = '62684073142' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2)
			 WHEN (CBA.AccountNumber = '62775460646' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4)
			 WHEN (CBA.AccountNumber = '62512854169') THEN --Metal
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID METALS')
			 WHEN (CBA.AccountNumber = '50512338895') THEN --Mining
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID MINING')
			 END AS ControlNumber
			 , CASE WHEN (CBA.AccountNumber = '62679223942' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
			 WHEN (CBA.AccountNumber = '50510037788' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1)
			 WHEN (CBA.AccountNumber = '62684073142' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2)
			 WHEN (CBA.AccountNumber = '62775460646' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4)
			 WHEN (CBA.AccountNumber = '62512854169') THEN --Metal
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID METALS')
			 WHEN (CBA.AccountNumber = '50512338895') THEN --Mining
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID MINING')
			 END AS ControlName
			 ,ISNULL(YEAR(@startDate), LEFT(@periodYear, 4))
			 ,ISNULL(MONTH(@startDate), LEFT(@periodMonth, 2))
			 ,(YEAR(@startDate) * 10000) + (MONTH(@startDate) * 100)
			 + (CASE WHEN P.RegularInstallmentDayOfMonth > @eofmonthday THEN @eofmonthday ELSE P.RegularInstallmentDayOfMonth END)
			 ,F.FinPayeNumber
			 ,R.DisplayName
			 ,0
			 ,''
			 ,P.PolicyId
			 ,P.PolicyNumber
			 ,P.InstallmentPremium
			 ,RB.AccountNumber
			 ,BT.Name
			 ,RB.BranchCode
			 ,CBA.AccountNumber
			 ,null
			 ,null
			 ,null
			 ,null
			 ,null
			 ,null
			 ,null
			 ,null
			 ,null
			 ,null
			 ,RB.AccountHolderName
			 ,'Future'
			 ,null --P.DecemberInstallmentDayOfMonth AS DecemberDebitDay
			 ,0
			 ,0 --bta.Balance select *
			 FROM [policy].[Policy] P
				 INNER JOIN [policy].[PolicyStatusActionsMatrix] psam on psam.PolicyStatus = p.PolicyStatusId
				 INNER JOIN [client].[FinPayee] F ON P.PolicyOwnerId = F.RolePlayerId
				 INNER JOIN [client].[RolePlayer] R ON R.RolePlayerId = F.RolePlayerId
				 INNER JOIN [client].[RolePlayerBankingDetails] RB ON R.RolePlayerId = RB.RolePlayerId
				 INNER JOIN [common].[BankAccountType] BT ON RB.BankAccountTypeId = BT.Id
				 INNER JOIN [common].[Industry] IC ON IC.Id = F.IndustryId
				 INNER JOIN [common].[IndustryClass] ICD ON ICD.Id = IC.IndustryClassId
				 INNER JOIN [product].ProductOption ppo (NOLOCK) on p.ProductOptionId = ppo.Id
				 LEFT JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id
				 INNER JOIN [product].ProductBankAccount PPBA ON ICD.Id = PPBA.IndustryClassId AND PPBA.ProductId = prod.Id
				 INNER JOIN [common].[BankAccount] CBA ON PPBA.BankAccountId = CBA.Id
			 where P.InstallmentPremium > 0
				AND P.IsDeleted = 0
				AND RB.RolePlayerBankingId = (SELECT TOP 1 RB2.RolePlayerBankingId FROM [client].[RolePlayerBankingDetails] RB2 WHERE RB2.RolePlayerId = RB.RolePlayerId ORDER BY RB2.EffectiveDate DESC)
				AND P.PaymentMethodId = 11
				AND (P.ParentPolicyId is null or P.ParentPolicyId = 805884)
				AND psam.DoRaiseInstallementPremiums = 1
				AND (P.RegularInstallmentDayOfMonth BETWEEN (SELECT DAY(@startDate)) AND (@enddateday) OR (@startDate is NULL and @endDate is NULL))
				AND (P.PolicyInceptionDate <= @startDate OR (@startDate is NULL))
				AND (CBA.AccountNumber = @RMABankAccount OR @RMABankAccount IS NULL)
				AND EXISTS (SELECT ind.[Id]
							FROM [common].[Industry] ind, [common].[IndustryClass] ic
							-- WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id])
							WHERE ic.[Id] = iif(p.ProductOptionId = 339, 5, ISNULL(@IndustryId, ic.[Id]))
							AND ind.[IndustryClassId] = ic.[Id]
							AND ind.[Id] = ISNULL(f.IndustryId, ind.[Id])
				)
				AND (prod.[Id] = @ProductId OR @ProductId IS NULL)
				AND NOT EXISTS (SELECT s.PolicyId FROM @SearchTable s WHERE s.PolicyId = P.PolicyId)
	END

	 IF @DebitOrderTypeId = 2 --Adhoc Debit order
	 BEGIN
		 INSERT INTO @SearchTable
			 SELECT DISTINCT
			 CASE WHEN (CBA.AccountNumber = '62679223942' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
			 WHEN (CBA.AccountNumber = '50510037788' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1)
			 WHEN (CBA.AccountNumber = '62684073142' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2)
			 WHEN (CBA.AccountNumber = '62775460646' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4)
			 WHEN (CBA.AccountNumber = '62512854169') THEN --Metal
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID METALS')
			 WHEN (CBA.AccountNumber = '50512338895') THEN --Mining
			 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID MINING')
			 END AS ControlNumber
			 , CASE WHEN (CBA.AccountNumber = '62679223942' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
			 WHEN (CBA.AccountNumber = '50510037788' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1)
			 WHEN (CBA.AccountNumber = '62684073142' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2)
			 WHEN (CBA.AccountNumber = '62775460646' and prod.Id in (1,2)) THEN
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4)
			 WHEN (CBA.AccountNumber = '62512854169') THEN --Metal
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID METALS')
			 WHEN (CBA.AccountNumber = '50512338895') THEN --Mining
			 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID MINING')
			 END AS ControlName,
			 YEAR(A.DateToPay)
			 ,MONTH(A.DateToPay)
			 ,(YEAR(A.DateToPay) * 10000) + (MONTH(A.DateToPay) * 100) + (DAY(A.DateToPay) * 1)
			 ,F.FinPayeNumber
			 ,R.DisplayName
			 ,0
			 ,''
			 ,0
			 ,''
			 ,A.Amount
			 ,RB.AccountNumber
			 ,BT.Name
			 ,RB.BranchCode
			 ,CBA.AccountNumber
			 ,A.DateToPay
			 ,''
			 ,''
			 ,''
			 ,null
			 ,''
			 ,''
			 ,null
			 ,C.ErrorCode
			 ,C.ErrorDescription
			 ,RB.AccountHolderName
			 ,COLS.Name CollectionStatus
			 ,null --P.DecemberInstallmentDayOfMonth AS DecemberDebitDay
			 ,0
			 ,0
			 FROM [billing].[AdhocPaymentInstructions] A
			 INNER JOIN [client].[FinPayee] F ON A.RolePlayerId = F.RolePlayerId
			 INNER JOIN [client].[RolePlayer] R ON R.RolePlayerId = F.RolePlayerId
			 INNER JOIN [client].[RolePlayerBankingDetails] RB ON R.RolePlayerId = RB.RolePlayerId
			 INNER JOIN [common].[BankAccountType] BT ON RB.BankAccountTypeId = BT.Id
			 INNER JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
			 INNER JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
			 INNER JOIN [policy].[policy] p (NOLOCK) on r.[RolePlayerId] = p.[PolicyOwnerId]
			 INNER JOIN [product].ProductOption ppo (NOLOCK) on p.ProductOptionId = ppo.Id
			 INNER JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id
			 INNER JOIN [product].ProductBankAccount PPBA ON ICD.Id =PPBA.IndustryClassId AND prod.Id =PPBA.ProductId
			 INNER JOIN [common].[BankAccount] CBA ON PPBA.BankAccountId = CBA.Id
			 LEFT JOIN [billing].[Collections] C ON C.AdhocPaymentInstructionId = A.AdhocPaymentInstructionId
			 LEFT JOIN [common].[CollectionStatus] COLS ON C.CollectionStatusId = COLS.Id
			 LEFT JOIN billing.TermArrangement bta on bta.Roleplayerid = F.Roleplayerid
			 WHERE (P.PaymentMethodId = 11 or bta.PaymentMethodId = 11) and P.ParentPolicyId is null and RB.RolePlayerBankingId =
			 (SELECT TOP 1 RB2.RolePlayerBankingId FROM [client].[RolePlayerBankingDetails] RB2 WHERE RB2.RolePlayerId = RB.RolePlayerId ORDER BY RB2.EffectiveDate DESC)
			 --AND NOT EXISTS (SELECT AdhocPaymentInstructionId FROM [billing].[Collections] WHERE AdhocPaymentInstructionId = A.AdhocPaymentInstructionId)
			 AND (MONTH(A.DateToPay) = @periodMonth AND YEAR(A.DateToPay) = @periodYear OR (@periodMonth is NULL and @periodYear is NULL))
			 AND (A.DateToPay BETWEEN @startDate AND @endDate OR (@startDate is NULL and @endDate is NULL))
			 AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
			 WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
			 AND ind.[Id] = ISNULL(f.IndustryId, ind.[Id]))
			 AND (prod.[Id] = @ProductId OR @ProductId IS NULL)
			 AND (CBA.AccountNumber = @RMABankAccount OR @RMABankAccount IS NULL)
	 END

	 IF @DebitOrderTypeId = 3 --Term Debit order
	 BEGIN

		 ------Number of Missedpayments----
		 IF OBJECT_ID(N'tempdb..#tempMissedpayments', N'U') IS NOT NULL
		 DROP TABLE #tempMissedpayments;

		 select [TermArrangementId],
		 sum(case when (DATEADD(day,7, [PaymentDate]) < @StartDate or DATEADD(day,7, [PaymentDate]) between @StartDate and @EndDate) and TermArrangementScheduleStatusId not in (3,1)
		 then 1 else 0 end) as [numberofpaymentsmissed]


		 into #tempMissedpayments
		 from [billing].[TermArrangementSchedule] (nolock)
		 where IsDeleted =0
		 group by [TermArrangementId]


		 INSERT INTO @SearchTable
		 SELECT DISTINCT
		 CASE WHEN (CBA.AccountNumber = '62679223942' and prod.Id in (1,2)) THEN
		 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
		 WHEN (CBA.AccountNumber = '50510037788' and prod.Id in (1,2)) THEN
		 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1)
		 WHEN (CBA.AccountNumber = '62684073142' and prod.Id in (1,2)) THEN
		 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2)
		 WHEN (CBA.AccountNumber = '62775460646' and prod.Id in (1,2)) THEN
		 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4)
		 WHEN (CBA.AccountNumber = '62512854169') THEN --Metal
		 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID METALS')
		 WHEN (CBA.AccountNumber = '50512338895') THEN --Mining
		 (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID MINING')
		 END AS ControlNumber
		 , CASE WHEN (CBA.AccountNumber = '62679223942' and prod.Id in (1,2)) THEN
		 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
		 WHEN (CBA.AccountNumber = '50510037788' and prod.Id in (1,2)) THEN
		 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1)
		 WHEN (CBA.AccountNumber = '62684073142' and prod.Id in (1,2)) THEN
		 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2)
		 WHEN (CBA.AccountNumber = '62775460646' and prod.Id in (1,2)) THEN
		 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4)
		 WHEN (CBA.AccountNumber = '62512854169') THEN --Metal
		 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID METALS')
		 WHEN (CBA.AccountNumber = '50512338895') THEN --Mining
		 (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE Origin = 'RMA COID MINING')
		 END AS ControlName,
		 YEAR(bts.PaymentDate)
		 ,MONTH(bts.PaymentDate)
		 ,(YEAR(bts.PaymentDate) * 10000) + (MONTH(bts.PaymentDate) * 100) + (DAY(bts.PaymentDate) * 1)
		 ,F.FinPayeNumber
		 ,R.DisplayName
		 ,0
		 ,''
		 ,0
		 ,''
		 ,bts.Amount
		 ,A.AccountNumber
		 ,BT.Name
		 ,A.BranchCode
		 ,CBA.AccountNumber
		 ,bts.PaymentDate
		 ,''
		 ,''
		 ,''
		 ,null
		 ,''
		 ,''
		 ,null
		 ,C.ErrorCode
		 ,C.ErrorDescription
		 ,A.AccountHolderName
		 ,COLS.Name CollectionStatus
		 ,null --P.DecemberInstallmentDayOfMonth AS DecemberDebitDay
		 ,case when bts.PaymentDate <= getdate() then isnull(tmp.[numberofpaymentsmissed],0) else 0 end
		 ,0 --select *

		 FROM [billing].[TermDebitOrderRolePlayerBankingDetail] btdor
		 INNER JOIN [client].[RolePlayerBankingDetails] A on A.RolePlayerBankingId =btdor.RolePlayerBankingId
		 INNER JOIN [billing].TermArrangement bta on btdor.TermArrangementId = bta.TermArrangementId
		 INNER JOIN [billing].[TermArrangementSchedule] bts on btdor.termArrangementId = bts.TermArrangementId
		 INNER JOIN [client].[FinPayee] F ON bta.RolePlayerId = F.RolePlayerId
		 INNER JOIN [client].[RolePlayer] R ON R.RolePlayerId = F.RolePlayerId
		 INNER JOIN [common].[BankAccountType] BT ON A.BankAccountTypeId = BT.Id
		 INNER JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
		 INNER JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
		 INNER JOIN [policy].[policy] p (NOLOCK) on r.[RolePlayerId] = p.[PolicyOwnerId]
		 INNER JOIN [product].ProductOption ppo (NOLOCK) on p.ProductOptionId = ppo.Id
		 INNER JOIN product.Product prod ON ppo.ProductId = prod.Id
		 INNER JOIN [product].ProductBankAccount PPBA ON ICD.Id =PPBA.IndustryClassId AND prod.Id =PPBA.ProductId
		 INNER JOIN [common].[BankAccount] CBA ON PPBA.BankAccountId = CBA.Id
		 LEFT JOIN [billing].[Collections] C ON C.TermArrangementScheduleId = bts.TermArrangementScheduleId
		 LEFT JOIN [common].[CollectionStatus] COLS ON C.CollectionStatusId = COLS.Id
		 LEFT JOIN #tempMissedpayments tmp on bta.TermArrangementId = tmp.TermArrangementId
		 Where bta.paymentMethodId = 11
		 AND (MONTH(bts.PaymentDate) = @periodMonth AND YEAR(bts.PaymentDate) = @periodYear OR (@periodMonth is NULL and @periodYear is NULL))
		 AND (bts.PaymentDate BETWEEN @startDate AND @endDate OR (@startDate is NULL and @endDate is NULL))
		 AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
		 WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
		 AND ind.[Id] = ISNULL(f.IndustryId, ind.[Id]))
		 AND (prod.[Id] = @ProductId OR @ProductId IS NULL)
		 AND (CBA.AccountNumber = @RMABankAccount OR @RMABankAccount IS NULL)
		 AND bta.isActive = 1
		 AND bta.IsDeleted = 0
		 AND bts.[IsCollectionDisabled] = 0
	 END

	 SELECT DISTINCT ControlNumber,
		 ControlName,
		 [Year],
		 Period,
		 DebitOrderDay,
		 AccountNumber,
		 DebtorName,
		 InvoiceId,
		 InvoiceNumber,
		 PolicyId,
		 PolicyNumber,
		 DebitOrdeAmount,
		 ClientBankAccountNumber,
		 BankAccountType,
		 BranchCode,
		 BankAccountNumber,
		 ActionDate,
		 [Message],
		 RMACode,
		 RMAMessage,
		 HyphenDate,
		 HyphenErrorCode,
		 HyphenErrorMessage,
		 BankDate,
		 BankErrorCode,
		 BankErrorMessage,
		 AccountHolder,
		 CollectionStatus,
		 DecemberDebitDay,
		 MissedPayments,
		 Balance
	 FROM @SearchTable
	 order by 5 desc

END
