


-- =============================================
-- Author:		Gram Letoaba
-- Create date: 11/09/2020
-- EXEC [billing].[GeneralLedgerReport] NULL, NULL, NULL
-- =============================================
CREATE   PROCEDURE [billing].[GeneralLedgerReport]
    @StartDate AS DATE = NULL,
	@EndDate AS DATE = NULL,
	@chartNumber AS VARCHAR(50) = NULL
AS

BEGIN
      DECLARE @HeaderTable TABLE (Id INT, Name Varchar(50)); DECLARE @InvoiceTable TABLE (Id INT, Name Varchar(50), Amount Decimal(18, 2), CRNAmount Decimal(18, 2), Balance Decimal(18, 2)); 
DECLARE @Counter INT DECLARE @CurrMonth INT
SET                @CurrMonth =
                             (SELECT        MONTH(GETDATE()))
SET                @Counter = 1 WHILE (@Counter <= @CurrMonth) BEGIN PRINT @Counter; IF @Counter = 1 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (1, 'JAN')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (1, 'JAN',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END IF @Counter = 2 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (2, 'FEB')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (2, 'FEB',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END IF @Counter = 3 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (3, 'MAR')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (3, 'MAR',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END IF @Counter = 4 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (4, 'APR')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (4, 'APR',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END IF @Counter = 5 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (5, 'MAY')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (5, 'MAY',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END IF @Counter = 6 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (6, 'JUN')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (6, 'JUN',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END IF @Counter = 7 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (7, 'JUL')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (7, 'JUL',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END IF @Counter = 8 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (8, 'AUG')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (8, 'AUG',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END IF @Counter = 9 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (9, 'SEP')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (9, 'SEP',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END IF @Counter = 10 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (10, 'OCT')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (10, 'OCT',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END IF @Counter = 11 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (11, 'NOV')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (11, 'NOV',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END IF @Counter = 12 BEGIN
                             INSERT        
                              INTO               @HeaderTable
VALUES        (12, 'DEC')
                             INSERT        
                              INTO               @InvoiceTable
VALUES        (12, 'DEC',
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note'),
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Invoice') -
                             (SELECT        SUM(DailyTotal)
                               FROM            [billing].[AbilityCollections]
                               WHERE        MONTH(TransactionDate) = @Counter AND TransactionType = 'Credit Note')) END
SET                @Counter = @Counter + 1 END
                             SELECT *
                              FROM            @InvoiceTable  
	                       WHERE ((@StartDate IS NULL AND @EndDate IS NULL) OR (Id BETWEEN MONTH(@StartDate) AND MONTH(@EndDate)))
	                      -- AND (@chartNumber IS NULL OR (@chartNumber = ChartIsNo OR @chartNumber = ChartBsNo))
						   ORDER BY Id ASC

END


SELECT MONTH(GETDATE())
