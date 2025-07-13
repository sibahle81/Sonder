


CREATE FUNCTION [dbo].[GetTransactionBalanceCollections] (@transactionId int) 
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
	  CASE
      WHEN @transactionType = 6 
	  THEN
	  (SELECT Isnull((SELECT t.amount - ( 
                                                                 Isnull((SELECT 
                                                                 Sum(ia.amount) 
                                                                    FROM 
             [billing].[invoiceallocation] 
             ia 
                WHERE  ia.invoiceid = 
             i.invoiceid), 0) + 
                                  -Isnull 
             (( 
             SELECT 
             Sum(t2.amount) 
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
             1, 2 )), 0) 
             - 
             -Isnull(((SELECT Sum(t3.amount) 
             FROM   [billing].[transactions] t3 
             WHERE  t3.linkedtransactionid = t.transactionid 
             AND t3.transactiontypeid IN ( 5 ))), 0) ) 
             FROM   [billing].[transactions] t, 
             [billing].[invoice] i 
             WHERE  t.transactionId = @transactionId 
             AND i.invoiceid = t.invoiceId
             AND t.transactiontypeid = 6), 0))
      WHEN @transactionType = 3
	  THEN
	 (SELECT Isnull((SELECT t.Amount - ISNULL((SELECT SUM(ia.Amount) FROM [billing].[InvoiceAllocation] ia where
				 ia.TransactionId = t.TransactionId),0) -
				 ISNULL((SELECT SUM(t2.Amount) FROM [billing].[Transactions] t2
				 WHERE t2.LinkedTransactionId = t.TransactionId AND t2.TransactionTypeId in (1,2,8,9,18)),0)
				 FROM [billing].[Transactions] t
				 WHERE t.transactionId = @transactionId and t.transactionTypeId = 3),0))
	  WHEN @transactionType = 4
	  THEN
	 (SELECT Isnull((SELECT t.Amount - ISNULL((SELECT SUM(ia.Amount) FROM [billing].[InvoiceAllocation] ia where
				 ia.TransactionId = t.TransactionId),0) -
				 ISNULL((SELECT SUM(t2.Amount) FROM [billing].[Transactions] t2
				 WHERE t2.LinkedTransactionId = t.TransactionId AND t2.TransactionTypeId in (1,2,8,9,18)),0)
				 FROM [billing].[Transactions] t
				 WHERE t.transactionId = @transactionId and t.transactionTypeId = 4),0))
	  WHEN @transactionType = 19
	  THEN
	 (SELECT Isnull((SELECT t.Amount - ISNULL((SELECT SUM(ia.Amount) FROM [billing].[InvoiceAllocation] ia where
				 ia.TransactionId = t.TransactionId),0) -
				 ISNULL((SELECT SUM(t2.Amount) FROM [billing].[Transactions] t2
				 WHERE t2.LinkedTransactionId = t.TransactionId AND t2.TransactionTypeId in (1,2,8,9,18)),0)
				 FROM [billing].[Transactions] t
				 WHERE t.transactionId = @transactionId and t.transactionTypeId = 19),0))
	  WHEN @transactionType = 5
	  THEN
	  0
	  WHEN @transactionType = 1
	  THEN
	  (SELECT ISNULL((SELECT t.Amount FROM [billing].[Transactions] t
				 WHERE t.TransactionId = @transactionId and t.transactionTypeId = 1 and t.LinkedTransactionId is null), 0))
	  WHEN @transactionType = 8
	  THEN
	  0
	  WHEN @transactionType = 2
	  THEN
	  (SELECT ISNULL((SELECT t.Amount FROM [billing].[Transactions] t
				 WHERE t.TransactionId = @transactionId and t.transactionTypeId = 2 and t.LinkedTransactionId is null), 0))
	  WHEN @transactionType = 9
	  THEN
	  0
	  WHEN @transactionType = 18
	  THEN
	  0
	  WHEN @transactionType = 7
	  THEN
	  (SELECT Isnull((SELECT t.Amount
				 FROM [billing].[Transactions] t
				 WHERE t.transactionId = @transactionId and t.transactionTypeId = 7),0))
      ELSE 0
      END;

	  IF @isDebit = 0
	  BEGIN
	  if @balance < 0
	   begin
	   select @balance = 0
	   end
	   if @balance > 0
	   begin
	   select @balance = (@balance * -1)
	   end
	  ELSE
	   if @balance < 0
	   begin
	   select @balance = 0
	   end
	  END

	  IF @isDebit = 1
	  BEGIN
	   if @balance < 0
	   begin
	   select @balance = 0
	   end
	   if @transactionType = 6 and @balance > @transactionAmount --invoice
	   begin
	   select @balance = @transactionAmount
	   end
	  END

      RETURN @balance 
  END