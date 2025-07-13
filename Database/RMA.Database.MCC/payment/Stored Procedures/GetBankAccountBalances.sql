CREATE PROCEDURE [payment].[GetBankAccountBalances]
--EXEC [payment].[GetBankAccountBalances]
AS
BEGIN
DECLARE @AccountBalances table
	(
		Id int,
		AccountNumber varchar(20),
		Balance decimal(18,2)		
	)

INSERT INTO @AccountBalances SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY [BankAccountNumber]) AS Id, SUBSTRING(BankAccountNumber,6,20) AS AccountNumber,
SUM(CASE WHEN DebitCredit = '+' THEN NettAmount ELSE -NettAmount END) AS Balance
FROM [finance].[BankStatementEntry]
WHERE LEN(SUBSTRING(BankAccountNumber,6,20)) > 9
GROUP BY BankAccountNumber

SELECT * FROM @AccountBalances
END