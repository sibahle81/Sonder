CREATE PROCEDURE [policy].[CommissionWithholdingPaymentExport]
	@period VARCHAR(6),
	@BrokerageIds VARCHAR(MAX)
AS
BEGIN

	SET NOCOUNT ON;

	DECLARE @query VARCHAR(MAX)

	SET @query = '	DECLARE @periods VARCHAR(MAX)
					SET @periods = FORMAT(DATEADD(M, -12, GETDATE()), ''MMyyyy'') +'','' + FORMAT(DATEADD(M, -11, GETDATE()), ''MMyyyy'') + '','' + FORMAT(DATEADD(M, -10, GETDATE()), ''MMyyyy'') + '','' + FORMAT(DATEADD(M, -9, GETDATE()), ''MMyyyy'') + '','' + FORMAT(DATEADD(M, -8, GETDATE()), ''MMyyyy'') + '','' + FORMAT(DATEADD(M, -7, GETDATE()), ''MMyyyy'') + '','' + FORMAT(DATEADD(M, -6, GETDATE()), ''MMyyyy'') + '','' + FORMAT(DATEADD(M, -5, GETDATE()), ''MMyyyy'') + '','' + FORMAT(DATEADD(M, -4, GETDATE()), ''MMyyyy'') + '','' + FORMAT(DATEADD(M, -3, GETDATE()), ''MMyyyy'') + '','' + FORMAT(DATEADD(M, -2, GETDATE()), ''MMyyyy'') + '','' + FORMAT(DATEADD(M, -1, GETDATE()), ''MMyyyy'') + '','' + FORMAT(GETDATE(), ''MMyyyy'')

					SELECT
						''250655'' AS FromBankBranchCode
					   ,''62679224552'' AS FromBankAccountNumber
					   ,RIGHT(''000000'' + CAST(ROW_NUMBER() OVER (ORDER BY b.Id) AS VARCHAR(6)), 6) AS SequenceNumber
					   ,b2.UniversalBranchCode AS ToBankBranchCode
					   ,ba.AccountNumber AS ToBankAccountNumber
					   ,ISNULL(bat.Id, 1) AS AccountType
					   ,CAST(SUM(cw.WithholdingAmount) AS DECIMAL(18, 2)) AS Amount
					   ,''RET - '' + b1.Code AS TransactionReference
					   ,ba.AccountHolderName AS BrokerAccountName
					FROM Policy.CommissionHeader ch WITH (NOLOCK)
					INNER JOIN Policy.CommissionSummary cs WITH (NOLOCK)
						ON ch.Id = cs.CommissionHeaderId
							AND ch.IsActive = 1
							AND ch.IsDeleted = 0
							AND cs.IsActive = 1
							AND cs.IsDeleted = 0
					INNER JOIN Policy.CommissionDetail cd WITH (NOLOCK)
						ON cs.Id = cd.CommissionSummaryId
							AND cs.IsActive = 1
							AND cs.IsDeleted = 0
							AND cd.IsActive = 1
							AND cd.IsDeleted = 0
					INNER JOIN Policy.CommissionWithholding cw WITH (NOLOCK)
						ON cw.CommissionDetailId = cd.Id
							AND cd.IsActive = 1
							AND cd.IsDeleted = 0
							AND cw.IsActive = 1
							AND cw.IsDeleted = 0
					INNER JOIN Client.Broker b WITH (NOLOCK)
						ON cd.BrokerId = b.Id
							AND cd.IsActive = 1
							AND cd.IsDeleted = 0
							AND b.IsActive = 1
							AND b.IsDeleted = 0
					INNER JOIN Client.Brokerage b1 WITH (NOLOCK)
						ON cs.BrokerageId = b1.Id
							AND cs.IsActive = 1
							AND cs.IsDeleted = 0
							AND b1.IsActive = 1
							AND b1.IsDeleted = 0
					INNER JOIN Client.BankAccount ba WITH (NOLOCK)
						ON b1.BankAccountId = ba.Id
							AND b1.IsActive = 1
							AND b1.IsDeleted = 0
							AND ba.IsActive = 1
							AND ba.IsDeleted = 0
					INNER JOIN [AZU-MOD-CFG].common.Bank b2 WITH (NOLOCK)
						ON ba.BankId = b2.Id
							AND ba.IsActive = 1
							AND ba.IsDeleted = 0
							AND b2.IsActive = 1
							AND b2.IsDeleted = 0
					LEFT OUTER JOIN [AZU-MOD-CFG].common.BankAccountType bat WITH (NOLOCK)
						ON ba.AccountTypeId = bat.Id
							AND ba.IsActive = 1
							AND ba.IsDeleted = 0
							AND bat.IsActive = 1
							AND bat.IsDeleted = 0
					WHERE cw.PaidDate IS NULL
					AND CAST(ch.Period AS INT) IN (SELECT * FROM STRING_SPLIT(@periods, '',''))'
					
	IF ISNULL(@BrokerageIds, '') <> ''
	BEGIN
		SET @query = @query + ' AND b1.Id IN(' + @BrokerageIds + ')'
	END
		
		SET @query = @query + ' GROUP BY b.Id
							,cw.ClientId
							,b2.UniversalBranchCode
							,ba.AccountNumber
							,bat.Id
							,b1.Code
							,ba.AccountHolderName 
					HAVING COUNT(cw.BrokerId) = 12'
PRINT @query
	EXEC(@query)
END
