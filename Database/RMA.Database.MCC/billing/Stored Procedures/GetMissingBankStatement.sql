-- =================================================
-- Author:		Musa Kubheka
-- Create date: 2024 May 15
-- Description:	Get missing bank statement entries
-- =================================================
CREATE PROC billing.GetMissingBankStatement
	@BankAccountNumber varchar(25) = '62679223942'
AS
BEGIN
	DECLARE @MissingStatement TABLE (RowNumber int, StatementNumber int, StatementDate date)
	INSERT INTO @MissingStatement
	SELECT ROW_NUMBER() OVER (ORDER BY ibse.[ReferredId] DESC), ibse.[ReferredId], ibse.StatementDate
	FROM (
			SELECT DISTINCT CAST(bse.StatementNumber AS int) + 1 AS [ReferredId], StatementDate
			FROM finance.BankStatementEntry bse WHERE BankAccountNumber LIKE '%' + @BankAccountNumber
		 ) AS ibse
	LEFT JOIN finance.BankStatementEntry jbse ON ibse.[ReferredId] = jbse.[StatementNumber]
	WHERE jbse.[StatementNumber] IS NULL;

	SELECT DISTINCT StatementNumber = CAST(StatementNumber AS varchar(25)), ms.StatementDate
		, BankAccountNumber = @BankAccountNumber, MinStatementNumber, cc.MaxStatementNumber
	FROM @MissingStatement ms
	OUTER APPLY (SELECT MIN(CAST(StatementNumber AS int)) + 1 AS MinStatementNumber,
					MAX(CAST(StatementNumber AS int)) + 1 AS MaxStatementNumber
				FROM finance.BankStatementEntry bse WHERE BankAccountNumber LIKE '%' + @BankAccountNumber) cc
	WHERE cc.MaxStatementNumber <> ms.StatementNumber AND cc.MinStatementNumber <> ms.StatementNumber

	--SELECT StatementNumber = '4410', BankAccountNumber = @BankAccountNumber,
	--StatementDate = GETDATE(), MinStatementNumber = 1, MaxStatementNumber = 9999
END