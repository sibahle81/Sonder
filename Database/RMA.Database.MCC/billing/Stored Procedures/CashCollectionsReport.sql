CREATE PROCEDURE [billing].[CashCollectionsReport]
       @StartDate     DATE,
       @EndDate       DATE,
       @IndustryId    VARCHAR(25) = '0',   -- comma list or '0'
       @ProductId     VARCHAR(25) = '-1'   -- comma list or '-1'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EndDatePlus1 DATE = DATEADD(DAY, 1, @EndDate);

    DECLARE @tvpIndustry TABLE (Id INT PRIMARY KEY);
    DECLARE @tvpProduct  TABLE (Id INT PRIMARY KEY);

    IF @IndustryId <> '0'
        INSERT INTO @tvpIndustry
        SELECT DISTINCT TRY_CAST(value AS INT)
        FROM STRING_SPLIT(@IndustryId, ',')
        WHERE TRY_CAST(value AS INT) IS NOT NULL;

    IF @ProductId <> '-1'
        INSERT INTO @tvpProduct
        SELECT DISTINCT TRY_CAST(value AS INT)
        FROM STRING_SPLIT(@ProductId, ',')
        WHERE TRY_CAST(value AS INT) IS NOT NULL;

    /* main query */
    WITH Tx AS
    (
        SELECT
            AC.Level3                     AS ControlNumber,
            AC.ChartIsName                AS ControlName,
            YEAR(T.CreatedDate)           AS [Year],
            MONTH(T.TransactionDate)      AS Period,
            DATENAME(MONTH,T.TransactionDate) AS PeriodMonth,
            icd.Name                      AS Industry,
            F.FinPayeNumber               AS AccountNumber,
            R.DisplayName                 AS DebtorName,
            ISNULL(ISNULL(I.InvoiceNumber,BI.InvoiceNumber), T.RmaReference)
                                          AS InvoiceNumber,
            T.CreatedDate                 AS InvoiceDate,
            ISNULL(YEAR(I.InvoiceDate), YEAR(T.CreatedDate))
                                          AS UnderwritingYear,
            CASE WHEN T.TransactionTypeId IN (6,4)
                 THEN CASE WHEN ttl.IsDebit = 1 THEN T.Amount ELSE -T.Amount END
                 ELSE 0 END               AS InvoiceAmount,
            T.RmaReference                AS ReferenceNumber,
            TT.Name                       AS TransactionType,
            CAST(T.CreatedDate AS DATE)   AS TransactionDate,
            CASE WHEN T.TransactionTypeId IN (3,1)
                 THEN CASE WHEN ttl.IsDebit = 1 THEN T.Amount ELSE -T.Amount END
                 ELSE 0 END               AS TransactionAmount,
            DATENAME(MONTH, ISNULL(ISNULL(I.CreatedDate,BI.CreatedDate),
                                   T.CreatedDate))         AS InvoiceMonth,
            T.TransactionTypeId,
            ppr.Name                      AS ProductName,
            CASE WHEN ppr.UnderwriterId = 1 THEN 'Coid' ELSE 'Non-Coid' END
                                          AS ProductCategory
        FROM billing.Transactions            T  WITH (NOLOCK)
        JOIN billing.AbilityTransactionsAudit AT WITH (NOLOCK)
                   ON AT.TransactionId = T.TransactionId
                  AND AT.IsDeleted   = 0
        JOIN billing.AbilityCollections      AC WITH (NOLOCK)
                   ON AC.Reference = AT.Reference
        JOIN client.FinPayee                  F  WITH (NOLOCK)
                   ON F.RolePlayerId = T.RolePlayerId
        JOIN client.RolePlayer                R  WITH (NOLOCK)
                   ON R.RolePlayerId = F.RolePlayerId
        JOIN common.TransactionType           TT WITH (NOLOCK)
                   ON TT.Id = T.TransactionTypeId
        JOIN common.Industry                  IC WITH (NOLOCK)
                   ON IC.Id = F.IndustryId
        JOIN common.IndustryClass             icd WITH (NOLOCK)
                   ON icd.Id = IC.IndustryClassId
        JOIN billing.TransactionTypeLink      ttl WITH (NOLOCK)
                   ON ttl.Id = T.TransactionTypeLinkId
        LEFT JOIN billing.Invoice             I   WITH (NOLOCK)
                   ON I.InvoiceId = T.InvoiceId
        LEFT JOIN billing.Invoice             BI  WITH (NOLOCK)
                   ON BI.InvoiceNumber = T.RmaReference
        LEFT JOIN policy.Policy               P1  WITH (NOLOCK)
                   ON P1.PolicyId = COALESCE(I.PolicyId, BI.PolicyId)

        --deterministic single-row fall-back policy (at most one) 
        OUTER APPLY (
            SELECT TOP (1) p2.*
            FROM policy.Policy p2           WITH (NOLOCK)
            JOIN billing.InvoiceAllocation ia  WITH (NOLOCK)
                      ON ia.TransactionId = T.TransactionId
            JOIN billing.Invoice          i2  WITH (NOLOCK)
                      ON i2.InvoiceId = ia.InvoiceId
                     AND i2.PolicyId  = p2.PolicyId
            WHERE p2.PolicyOwnerId = F.RolePlayerId
              AND P1.PolicyId IS NULL
            ORDER BY p2.PolicyId           
        ) P2

        -- downstream product joins use coalesce of P1/P2 
        LEFT JOIN product.ProductOption       prod WITH (NOLOCK)
                   ON prod.Id = COALESCE(P1.ProductOptionId,
                                          P2.ProductOptionId)
        LEFT JOIN product.Product             ppr  WITH (NOLOCK)
                   ON ppr.Id = prod.ProductId

        WHERE  T.TransactionTypeId IN (3,4,6,1)
          AND  T.CreatedDate  >= @StartDate
          AND  T.CreatedDate  < @EndDatePlus1
          AND  T.IsDeleted    = 0
          AND  AC.IsBilling   = 1
          AND  T.Amount       <> 0

          /* product filter */
          AND (NOT EXISTS (SELECT 1 FROM @tvpProduct)
               OR ppr.Id IN (SELECT Id FROM @tvpProduct))

          /* industry filter */
          AND (NOT EXISTS (SELECT 1 FROM @tvpIndustry)
               OR icd.Id IN (SELECT Id FROM @tvpIndustry))
    )

    SELECT DISTINCT
           ControlNumber, ControlName, [Year], Period, PeriodMonth, Industry,
           AccountNumber, DebtorName, InvoiceNumber, InvoiceDate,
           UnderwritingYear, InvoiceAmount, ReferenceNumber,
           TransactionType, TransactionDate, TransactionAmount,
           InvoiceMonth, ProductName, ProductCategory
    FROM Tx;
END
GO
