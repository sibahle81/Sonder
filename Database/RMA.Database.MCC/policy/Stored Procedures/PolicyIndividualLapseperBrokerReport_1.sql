
---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/01/25
---- EXEC [policy].[PolicyIndividualLapseperBrokerReport] '2021-07-01', '2021-08-03'
---- =============================================
CREATE   PROCEDURE [policy].[PolicyIndividualLapseperBrokerReport]
	@StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL

AS
BEGIN

		IF OBJECT_ID(N'tempdb..#TempInvoice', N'U') IS NOT NULL
			DROP TABLE #TempInvoice;

		SELECT DISTINCT
			 FIRST_VALUE([InvoiceId]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate] DESC) AS [InvoiceId],
			 FIRST_VALUE([CollectionDate]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate]  DESC) AS [CollectionDate],
			 FIRST_VALUE([InvoiceDate]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate]  DESC) AS [InvoiceDate],
			 FIRST_VALUE([PolicyId]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate] DESC) AS [PolicyId]

	    INTO #TempInvoice
		FROM [billing].[Invoice] (NOLOCK)

		IF OBJECT_ID(N'tempdb..#TempFinal', N'U') IS NOT NULL
			DROP TABLE #TempFinal;

		SELECT DISTINCT  
				p.PolicyNumber [PolicyNumber],  
				bs.TransactionDate [Transaction Date],
				parp.DisplayName AS [Schemename],
				br.[Name] [BrokerName],
				rp.DisplayName [Debtor], 
				cpn.[FirstName] [Name],
				cpn.[SurName],
				cpn.[IdNumber],
				--pm.[Name] [PaymentMethod],
				--cpfr.[Name] [PremiumFrequency],
				cps.[Name] [Status],
				p.[InstallmentPremium] [CurrentPremium],
				p.[CancellationDate] [DateCancelled],
				cpcr.[Name] [CancelReason],
				cpn.[DateOfDeath] [DeathDate],
				bi.[CollectionDate] DebitDate,
				(select top 1 ucd.[Description] from billing.UnpaidCodeDescriptions ucd where bs.UserReference like '% ' + ucd.Code + ' %') AS [DebitOrderRejectionReason],
				CASE WHEN bs.DebitCredit = '-' THEN (-1 * CONVERT(DECIMAL(18,2),( CONVERT(DECIMAL(18,2),bs.NettAmount)/100))) ELSE CONVERT(DECIMAL(18,2),( CONVERT(DECIMAL(18,2),bs.NettAmount)/100)) END [Amount],
				(SELECT CONCAT(bs.StatementNumber, '/', bs.StatementLineNumber, ' ', (SELECT FORMAT (bs.StatementDate, 'dd/MM/yyyy')))) [Bank Reference], 
				SUBSTRING(bs.BankAccountNumber, 6, len(bs.BankAccountNumber)-5) [Account Number], 
				r.FirstName + ' ' + r.SurnameOrCompanyName [Representative], r.FirstName + ' ' + r.SurnameOrCompanyName [Juristic Representative]
		INTO #TempFinal
		FROM [finance].[BankStatementEntry] bs
		LEFT OUTER JOIN [finance].[BankStatementEntry] bs2 ON bs2.[RequisitionNumber ] = bs.[RequisitionNumber ]
		LEFT OUTER JOIN [billing].[Transactions] t1 ON t1.BankStatementEntryId = bs.BankStatementEntryId
		LEFT OUTER JOIN [policy].[Policy] p ON (p.PolicyNumber = substring(bs.UserReference,CHARINDEX('-',bs.UserReference,1) -2,16)
												OR p.PolicyNumber = substring(bs.UserReference,CHARINDEX('-',bs.UserReference,1) +1,16))
		LEFT OUTER JOIN [billing].[Transactions] t2 ON t2.TransactionId = t1.LinkedTransactionId
		--LEFT OUTER JOIN [billing].[InvoiceAllocation] ia ON ia.TransactionId = t2.TransactionId
		--LEFT OUTER JOIN [billing].[Invoice] i ON i.InvoiceId = ia.InvoiceId
		--LEFT OUTER JOIN [billing].[Collections] c ON c.InvoiceId = i.InvoiceId
		outer apply (select top 1 * from policy.PolicyBroker pb where pb.PolicyId = p.PolicyId
		and pb.EffectiveDate < (select getdate()) order by pb.EffectiveDate desc) pb
		LEFT OUTER JOIN  broker.Brokerage br on br.Id = pb.BrokerageId
		LEFT OUTER JOIN  broker.Representative r on r.Id = pb.RepId
		LEFT OUTER JOIN  broker.Representative jr on jr.Id = pb.JuristicRepId
		LEFT JOIN [common].[PolicyCancelReason] cpcr ON p.[PolicyCancelReasonId] = cpcr.[Id] 
		LEFT JOIN [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
		LEFT JOIN [client].[roleplayer] paRp on paRp.RolePlayerId = paPol.policyOwnerId
		left join [client].[RolePlayer] rp on rp.[RolePlayerId] = p.[PolicyOwnerId]
		LEFT JOIN [Client].[Person] cpn ON  rp.[RolePlayerId] = cpn.[RolePlayerId]
		LEFT JOIN #TempInvoice bi on ISNULL(p.ParentPolicyId,p.[PolicyId]) =bi.[PolicyId]
		LEFT JOIN [common].[PolicyStatus] cps ON p.[PolicyStatusId] = cps.[Id]

		WHERE  bs.DebitCredit = '-'
		AND  ISNULL(bs2.DebitCredit, '+') = '+'
		AND ISNULL(bs2.NettAmount, bs.NettAmount) = bs.NettAmount
		AND ISNULL(t1.TransactionTypeId, 1) = 1 -- payment reversal
		AND ISNULL (t2.TransactionTypeId, 3) = 3 -- payment
		AND bs.TransactionDate BETWEEN @StartDate and @EndDate

		Select *
		from #TempFinal
		where [PolicyNumber] is not null
 
END