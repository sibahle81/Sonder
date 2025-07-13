CREATE PROCEDURE [billing].[InterestCalculationReport]
      @StartDate        date ,          -- e.g. '2024-01-01'
      @EndDate          date ,          -- e.g. '2024-12-31'
      @ProductId        varchar(25) = '-1',
      @IndustryId       varchar(25) =  '0',
      @UnderwritingYear char(4)    =  NULL         -- '2024'
AS
BEGIN
    SET NOCOUNT ON;


    DECLARE @tblProd table (ProdId int primary key);
    DECLARE @tblInd  table (ClassId int primary key);

    IF @ProductId <> '-1'
        INSERT INTO @tblProd (ProdId)
        SELECT TRY_CAST(value AS int)
        FROM STRING_SPLIT(@ProductId, ',')
        WHERE TRY_CAST(value AS int) IS NOT NULL;

    IF @IndustryId <> '0'
        INSERT INTO @tblInd (ClassId)
        SELECT TRY_CAST(value AS int)
        FROM STRING_SPLIT(@IndustryId, ',')
        WHERE TRY_CAST(value AS int) IS NOT NULL;


    ;WITH InterestCTE AS
    (
        SELECT
            ic.[Name]                                        AS Industry,
            prod.[Name]                                      AS Product,
            pp.PolicyNumber,
            fp.FinPayeNumber                                 AS DebtorNumber,
            rp.DisplayName                                   AS DebtorName,

            SUM(CASE WHEN btt.TransactionTypeLinkId = 1
                     THEN  btt.Amount          -- debit
                     ELSE -btt.Amount          -- credit
                END)                                         AS Balance,

            CAST(btt.TransactionDate AS date)                AS TransactionDate,
            REPLACE(btt.Reason,'12:','') + ' - ' + btt.RmaReference
                                                             AS RmaReference,
            SUM(btt.Amount)                                  AS Interest,

            YEAR(bi.InvoiceDate)                             AS UnderwritingYear,
            ctt.[Name]                                       AS TransactionType,

            --- allocation (interest paid) 
            SUM (ia.Amount)           AS InterestPaid,
            MAX (YEAR (ia.CreatedDate))       AS InterestPaidYear,
            MAX (MONTH(ia.CreatedDate))       AS [Period],
            MAX (DATENAME(month,ia.CreatedDate)) AS InterestPaidMonth,

            -- ageing buckets, based on effective / txn date
            SUM(CASE WHEN DATEDIFF(day,
                                   ISNULL(btt.TransactionEffectiveDate,
                                          btt.TransactionDate),
                                   GETDATE())              < 30  THEN btt.Amount ELSE 0 END) AS [Current],

            SUM(CASE WHEN DATEDIFF(day,
                                   ISNULL(btt.TransactionEffectiveDate,
                                          btt.TransactionDate),
                                   GETDATE()) BETWEEN 30 AND 59  THEN btt.Amount ELSE 0 END) AS [30Days],

            SUM(CASE WHEN DATEDIFF(day,
                                   ISNULL(btt.TransactionEffectiveDate,
                                          btt.TransactionDate),
                                   GETDATE()) BETWEEN 60 AND 89  THEN btt.Amount ELSE 0 END) AS [60Days],

            SUM(CASE WHEN DATEDIFF(day,
                                   ISNULL(btt.TransactionEffectiveDate,
                                          btt.TransactionDate),
                                   GETDATE()) BETWEEN 90 AND 119 THEN btt.Amount ELSE 0 END) AS [90Days],

            SUM(CASE WHEN DATEDIFF(day,
                                   ISNULL(btt.TransactionEffectiveDate,
                                          btt.TransactionDate),
                                   GETDATE()) BETWEEN 120 AND 149 THEN btt.Amount ELSE 0 END) AS [120Days],

            SUM(CASE WHEN DATEDIFF(day,
                                   ISNULL(btt.TransactionEffectiveDate,
                                          btt.TransactionDate),
                                   GETDATE()) >= 150            THEN btt.Amount ELSE 0 END) AS [120PlusDays],

            btt.TransactionId                                 AS DebitTransactionId,
            bt.TransactionId                                  AS CreditTransactionId
        FROM  billing.Transactions                 bt  WITH (NOLOCK)
        JOIN  billing.Invoice                      bi  WITH (NOLOCK) ON bi.InvoiceId      = bt.InvoiceId
        JOIN  policy.Policy                        pp  WITH (NOLOCK) ON pp.PolicyId       = bi.PolicyId
        JOIN  billing.Transactions                 btt WITH (NOLOCK) ON btt.LinkedTransactionId = bt.TransactionId
        JOIN  client.RolePlayer                    rp  WITH (NOLOCK) ON rp.RolePlayerId   = pp.PolicyOwnerId
        JOIN  client.FinPayee                      fp  WITH (NOLOCK) ON fp.RolePlayerId   = pp.PolicyOwnerId
        JOIN  common.Industry                      ind WITH (NOLOCK) ON ind.Id            = fp.IndustryId
        JOIN  common.IndustryClass                 ic  WITH (NOLOCK) ON ic.Id             = ind.IndustryClassId
        JOIN  product.ProductOption                ppo WITH (NOLOCK) ON ppo.Id            = pp.ProductOptionId
        JOIN  product.Product                      prod WITH (NOLOCK) ON prod.Id          = ppo.ProductId
        JOIN  common.TransactionType               ctt WITH (NOLOCK) ON ctt.Id            = btt.TransactionTypeId

        LEFT JOIN billing.InvoiceAllocation ia WITH (NOLOCK)
               ON ia.LinkedTransactionId = btt.TransactionId

        JOIN product.ProductOptionBillingIntegration ppbi WITH (NOLOCK)
               ON ppbi.IndustryClassId = ic.Id
              AND ppbi.ProductOptionId = ppo.Id

        WHERE
              btt.TransactionTypeId = 7                       -- Interest debit
          AND btt.CreatedDate BETWEEN @StartDate AND @EndDate
          AND btt.TransactionId NOT IN                       -- exclude reversals
              ( SELECT LinkedTransactionId
                FROM   billing.Transactions WITH (NOLOCK)
                WHERE  TransactionTypeId = 17 )

          AND prod.Id NOT IN (1,2,3)                         
          AND ppbi.AccumulatesInterest = 1

          AND (@UnderwritingYear IS NULL
               OR YEAR(bi.InvoiceDate) = @UnderwritingYear)

          AND (NOT EXISTS (SELECT 1 FROM @tblProd) 
               OR prod.Id IN (SELECT ProdId FROM @tblProd))

          AND (NOT EXISTS (SELECT 1 FROM @tblInd)  
               OR ic.Id   IN (SELECT ClassId FROM @tblInd))

        GROUP BY
              ic.[Name], prod.[Name], pp.PolicyNumber,
              fp.FinPayeNumber, rp.DisplayName,
              CAST(btt.TransactionDate AS date),
			  btt.Reason,
              btt.RmaReference, YEAR(bi.InvoiceDate), ctt.[Name],
              btt.TransactionId, bt.TransactionId
    )

    
     --  Final projection – offset ageing buckets when the allocation amount equals the bucket amount
    SELECT
        Industry, Product, PolicyNumber, DebtorNumber, DebtorName,
        Balance, TransactionDate, RmaReference, Interest,
        UnderwritingYear, TransactionType,
        InterestPaid, InterestPaidYear, [Period], InterestPaidMonth,
        [Current],
        [30Days]      - CASE WHEN InterestPaid <> 0 AND InterestPaid = [30Days]
                              THEN InterestPaid ELSE 0 END              AS [30Days],
        [60Days]      - CASE WHEN InterestPaid <> 0 AND InterestPaid = [60Days]
                              THEN InterestPaid ELSE 0 END              AS [60Days],
        [90Days]      - CASE WHEN InterestPaid <> 0 AND InterestPaid = [90Days]
                              THEN InterestPaid ELSE 0 END              AS [90Days],
        [120Days]     - CASE WHEN InterestPaid <> 0 AND InterestPaid = [120Days]
                              THEN InterestPaid ELSE 0 END              AS [120Days],
        [120PlusDays] - CASE WHEN InterestPaid <> 0 AND InterestPaid = [120PlusDays]
                              THEN InterestPaid ELSE 0 END              AS [120PlusDays]
    FROM InterestCTE
    ORDER BY Industry, Product, PolicyNumber;
END
