CREATE PROCEDURE [policy].[CommissionPaymentExport] @period VARCHAR(6),
@brokerageIds VARCHAR(MAX)
AS
BEGIN

	SET NOCOUNT ON;

	DECLARE @query VARCHAR(MAX)
	SET @query = 'SELECT
						''250655'' AS FromBankBranchCode
					   ,''62679224552'' AS FromBankAccountNumber
					   ,RIGHT(''000000'' + CAST(ROW_NUMBER() OVER (ORDER BY b.Id) AS VARCHAR(6)), 6) AS SequenceNumber
					   ,b2.UniversalBranchCode AS ToBankBranchCode
					   ,ba.AccountNumber AS ToBankAccountNumber
					   ,ISNULL(bat.Id, 1) AS AccountType
					   ,CAST(cs.Commission AS DECIMAL(18, 2)) AS Amount
					   ,''COM - '' + b.Code AS TransactionReference
					   ,ba.AccountHolderName AS BrokerAccountName
					FROM policy.CommissionHeader ch WITH (NOLOCK)
					INNER JOIN policy.CommissionSummary cs WITH (NOLOCK)
						ON ch.Id = cs.CommissionHeaderId
							AND ch.IsActive = 1
							AND ch.IsDeleted = 0
							AND cs.IsActive = 1
							AND cs.IsDeleted = 0
					INNER JOIN client.Brokerage b WITH (NOLOCK)
						ON cs.BrokerageId = b.Id
							AND cs.IsActive = 1
							AND cs.IsDeleted = 0
							AND b.IsActive = 1
							AND b.IsDeleted = 0
					INNER JOIN client.Broker b1 WITH (NOLOCK)
						ON b.Id = b1.BrokerageId
							AND b.IsActive = 1
							AND b.IsDeleted = 0
							AND b1.IsActive = 1
							AND b1.IsDeleted = 0
					INNER JOIN client.BankAccount ba WITH (NOLOCK)
						ON b.BankAccountId = ba.Id
							AND b.IsActive = 1
							AND b.IsDeleted = 0
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
					WHERE ch.Period = ' + @period

	IF ISNULL(@BrokerageIds, '') <> ''
	BEGIN
		SET @query = @query + ' AND b.Id IN(' + @BrokerageIds + ')'
	END
	
	SET @query = @query + 'GROUP BY b.Id
							,ba.AccountNumber
							,b2.UniversalBranchCode
							,bat.Id
							,cs.Commission
							,b.Code
							,ba.AccountHolderName'

	EXEC (@query)
END
