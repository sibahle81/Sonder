CREATE PROCEDURE [billing].[InterestAlreadyProvisionedReport]
      @StartDate         DATE,                       -- report start date
      @EndDate           DATE,                       -- report cut-off
      @ProductId         VARCHAR(25) = '-1',         -- comma list | –1 = ALL
      @IndustryId        VARCHAR(25) = '0',          -- comma list |  0 = ALL
      @UnderwritingYear  CHAR(4)     = NULL          -- e.g. '2024'
AS
BEGIN
    SET NOCOUNT ON;  

    DECLARE @tvpProduct  TABLE (Id INT PRIMARY KEY);
    DECLARE @tvpIndustry TABLE (Id INT PRIMARY KEY);

    IF @ProductId <> '-1'
        INSERT @tvpProduct (Id)
        SELECT DISTINCT TRY_CAST(value AS INT)
        FROM STRING_SPLIT(@ProductId, ',')
        WHERE TRY_CAST(value AS INT) IS NOT NULL;

    IF @IndustryId <> '0'
        INSERT @tvpIndustry (Id)
        SELECT DISTINCT TRY_CAST(value AS INT)
        FROM STRING_SPLIT(@IndustryId, ',')
        WHERE TRY_CAST(value AS INT) IS NOT NULL;

    DECLARE @DWLoadDateID INT,
            @Step          DATETIME = GETDATE(),
            @Msg           VARCHAR(1000),
            @ClientTypeId  INT = 0,
            @BalanceTypeId INT = 0,
            @DebtorStatus  INT = 0;   

    SET @DWLoadDateID = ( YEAR (GETDATE()) * 10000 )
                      + ( MONTH(GETDATE()) * 100  )
                      +   DAY  (GETDATE());

    IF OBJECT_ID(N'tempdb..#TempBillingTransactions', N'U') IS NOT NULL
        DROP TABLE #TempBillingTransactions;

    CREATE TABLE #TempBillingTransactions
    (   TransactionId        INT            NOT NULL,
        InvoiceId            INT            NULL,
        RolePlayerId         INT            NOT NULL,
        TransactionTypeLinkId INT           NOT NULL,
        Amount               DECIMAL(18,2)  NOT NULL,
        TransactionDate      DATETIME       NOT NULL,
        BankReference        VARCHAR(50)    NULL,
        TransactionTypeId    INT            NOT NULL,
        CreatedDate          DATETIME       NOT NULL,
        RmaReference         VARCHAR(100)   NULL,
        LinkedTransactionId  INT            NULL,
        DebtorStatus         VARCHAR(50)    NULL,
        Balance              DECIMAL(18,2)  NULL,
        [120DaysBalance]     INT
    );

    CREATE NONCLUSTERED INDEX IX_Transactions
        ON #TempBillingTransactions (TransactionId);

    INSERT #TempBillingTransactions
    SELECT bt.TransactionId,
           bt.InvoiceId,
           bt.RolePlayerId,
           bt.TransactionTypeLinkId,
           CASE WHEN bt.TransactionTypeLinkId = 1
                THEN  bt.Amount ELSE -bt.Amount END,
           bt.TransactionDate,
           bt.BankReference,
           bt.TransactionTypeId,
           bt.CreatedDate,
           bt.RmaReference,
           bt.LinkedTransactionId,
           cds.Name,
           CASE WHEN bt.TransactionTypeLinkId = 1
                THEN  bt.Amount ELSE -bt.Amount END,
           DATEDIFF(DAY,
                    ISNULL(bt.TransactionEffectiveDate, bt.TransactionDate),
                    GETDATE())
    FROM   billing.Transactions                    bt
    INNER  JOIN client.RolePlayer                  R   ON R.RolePlayerId  = bt.RolePlayerId
    INNER  JOIN client.FinPayee                    F   ON F.RolePlayerId  = R.RolePlayerId
    LEFT   JOIN common.Industry                    IC  ON IC.Id           = F.IndustryId
    LEFT   JOIN common.IndustryClass               ICD ON ICD.Id          = IC.IndustryClassId
    LEFT   JOIN common.DebtorStatus                cds ON cds.Id          = F.DebtorStatusId
    LEFT   JOIN billing.InvoiceAllocation          bdta WITH (NOLOCK)
                                       ON bdta.LinkedTransactionId = bt.TransactionId
    WHERE  bt.TransactionTypeId IN (7,4)
      AND  bt.CreatedDate  >= @StartDate
      AND  bt.CreatedDate  <= @EndDate
      AND  bdta.LinkedTransactionId IS NULL
      AND  NOT EXISTS ( SELECT 1
                        FROM   common.Period p
                        WHERE  p.StartDate <= bt.TransactionDate
                          AND  p.Status     = 'Future')
      AND  bt.TransactionId NOT IN
           ( SELECT DISTINCT LinkedTransactionId
             FROM billing.Transactions
             WHERE TransactionTypeId = 17 )
      AND (NOT EXISTS (SELECT 1 FROM @tvpProduct)
           OR EXISTS ( SELECT 1
                       FROM policy.Policy         pol
                       JOIN product.ProductOption po  ON po.Id = pol.ProductOptionId
                       JOIN product.Product       pr  ON pr.Id = po.ProductId
                       WHERE pol.PolicyOwnerId = bt.RolePlayerId
                         AND pr.Id IN (SELECT Id FROM @tvpProduct) ))
      AND (NOT EXISTS (SELECT 1 FROM @tvpIndustry)
           OR ICD.Id IN (SELECT Id FROM @tvpIndustry))
      AND ( @UnderwritingYear IS NULL
            OR EXISTS ( SELECT 1
                        FROM billing.Invoice inv
                        WHERE inv.InvoiceId = bt.InvoiceId
                          AND YEAR(inv.InvoiceDate) = @UnderwritingYear ) );

    IF OBJECT_ID(N'tempdb..#TempInvoices', N'U') IS NOT NULL
        DROP TABLE #TempInvoices;

    SELECT DISTINCT
           icd.Name                         AS Industry,
           icd.Id                           AS IndustryId,
           bt.TransactionId                 AS TransactionsTransactionId,
           bt.TransactionDate,
           ISNULL(pp.PolicyStatusId,0)      AS PolicyStatusId,
           CASE WHEN ISNULL(ccmp.RolePlayerId,0)=0
                THEN 1
                ELSE CASE RIGHT(ISNULL(ccmp.ReferenceNumber,'99'),2)
                         WHEN '99' THEN 2 ELSE 3 END END          AS ClientTypeId,
           YEAR(bt.CreatedDate)             AS dr_yyyy,
           CASE WHEN ICD.Id = 4 AND ppr.Id IN (1,2) THEN
                    (SELECT TOP 1 Level3 FROM finance.ProductCrossRefTranType WHERE TransactionType = 'Invoice' AND Level1 = 'INDF')
                WHEN ICD.Id = 2 AND ppr.Id = 4 THEN
                    (SELECT TOP 1 Level3 FROM finance.ProductCrossRefTranType WHERE Origin = 'RMA COID METALS')
                WHEN ICD.Id = 1 AND ppr.Id = 4 THEN
                    (SELECT TOP 1 Level3 FROM finance.ProductCrossRefTranType WHERE Origin = 'RMA COID MINING')
                WHEN ICD.Id = 2 AND ppr.Id IN (1,2) THEN
                    (SELECT TOP 1 Level3 FROM finance.ProductCrossRefTranType WHERE TransactionType = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
                WHEN ICD.Id = 3 AND ppr.Id NOT IN (1,2) THEN
                    (SELECT TOP 1 Level3 FROM finance.ProductCrossRefTranType WHERE Origin = 'RML NON COID CLASS OTHER')
                WHEN ppr.Id IN (5,6,7) THEN
                    (SELECT TOP 1 Level3 FROM finance.ProductCrossRefTranType WHERE Origin = 'RMA NON COID MINING')
                WHEN ICD.Id = 1 AND ppr.Id IN (1,2) THEN
                    (SELECT TOP 1 Level3 FROM finance.ProductCrossRefTranType WHERE TransactionType = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Mining')
                WHEN ICD.Id = 2 AND ppr.Id IN (1,2) THEN
                    (SELECT TOP 1 Level3 FROM finance.ProductCrossRefTranType WHERE TransactionType = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
                WHEN ICD.Id IN (3,5) AND ppr.Id IN (1,2) THEN
                    (SELECT TOP 1 Level3 FROM finance.ProductCrossRefTranType WHERE TransactionType = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Class Other')
           END                                     AS ControlNumber,
           ISNULL(YEAR(bi.InvoiceDate), YEAR(bt.TransactionDate)) AS underwriting_yyyy,
           CASE WHEN ICD.Id = 4 AND ppr.Id IN (1,2) THEN
                    (SELECT TOP 1 Origin FROM finance.ProductCrossRefTranType WHERE TransactionType = 'Invoice' AND Level1 = 'INDF')
                WHEN ICD.Id = 2 AND ppr.Id = 4 THEN
                    (SELECT TOP 1 Origin FROM finance.ProductCrossRefTranType WHERE Origin = 'RMA COID METALS')
                WHEN ICD.Id = 1 AND ppr.Id = 4 THEN
                    (SELECT TOP 1 Origin FROM finance.ProductCrossRefTranType WHERE Origin = 'RMA COID MINING')
                WHEN ICD.Id = 2 AND ppr.Id IN (1,2) THEN
                    (SELECT TOP 1 Origin FROM finance.ProductCrossRefTranType WHERE TransactionType = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
                WHEN ICD.Id = 3 AND ppr.Id NOT IN (1,2) THEN
                    (SELECT TOP 1 Origin FROM finance.ProductCrossRefTranType WHERE Origin = 'RML NON COID CLASS OTHER')
                WHEN ppr.Id IN (5,6,7) THEN
                    (SELECT TOP 1 Origin FROM finance.ProductCrossRefTranType WHERE Origin = 'RMA NON COID MINING')
                WHEN ICD.Id = 1 AND ppr.Id IN (1,2) THEN
                    (SELECT TOP 1 Origin FROM finance.ProductCrossRefTranType WHERE TransactionType = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Mining')
                WHEN ICD.Id = 2 AND ppr.Id IN (1,2) THEN
                    (SELECT TOP 1 Origin FROM finance.ProductCrossRefTranType WHERE TransactionType = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Metals')
                WHEN ICD.Id IN (3,5) THEN
                    (SELECT TOP 1 Origin FROM finance.ProductCrossRefTranType WHERE TransactionType = 'Invoice' AND Level1 = 'FUN' AND Origin = 'FUNERAL - Group Class Other')
           END                                     AS Product,
           cfp.FinPayeNumber                       AS dr_no,
           cds.Name                                AS DebtorStatus,
           CASE WHEN crp.RolePlayerIdentificationTypeId = 2 THEN ccmp.Name
                WHEN crp.RolePlayerIdentificationTypeId = 1 THEN cpn.FirstName + ' ' + cpn.Surname
           END                                     AS name,
           CASE WHEN ctp.Name LIKE '%Invoice%' AND YEAR(bt.CreatedDate) <> YEAR(@EndDate) THEN 'Invoice-Other-Period'
                WHEN ctp.Name LIKE '%Invoice%' AND YEAR(bt.CreatedDate) = YEAR(@EndDate) THEN 'Invoice'
                ELSE ctp.Name END                  AS Type,
           prod.Name                               AS ProdOption,
           [120DaysBalance],
           CASE WHEN bt.BankReference IS NULL OR bt.BankReference = '' THEN bt.RmaReference ELSE bt.BankReference END AS DocumentNo,
           CASE WHEN bt.TransactionTypeLinkId = 1 THEN bt.Amount ELSE -bt.Amount END AS DocBalance,
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 1  AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [JAN-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 1 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [JAN-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 1  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [JAN-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 1  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [JAN-Credit],
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 2  AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [FEB-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 2 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [FEB-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 2  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [FEB-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 2  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [FEB-Credit],
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 3  AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [MAR-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 3 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [MAR-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 3  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [MAR-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 3  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [MAR-Credit],
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 4  AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [APR-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 4 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [APR-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 4  AND bt.TransactionTypeLinkId = 2 AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [APR-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 4  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [APR-Credit],
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 5  AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [MAY-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 5 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [MAY-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 5  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [MAY-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 5  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [MAY-Credit],
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 6  AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [JUN-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 6 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [JUN-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 6  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [JUN-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 6  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [JUN-Credit],
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 7  AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [JUL-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 7 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [JUL-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 7  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [JUL-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 7  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [JUL-Credit],
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 8  AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [AUG-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 8 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [AUG-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 8  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [AUG-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 8  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [AUG-Credit],
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 9  AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [SEP-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 9 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [SEP-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 9  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [SEP-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 9  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [SEP-Credit],
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 10 AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [OCT-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 10 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [OCT-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 10 AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [OCT-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 10 AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [OCT-Credit],
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 11 AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [NOV-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 11 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [NOV-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 11 AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [NOV-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 11 AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [NOV-Credit],
           CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 12 AND bt.TransactionTypeId = 6 THEN 1 ELSE 0 END AS [DEC-Invoice],
           (CASE WHEN YEAR(bt.TransactionDate) = YEAR(@EndDate) AND MONTH(bt.TransactionDate) = 12 AND bt.TransactionTypeId = 7 THEN bt.Amount ELSE 0 END) AS [DEC-Raised],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 12 AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [DEC-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate) AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 12 AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [DEC-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 1  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Jan-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 1  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-Jan-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 2  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Feb-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 2  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-Feb-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 3  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Mar-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 3  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-Mar-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 4  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Apr-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 4  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-Apr-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 5  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-May-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 5  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-May-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 6  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Jun-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 6  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-Jun-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 7  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Jul-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 7  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-Jul-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 8  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Aug-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 8  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-Aug-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 9  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId <> 4 THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Sep-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 9  AND bt.TransactionTypeLinkId IN (2) AND bt.TransactionTypeId = 4 THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-Sep-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 10 AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Oct-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 10 AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-Oct-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 11 AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Nov-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 11 AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-Nov-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 12 AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year1-Dec-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-1 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 12 AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year1-Dec-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 1  AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Jan-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 1  AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-Jan-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 2  AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Feb-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 2  AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-Feb-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 3  AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Mar-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 3  AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-Mar-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 4  AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Apr-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 4  AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-Apr-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 5  AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-May-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 5  AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-May-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 6  AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Jun-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 6  AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-Jun-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 7  AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Jul-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 7  AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-Jul-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 8  AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Aug-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 8  AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-Aug-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 9  AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Sep-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 9  AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-Sep-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 10 AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Oct-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 10 AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-Oct-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 11 AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Nov-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 11 AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-Nov-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 12 AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year2-Dec-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-2 AND MONTH(ISNULL(bia.CreatedDate, bt.TransactionDate)) = 12 AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year2-Dec-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-3 AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year3-Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) = YEAR(@EndDate)-3 AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year3-Credit],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) < YEAR(@EndDate)-3 AND bt.TransactionTypeId <> 4 AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * (CASE WHEN bt.TransactionTypeLinkId = 1 THEN 1 ELSE -1 END) ELSE 0 END AS [Year4+Collect],
           CASE WHEN YEAR(ISNULL(bia.CreatedDate, bt.TransactionDate)) < YEAR(@EndDate)-3 AND bt.TransactionTypeId = 4  AND bt.TransactionTypeLinkId IN (2) THEN ISNULL(bia.Amount, bt.Amount) * -1 ELSE 0 END AS [Year4+Credit],
           CASE WHEN bt.TransactionId = bia.TransactionId THEN 'Allocated' ELSE 'Unallocated' END AS [Flag]
    INTO #TempInvoices
    FROM  #TempBillingTransactions                   bt
    LEFT  JOIN Billing.InvoiceAllocation             bia ON bia.TransactionId = bt.TransactionId
    LEFT  JOIN Billing.Invoice                       bi  ON bi.InvoiceId      = bia.InvoiceId
    LEFT  JOIN Client.RolePlayer                     crp ON crp.RolePlayerId  = bt.RolePlayerId
    LEFT  JOIN Client.FinPayee                       cfp ON cfp.RolePlayerId  = bt.RolePlayerId
    LEFT  JOIN Common.TransactionType                ctp ON ctp.Id            = bt.TransactionTypeId
    LEFT  JOIN Client.Person                         cpn ON cpn.RolePlayerId  = crp.RolePlayerId
    LEFT  JOIN Client.Company                        ccmp ON ccmp.RolePlayerId = crp.RolePlayerId
    LEFT  JOIN client.RolePlayer                     R    ON R.RolePlayerId   = bt.RolePlayerId
    LEFT  JOIN client.FinPayee                       F    ON F.RolePlayerId   = R.RolePlayerId
    LEFT  JOIN common.Industry                       IC   ON IC.Id            = F.IndustryId
    LEFT  JOIN common.IndustryClass                  ICD  ON ICD.Id           = IC.IndustryClassId
    LEFT  JOIN Billing.Invoice                       bi2  ON bi2.InvoiceId    = bt.InvoiceId
    LEFT  JOIN Policy.Policy                         pp   ON pp.PolicyOwnerId = bt.RolePlayerId
    LEFT  JOIN product.ProductOption                 prod WITH (NOLOCK) ON prod.Id = pp.ProductOptionId
    LEFT  JOIN product.Product                       ppr  WITH (NOLOCK) ON ppr.Id = prod.ProductId
    LEFT  JOIN common.DebtorStatus                   cds  ON cds.Id           = F.DebtorStatusId
    LEFT  JOIN policy.Policy                         papol WITH (NOLOCK) ON papol.PolicyId = pp.ParentPolicyId
    LEFT  JOIN client.RolePlayer                     parp WITH (NOLOCK) ON parp.RolePlayerId = pp.PolicyOwnerId
    LEFT  JOIN product.ProductOptionBillingIntegration ppbi
                                                 ON ppbi.IndustryClassId = IC.IndustryClassId
                                                AND ppbi.ProductOptionId = prod.Id
    WHERE  bt.CreatedDate >= @StartDate
      AND  bt.CreatedDate <= @EndDate
      AND  [120DaysBalance] >= 120
      AND  ppbi.AccumulatesInterest = 1
      AND (NOT EXISTS (SELECT 1 FROM @tvpProduct)
           OR ppr.Id IN (SELECT Id FROM @tvpProduct))
      AND (NOT EXISTS (SELECT 1 FROM @tvpIndustry)
           OR ICD.Id IN (SELECT Id FROM @tvpIndustry))
      AND ( @UnderwritingYear IS NULL
            OR YEAR(bi.InvoiceDate) = @UnderwritingYear );

    IF (@ClientTypeId > 0) 
        DELETE FROM #TempInvoices WHERE ClientTypeId <> @ClientTypeId;

    IF @BalanceTypeId = 0 
        SET @BalanceTypeId = 1;

    IF @BalanceTypeId = 1
        DELETE FROM #TempInvoices WHERE ROUND(DocBalance, 2) = 0.00;
    ELSE IF @BalanceTypeId = 2
        DELETE FROM #TempInvoices WHERE ROUND(DocBalance, 2) <= 0.00;
    ELSE IF @BalanceTypeId = 3
        DELETE FROM #TempInvoices WHERE ROUND(DocBalance, 2) >= 0.00;

    UPDATE #TempInvoices SET PolicyStatusId = 1 WHERE PolicyStatusId NOT IN (2,4,5,7,8,11,13);

    IF (@DebtorStatus = 1)
        DELETE FROM #TempInvoices WHERE PolicyStatusId <> 1;
    ELSE IF (@DebtorStatus = 2)
        DELETE FROM #TempInvoices WHERE PolicyStatusId = 1;

    IF OBJECT_ID(N'tempdb..#TempInvoices3', N'U') IS NOT NULL
        DROP TABLE #TempInvoices3;

    SELECT  
            a.Industry            AS [Class],
            CAST(a.dr_yyyy AS VARCHAR(255))           AS dr_yyyy,
            CAST(a.ControlNumber AS VARCHAR(255))     AS ControlNumber,
            CAST(a.underwriting_yyyy AS VARCHAR(255)) AS underwriting_yyyy,
            CAST(a.Product AS VARCHAR(255))           AS Product,
            CAST(a.dr_no AS VARCHAR(255))             AS dr_no,
            CAST(a.name AS VARCHAR(255))              AS name,
            CAST(a.Type AS VARCHAR(255))              AS Type,
            CAST(a.DocumentNo AS VARCHAR(255))        AS DocumentNo,
            a.ProdOption,
            a.DebtorStatus,
            a.[120DaysBalance],
            CAST(SUM(a.DocBalance) AS FLOAT)          AS DocBalance,
            CAST(MAX(a.[JAN-Invoice]) AS FLOAT)       AS [JAN_Invoice],
            CAST(MAX(a.[JAN-Raised])  AS FLOAT)       AS [JAN_Raised],
            CAST(SUM(a.[JAN-Collect]) AS FLOAT)       AS [JAN_Collect],
            CAST(SUM(a.[JAN-Credit])  AS FLOAT)       AS [JAN_Credit],
            CAST(MAX(a.[FEB-Invoice]) AS FLOAT)       AS [FEB_Invoice],
            CAST(MAX(a.[FEB-Raised])  AS FLOAT)       AS [FEB_Raised],
            CAST(SUM(a.[FEB-Collect]) AS FLOAT)       AS [FEB_Collect],
            CAST(SUM(a.[FEB-Credit])  AS FLOAT)       AS [FEB_Credit],
            CAST(MAX(a.[MAR-Invoice]) AS FLOAT)       AS [MAR_Invoice],
            CAST(MAX(a.[MAR-Raised])  AS FLOAT)       AS [MAR_Raised],
            CAST(SUM(a.[MAR-Collect]) AS FLOAT)       AS [MAR_Collect],
            CAST(SUM(a.[MAR-Credit])  AS FLOAT)       AS [MAR_Credit],
            CAST(MAX(a.[APR-Invoice]) AS FLOAT)       AS [APR_Invoice],
            CAST(MAX(a.[APR-Raised])  AS FLOAT)       AS [APR_Raised],
            CAST(SUM(a.[APR-Collect]) AS FLOAT)       AS [APR_Collect],
            CAST(SUM(a.[APR-Credit])  AS FLOAT)       AS [APR_Credit],
            CAST(MAX(a.[MAY-Invoice]) AS FLOAT)       AS [MAY_Invoice],
            CAST(MAX(a.[MAY-Raised])  AS FLOAT)       AS [MAY_Raised],
            CAST(SUM(a.[MAY-Collect]) AS FLOAT)       AS [MAY_Collect],
            CAST(SUM(a.[MAY-Credit])  AS FLOAT)       AS [MAY_Credit],
            CAST(MAX(a.[JUN-Invoice]) AS FLOAT)       AS [JUN_Invoice],
            CAST(MAX(a.[JUN-Raised])  AS FLOAT)       AS [JUN_Raised],
            CAST(SUM(a.[JUN-Collect]) AS FLOAT)       AS [JUN_Collect],
            CAST(SUM(a.[JUN-Credit])  AS FLOAT)       AS [JUN_Credit],
            CAST(MAX(a.[JUL-Invoice]) AS FLOAT)       AS [JUL_Invoice],
            CAST(MAX(a.[JUL-Raised])  AS FLOAT)       AS [JUL_Raised],
            CAST(SUM(a.[JUL-Collect]) AS FLOAT)       AS [JUL_Collect],
            CAST(SUM(a.[JUL-Credit])  AS FLOAT)       AS [JUL_Credit],
            CAST(MAX(a.[AUG-Invoice]) AS FLOAT)       AS [AUG_Invoice],
            CAST(MAX(a.[AUG-Raised])  AS FLOAT)       AS [AUG_Raised],
            CAST(SUM(a.[AUG-Collect]) AS FLOAT)       AS [AUG_Collect],
            CAST(SUM(a.[AUG-Credit])  AS FLOAT)       AS [AUG_Credit],
            CAST(MAX(a.[SEP-Invoice]) AS FLOAT)       AS [SEP_Invoice],
            CAST(MAX(a.[SEP-Raised])  AS FLOAT)       AS [SEP_Raised],
            CAST(SUM(a.[SEP-Collect]) AS FLOAT)       AS [SEP_Collect],
            CAST(SUM(a.[SEP-Credit])  AS FLOAT)       AS [SEP_Credit],
            CAST(MAX(a.[OCT-Invoice]) AS FLOAT)       AS [OCT_Invoice],
            CAST(MAX(a.[OCT-Raised])  AS FLOAT)       AS [OCT_Raised],
            CAST(SUM(a.[OCT-Collect]) AS FLOAT)       AS [OCT_Collect],
            CAST(SUM(a.[OCT-Credit])  AS FLOAT)       AS [OCT_Credit],
            CAST(MAX(a.[NOV-Invoice]) AS FLOAT)       AS [NOV_Invoice],
            CAST(MAX(a.[NOV-Raised])  AS FLOAT)       AS [NOV_Raised],
            CAST(SUM(a.[NOV-Collect]) AS FLOAT)       AS [NOV_Collect],
            CAST(SUM(a.[NOV-Credit])  AS FLOAT)       AS [NOV_Credit],
            CAST(MAX(a.[DEC-Invoice]) AS FLOAT)       AS [DEC_Invoice],
            CAST(MAX(a.[DEC-Raised])  AS FLOAT)       AS [DEC_Raised],
            CAST(SUM(a.[DEC-Collect]) AS FLOAT)       AS [DEC_Collect],
            CAST(SUM(a.[DEC-Credit])  AS FLOAT)       AS [DEC_Credit],
            CAST(SUM(a.[Year1-Jan-Collect]) AS FLOAT) AS [Year1_Jan_Collect],
            CAST(SUM(a.[Year1-Jan-Credit]) AS FLOAT)  AS [Year1_Jan_Credit],
            CAST(SUM(a.[Year1-Feb-Collect]) AS FLOAT) AS [Year1_Feb_Collect],
            CAST(SUM(a.[Year1-Feb-Credit]) AS FLOAT)  AS [Year1_Feb_Credit],
            CAST(SUM(a.[Year1-Mar-Collect]) AS FLOAT) AS [Year1_Mar_Collect],
            CAST(SUM(a.[Year1-Mar-Credit]) AS FLOAT)  AS [Year1_Mar_Credit],
            CAST(SUM(a.[Year1-Apr-Collect]) AS FLOAT) AS [Year1_Apr_Collect],
            CAST(SUM(a.[Year1-Apr-Credit]) AS FLOAT)  AS [Year1_Apr_Credit],
            CAST(SUM(a.[Year1-May-Collect]) AS FLOAT) AS [Year1_May_Collect],
            CAST(SUM(a.[Year1-May-Credit]) AS FLOAT)  AS [Year1_May_Credit],
            CAST(SUM(a.[Year1-Jun-Collect]) AS FLOAT) AS [Year1_Jun_Collect],
            CAST(SUM(a.[Year1-Jun-Credit]) AS FLOAT)  AS [Year1_Jun_Credit],
            CAST(SUM(a.[Year1-Jul-Collect]) AS FLOAT) AS [Year1_Jul_Collect],
            CAST(SUM(a.[Year1-Jul-Credit]) AS FLOAT)  AS [Year1_Jul_Credit],
            CAST(SUM(a.[Year1-Aug-Collect]) AS FLOAT) AS [Year1_Aug_Collect],
            CAST(SUM(a.[Year1-Aug-Credit]) AS FLOAT)  AS [Year1_Aug_Credit],
            CAST(SUM(a.[Year1-Sep-Collect]) AS FLOAT) AS [Year1_Sep_Collect],
            CAST(SUM(a.[Year1-Sep-Credit]) AS FLOAT)  AS [Year1_Sep_Credit],
            CAST(SUM(a.[Year1-Oct-Collect]) AS FLOAT) AS [Year1_Oct_Collect],
            CAST(SUM(a.[Year1-Oct-Credit]) AS FLOAT)  AS [Year1_Oct_Credit],
            CAST(SUM(a.[Year1-Nov-Collect]) AS FLOAT) AS [Year1_Nov_Collect],
            CAST(SUM(a.[Year1-Nov-Credit]) AS FLOAT)  AS [Year1_Nov_Credit],
            CAST(SUM(a.[Year1-Dec-Collect]) AS FLOAT) AS [Year1_Dec_Collect],
            CAST(SUM(a.[Year1-Dec-Credit]) AS FLOAT)  AS [Year1_Dec_Credit],
            CAST(SUM(a.[Year2-Jan-Collect]) AS FLOAT) AS [Year2_Jan_Collect],
            CAST(SUM(a.[Year2-Jan-Credit]) AS FLOAT)  AS [Year2_Jan_Credit],
            CAST(SUM(a.[Year2-Feb-Collect]) AS FLOAT) AS [Year2_Feb_Collect],
            CAST(SUM(a.[Year2-Feb-Credit]) AS FLOAT)  AS [Year2_Feb_Credit],
            CAST(SUM(a.[Year2-Mar-Collect]) AS FLOAT) AS [Year2_Mar_Collect],
            CAST(SUM(a.[Year2-Mar-Credit]) AS FLOAT)  AS [Year2_Mar_Credit],
            CAST(SUM(a.[Year2-Apr-Collect]) AS FLOAT) AS [Year2_Apr_Collect],
            CAST(SUM(a.[Year2-Apr-Credit]) AS FLOAT)  AS [Year2_Apr_Credit],
            CAST(SUM(a.[Year2-May-Collect]) AS FLOAT) AS [Year2_May_Collect],
            CAST(SUM(a.[Year2-May-Credit]) AS FLOAT)  AS [Year2_May_Credit],
            CAST(SUM(a.[Year2-Jun-Collect]) AS FLOAT) AS [Year2_Jun_Collect],
            CAST(SUM(a.[Year2-Jun-Credit]) AS FLOAT)  AS [Year2_Jun_Credit],
            CAST(SUM(a.[Year2-Jul-Collect]) AS FLOAT) AS [Year2_Jul_Collect],
            CAST(SUM(a.[Year2-Jul-Credit]) AS FLOAT)  AS [Year2_Jul_Credit],
            CAST(SUM(a.[Year2-Aug-Collect]) AS FLOAT) AS [Year2_Aug_Collect],
            CAST(SUM(a.[Year2-Aug-Credit]) AS FLOAT)  AS [Year2_Aug_Credit],
            CAST(SUM(a.[Year2-Sep-Collect]) AS FLOAT) AS [Year2_Sep_Collect],
            CAST(SUM(a.[Year2-Sep-Credit]) AS FLOAT)  AS [Year2_Sep_Credit],
            CAST(SUM(a.[Year2-Oct-Collect]) AS FLOAT) AS [Year2_Oct_Collect],
            CAST(SUM(a.[Year2-Oct-Credit]) AS FLOAT)  AS [Year2_Oct_Credit],
            CAST(SUM(a.[Year2-Nov-Collect]) AS FLOAT) AS [Year2_Nov_Collect],
            CAST(SUM(a.[Year2-Nov-Credit]) AS FLOAT)  AS [Year2_Nov_Credit],
            CAST(SUM(a.[Year2-Dec-Collect]) AS FLOAT) AS [Year2_Dec_Collect],
            CAST(SUM(a.[Year2-Dec-Credit]) AS FLOAT)  AS [Year2_Dec_Credit],
            CAST(SUM(a.[Year3-Collect])     AS FLOAT) AS [Year3_Collect],
            CAST(SUM(a.[Year3-Credit])      AS FLOAT) AS [Year3_Credit],
            CAST(SUM(a.[Year4+Collect])     AS FLOAT) AS [Year4_Plus_Collect],
            CAST(SUM(a.[Year4+Credit])      AS FLOAT) AS [Year4_Plus_Credit]
    INTO #TempInvoices3
    FROM  #TempInvoices a 
    GROUP BY  
            a.Industry,
            a.DebtorStatus,
            a.dr_yyyy,
            a.ControlNumber,
            a.underwriting_yyyy,
            a.Product,
            a.dr_no,
            a.name,
            a.DocumentNo,
            a.ProdOption,
            a.[120DaysBalance],
            a.Type;

    DROP INDEX IF EXISTS #TempInvoices3_idx ON #TempInvoices3;
    CREATE CLUSTERED INDEX #TempInvoices3_idx ON #TempInvoices3 (dr_yyyy, Type, dr_no);

    SET @Msg = '1.4 : ' + CAST(DATEDIFF(SECOND, @Step, GETDATE()) AS VARCHAR(50)) + ' seconds. #TempInvoices3';
    RAISERROR (@Msg, 10, 1) WITH NOWAIT;

    SELECT *
    FROM   #TempInvoices3
    WHERE  Type = 'Interest'
    ORDER BY Type;
END
GO
