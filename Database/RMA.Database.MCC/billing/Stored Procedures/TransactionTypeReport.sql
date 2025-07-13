
---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/07/09
---- EXEC [billing].[TransactionTypeReport]
---- =============================================
CREATE   PROCEDURE [billing].[TransactionTypeReport]

AS
BEGIN
	select 
		distinct [Name] AS TransactionType
	from common.TransactionType
	where Name in ('Invoice','Credit Note','Payment','Payment Allocation' 
				   ,'Refund','Reallocations','Ability Posting','Payment Reversal','Invoice Reversal'
				   ,'Inter Debtor Transfer','Interbank Transfer')
	union

	select 'All' AS TransactionType
	order by 1
END