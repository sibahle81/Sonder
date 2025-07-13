

CREATE FUNCTION [dbo].[GetTransactionBalanceForInterest] (@transactionId int) 
returns DECIMAL (18, 2) 
AS 
  BEGIN 
      DECLARE @balance DECIMAL (18, 2) 
	  DECLARE @transactionType int = 0
	  DECLARE @IsDebit bit = 0
	  DECLARE @transactionAmount DECIMAL(18,2) = 0
	  SELECT @transactionAmount = (SELECT t.Amount from [billing].[Transactions] t where t.TransactionId = @transactionId)

	  SELECT @transactionType = (SELECT ISNULL
	  ((SELECT t.TransactionTypeId from [billing].[Transactions] t where t.TransactionId = @transactionId),0))
	  
	  SELECT @IsDebit = (SELECT ISNULL((SELECT ttl.IsDebit from [billing].[Transactions] t,
	   [billing].[TransactionTypeLink] ttl where t.TransactionId = @transactionId and ttl.Id = t.TransactionTypeLinkId),0))

	  SELECT @balance = 
	  
	  (SELECT Isnull((SELECT t.amount - ( 
             Isnull((SELECT 
             Sum(ia.amount) 
             FROM 
             [billing].[invoiceallocation] 
             ia 
                WHERE ia.IsDeleted = 0 and  ia.invoiceid = 
             i.invoiceid), 0) + 
                                  -Isnull 
             (( 
             SELECT 
             Sum(ia2.amount) 
             FROM 
             [billing].[transactions] t2, 
             [billing].[invoiceallocation] ia2 
             WHERE 
             ia2.invoiceid = i.invoiceid 
             AND 
             ia2.transactionid = 
             t2.linkedtransactionid 
             AND
			 ia2.Amount <> 0
			 AND
             t2.transactiontypeid IN ( 
             1, 2)), 0) 
             - 
             -Isnull(((SELECT Sum(t3.amount) 
             FROM   [billing].[transactions] t3 
             WHERE  t3.linkedtransactionid = t.transactionid 
             AND t3.transactiontypeid IN ( 5 ))), 0) 			  
			 ) 

             FROM   [billing].[transactions] t, 
             [billing].[invoice] i 
             WHERE  t.transactionId = @transactionId 
             AND i.invoiceid = t.invoiceId
             AND t.transactiontypeid = 6), 0)			 
			 )  
			 
		      RETURN @balance 
  END