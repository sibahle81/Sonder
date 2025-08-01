-- =============================================
-- Author:		Gram Letoaba
-- Create date: 06/04/2020
-- EXEC [billing].[GetPendingInvoices] 2230
-- =============================================
CREATE PROCEDURE [billing].[GetPendingInvoices]
	@PolicyId INT
AS
    

	DECLARE @SearchTable TABLE (
		InvoiceId INT,
		PolicyId INT,
	    CollectionDate Date,
		TotalInvoiceAmount Decimal(18,2),
		InvoiceStatus INT,
		InvoiceNumber VARCHAR(250),
		InvoiceDate Date,
		IsDeleted BIT,
        CreatedBy VARCHAR(250),
        CreatedDate Date,
        ModifiedBy VARCHAR(250),
        ModifiedDate Date,
        NotificationDate Date
	);

	DECLARE @Records INT;
	SELECT @Records =  COUNT(*) FROM [billing].[Transactions] T INNER JOIN [billing].[Invoice] I
	ON I.InvoiceId = T.InvoiceId 
	WHERE  I.PolicyId = @PolicyId AND I.InvoiceStatusId = (SELECT Id FROM [common].[InvoiceStatus] WHERE Name = 'Pending')

    IF (@Records > 1)
		BEGIN
		  INSERT INTO @SearchTable
		  SELECT TOP 1 I.[InvoiceId]
			  ,I.[PolicyId]
			  ,I.[CollectionDate]
			  ,I.[TotalInvoiceAmount] - (SELECT SUM(Amount) FROM [billing].[Transactions] WHERE InvoiceId = I.[InvoiceId] AND (TransactionTypeId = 3 OR TransactionTypeId = 4) GROUP BY InvoiceId) AS [TotalInvoiceAmount]
			  ,I.[InvoiceStatusId]
			  ,I.[InvoiceNumber]
			  ,I.[InvoiceDate]
			  ,I.[IsDeleted]
			  ,I.[CreatedBy]
			  ,I.[CreatedDate]
			  ,I.[ModifiedBy]
			  ,I.[ModifiedDate]
			  ,I.[NotificationDate]
		  FROM [billing].[Invoice] I INNER JOIN [billing].[Transactions] T
		  ON I.InvoiceId = T.InvoiceId
		  WHERE I.PolicyId = @PolicyId AND I.InvoiceStatusId = (SELECT Id FROM [common].[InvoiceStatus] WHERE Name = 'Pending')
		END
	ELSE
	    BEGIN
		  INSERT INTO @SearchTable
			SELECT I.[InvoiceId]
			  ,I.[PolicyId]
			  ,I.[CollectionDate]
			  ,I.[TotalInvoiceAmount]
			  ,I.[InvoiceStatusId]
			  ,I.[InvoiceNumber]
			  ,I.[InvoiceDate]
			  ,I.[IsDeleted]
			  ,I.[CreatedBy]
			  ,I.[CreatedDate]
			  ,I.[ModifiedBy]
			  ,I.[ModifiedDate]
			  ,I.[NotificationDate]
		  FROM [billing].[Invoice] I 
		  WHERE I.PolicyId = @PolicyId AND I.InvoiceStatusId = (SELECT Id FROM [common].[InvoiceStatus] WHERE Name = 'Pending')

		  INSERT INTO @SearchTable
		  SELECT TOP 1 I.[InvoiceId]
			  ,I.[PolicyId]
			  ,I.[CollectionDate]
			  ,I.[TotalInvoiceAmount] - (SELECT SUM(Amount) FROM [billing].[Transactions] WHERE InvoiceId = I.[InvoiceId] AND (TransactionTypeId = 3 OR TransactionTypeId = 4) GROUP BY InvoiceId) AS [TotalInvoiceAmount]
			  ,I.[InvoiceStatusId]
			  ,I.[InvoiceNumber]
			  ,I.[InvoiceDate]
			  ,I.[IsDeleted]
			  ,I.[CreatedBy]
			  ,I.[CreatedDate]
			  ,I.[ModifiedBy]
			  ,I.[ModifiedDate]
			  ,I.[NotificationDate]
		  FROM [billing].[Invoice] I INNER JOIN [billing].[Transactions] T
		  ON I.InvoiceId = T.InvoiceId
		  WHERE I.PolicyId = @PolicyId AND I.InvoiceStatusId = (SELECT Id FROM [common].[InvoiceStatus] WHERE Name = 'Partially')
		END

      SELECT InvoiceId,
		PolicyId,
	    CollectionDate,
		TotalInvoiceAmount,
		InvoiceStatus,
		InvoiceNumber,
		InvoiceDate,
		IsDeleted,
        CreatedBy,
        CreatedDate,
        ModifiedBy,
        ModifiedDate,
        NotificationDate
	 FROM @SearchTable
