-- =============================================
-- Author:		Gram Letoaba
-- =============================================
CREATE FUNCTION [dbo].[GenerateAuditReference] (@transactionId INT) 
returns Varchar (20) 
AS 
  BEGIN 
      DECLARE @reference varchar (20) 
	  DECLARE @transactionType int = 0
	  DECLARE @industryClassId int = 0
	  SELECT @transactionType = (SELECT t.TransactionTypeId from [billing].[Transactions] t 
	  where t.TransactionId = @transactionId)
	  
	  SELECT @industryClassId = ISNULL((SELECT I.IndustryClassId FROM [client].[FinPayee] F 
		INNER JOIN [common].[Industry] I ON F.IndustryId = I.Id INNER JOIN [billing].[Transactions] T
		ON F.RolePlayerId = T.RolePlayerId INNER JOIN [common].[TransactionType] Y
		ON T.TransactionTypeId = Y.Id
		WHERE T.TransactionId = @transactionId),0)

IF (@industryClassId = 0)
BEGIN
	IF(SELECT [RolePlayerIdentificationTypeId] FROM [client].[RolePlayer] WHERE RolePlayerId = (select TOP 1 roleplayerid from billing.Transactions T WHERE T.TransactionId = @transactionId)) = 1
	BEGIN
		SET @industryClassId = 4;
	END ELSE
	BEGIN
		SET @industryClassId = 3;
	END 
END

 -- print '@industryClassId = ' + cast(@industryClassId as varchar(100)) + ': @transactionId = ' +  cast(@transactionId as varchar(100))



	  SELECT @reference = 
	  CASE
      WHEN @transactionType = 6 AND @industryClassId = 4
	  THEN
	    (SELECT 'INVIND-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	  WHEN @transactionType = 6 AND (@industryClassId = 3 OR @industryClassId = 5)
	  THEN
	    (SELECT 'INVGRP-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 6 AND @industryClassId = 2
	  THEN
	    (SELECT 'INVMTL-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 6 AND @industryClassId = 1
	  THEN
	    (SELECT 'INVMIN-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
   WHEN @transactionType = 8 AND @industryClassId = 4
	  THEN
	    (SELECT 'RFIND-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	  WHEN @transactionType = 8 AND (@industryClassId = 3 OR @industryClassId = 5)
	  THEN
	    (SELECT 'RFGRP-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 8 AND @industryClassId = 2
	  THEN
	    (SELECT 'RFMTL-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 8 AND @industryClassId = 1
	  THEN
	    (SELECT 'RFMIN-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
		--INVOICE REVERSAL
	      WHEN @transactionType = 5 AND @industryClassId = 4
	  THEN
	    (SELECT 'INVRVIND-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	  WHEN @transactionType = 5 AND (@industryClassId = 3 OR @industryClassId = 5)
	  THEN
	    (SELECT 'INVRVGRP-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 5 AND @industryClassId = 2
	  THEN
	    (SELECT 'INVRVMTL-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 5 AND @industryClassId = 1
	  THEN
	    (SELECT 'INVRVMIN-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
		--CREDIT NOTE
	 WHEN @transactionType = 4 AND @industryClassId = 4
	  THEN
	    (SELECT 'CRNIND-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	  WHEN @transactionType = 4 AND (@industryClassId = 3 OR @industryClassId = 5)
	  THEN
	    (SELECT 'CRNGRP-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 4 AND @industryClassId = 2
	  THEN
	    (SELECT 'CRNMTL-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 4 AND @industryClassId = 1
	  THEN
	    (SELECT 'CRNMIN-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
			--DEBIT NOTE
	 WHEN @transactionType = 2 AND @industryClassId = 4
	  THEN
	    (SELECT 'DBNIND-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	  WHEN @transactionType = 2 AND (@industryClassId = 3 OR @industryClassId = 5)
	  THEN
	    (SELECT 'DBNGRP-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 2 AND @industryClassId = 2
	  THEN
	    (SELECT 'DBNMTL-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 2 AND @industryClassId = 1
	  THEN
	    (SELECT 'DBNMIN-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
				--PAYMENT
	 WHEN @transactionType = 3 AND @industryClassId = 4
	  THEN
	    (SELECT 'COLIND-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	  WHEN @transactionType = 3 AND (@industryClassId = 3 OR @industryClassId = 5)
	  THEN
	    (SELECT 'COLGRP-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 3 AND @industryClassId = 2
	  THEN
	    (SELECT 'COLMTL-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 3 AND @industryClassId = 1
	  THEN
	    (SELECT 'COLMIN-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
				--PAYMENT REVERSAL
	 WHEN @transactionType = 1 AND @industryClassId = 4
	  THEN
	    (SELECT 'PRVIND-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	  WHEN @transactionType = 1 AND (@industryClassId = 3 OR @industryClassId = 5)
	  THEN
	    (SELECT 'PRVGRP-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 1 AND @industryClassId = 2
	  THEN
	    (SELECT 'PRVMTL-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 1 AND @industryClassId = 1
	  THEN
	    (SELECT 'PRVMIN-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
		--CREDIT REALL
	 WHEN @transactionType = 19 AND @industryClassId = 4
	  THEN
	    (SELECT 'REA-CRNIND-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	  WHEN @transactionType = 19 AND (@industryClassId = 3 OR @industryClassId = 5)
	  THEN
	    (SELECT 'REA-CRNGRP-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 19 AND @industryClassId = 2
	  THEN
	    (SELECT 'REA-CRNMTL-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 19 AND @industryClassId = 1
	  THEN
	    (SELECT 'REA-CRNMIN-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
			--DEBIT REALL
	 WHEN @transactionType = 18 AND @industryClassId = 4
	  THEN
	    (SELECT 'REA-DBNIND-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	  WHEN @transactionType = 18 AND (@industryClassId = 3 OR @industryClassId = 5)
	  THEN
	    (SELECT 'REA-DBNGRP-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 18 AND @industryClassId = 2
	  THEN
	    (SELECT 'REA-DBNMTL-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)
	 WHEN @transactionType = 18 AND @industryClassId = 1
	  THEN
	    (SELECT 'REA-DBNMIN-' +
		REPLACE(CONVERT(CHAR(10), TransactionDate, 103), '/', '') FROM [billing].[Transactions]
		WHERE TransactionId = @transactionId)

    
	END
      RETURN @reference 
  END
