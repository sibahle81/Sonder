CREATE  PROCEDURE [billing].[InterestPaidReport]
    @StartDate     date ,
    @EndDate       date ,
    @ProductId     varchar(25) = '-1',   -- comma list or -1 = all
    @IndustryId    varchar(25) = '0',     -- comma list or  0 = all
	@UnderwritingYear CHAR(4)     = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Prod TABLE (Id int PRIMARY KEY);
    DECLARE @Ind  TABLE (Id int PRIMARY KEY);

    IF @ProductId <> '-1'
        INSERT @Prod (Id)
        SELECT DISTINCT TRY_CAST(value AS int)
        FROM   string_split(@ProductId, ',')
        WHERE  TRY_CAST(value AS int) IS NOT NULL;

    IF @IndustryId <> '0'
        INSERT @Ind (Id)
        SELECT DISTINCT TRY_CAST(value AS int)
        FROM   string_split(@IndustryId, ',')
        WHERE  TRY_CAST(value AS int) IS NOT NULL;

    DECLARE @CurrYear int = YEAR(@EndDate);

   ;WITH y AS
(   /* year offsets 0-4 */  SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2
    UNION ALL SELECT 3 UNION ALL SELECT 4
),
m AS
(   /* months 1-12   */     SELECT 1 m UNION ALL SELECT 2 UNION ALL SELECT 3
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
    SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
    SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
),
YearMonth AS
(   SELECT  Year  = @CurrYear - y.n ,
            Month = m.m ,
            PeriodKey = FORMAT(DATEFROMPARTS(@CurrYear - y.n, m.m, 1), N'yyyy-MM'),
            MonthName = DATENAME(month, DATEFROMPARTS(2000, m.m, 1))
    FROM y CROSS JOIN m
),
Fact AS
(  
   SELECT
            ic.Name                                  AS Industry,
            pr.Name                                  AS Product,
            pp.PolicyNumber,
            fp.FinPayeNumber                         AS DebtorNumber,
            rp.DisplayName                           AS DebtorName,
            SUM(CASE WHEN bt.TransactionTypeLinkId = 1
                     THEN bt.Amount ELSE -bt.Amount END)         AS Balance,
            btt.TransactionDate,
            btt.RmaReference,
            SUM(btt.Amount)                                   AS Interest,
            YEAR(bi.InvoiceDate)                              AS UnderwritingYear,
            ctt.Name                                          AS TransactionType,
            SUM(bda.Amount)                                   AS InterestPaid,
            YEAR(bda.CreatedDate)                             AS InterestPaidYear,
            FORMAT(ISNULL(cp.StartDate, bda.CreatedDate), 'yyyy-MM') AS PeriodKey
        FROM   billing.InvoiceAllocation              bda  
        JOIN   billing.Invoice                        bi   ON bi.InvoiceId = bda.InvoiceId
		JOIN   billing.Transactions                   bt   ON (bt.InvoiceId = bi.InvoiceId AND bt.TransactionTypeId = 6)
        JOIN   policy.Policy                          pp   ON pp.PolicyId   = bi.PolicyId
        JOIN   billing.Transactions                   btt  ON btt.TransactionId = bda.LinkedTransactionId
        JOIN   client.RolePlayer                      rp   ON rp.RolePlayerId = pp.PolicyOwnerId
        JOIN   client.FinPayee                        fp   ON fp.RolePlayerId = rp.RolePlayerId
        JOIN   common.Industry                        ind  ON ind.Id          = fp.IndustryId
        JOIN   common.IndustryClass                   ic   ON ic.Id           = ind.IndustryClassId
        JOIN   product.ProductOption                  ppo  ON ppo.Id          = pp.ProductOptionId
        JOIN   product.Product                        pr   ON pr.Id           = ppo.ProductId
        JOIN   common.TransactionType                 ctt  ON ctt.Id          = btt.TransactionTypeId
        JOIN   product.ProductOptionBillingIntegration ppbi
                                                           ON ppbi.IndustryClassId = ic.Id
                                                          AND ppbi.ProductOptionId = ppo.Id
        LEFT  JOIN common.Period                      cp   ON cp.Id           = bt.PeriodId
        WHERE
              btt.TransactionTypeId = 7                       -- interest raised
          AND bda.CreatedDate BETWEEN @StartDate AND @EndDate -- interest paid window
		  AND bda.BillingAllocationTypeId IN (2,3)
          AND (NOT EXISTS (SELECT 1 FROM @Prod) OR pr.Id IN (SELECT Id FROM @Prod))
          AND (NOT EXISTS (SELECT 1 FROM @Ind)  OR ic.Id IN (SELECT Id FROM @Ind))
          AND ISNULL(bt.Reason, '') NOT LIKE '%Write%'
          AND pr.Id NOT IN (1,2,3)                            
          AND ppbi.AccumulatesInterest = 1
		  AND (@UnderwritingYear IS NULL
               OR YEAR(bi.InvoiceDate) = @UnderwritingYear)
        GROUP BY
              ic.Name, pr.Name, pp.PolicyNumber, fp.FinPayeNumber, rp.DisplayName,
              btt.TransactionDate, btt.RmaReference,
              YEAR(bi.InvoiceDate), ctt.Name,
              YEAR(bda.CreatedDate), FORMAT(ISNULL(cp.StartDate, bda.CreatedDate), 'yyyy-MM')
)
SELECT      ym.MonthName      AS [Month],
            ym.Year           AS InterestPaidYear,
            f.Industry,
            f.Product,
            f.PolicyNumber,
            f.DebtorNumber,
            f.DebtorName,
            f.UnderwritingYear,
            f.TransactionType,
            SUM(f.Interest)   AS InterestRaised,
            SUM(f.InterestPaid) AS InterestPaid
FROM        YearMonth  ym
LEFT JOIN   Fact       f ON f.PeriodKey = ym.PeriodKey
GROUP BY    ym.Year, ym.Month, ym.MonthName,
            f.Industry, f.Product, f.PolicyNumber,
            f.DebtorNumber, f.DebtorName,
            f.UnderwritingYear, f.TransactionType
ORDER BY    ym.Year DESC, ym.Month, f.Industry, f.Product, f.PolicyNumber;

END
