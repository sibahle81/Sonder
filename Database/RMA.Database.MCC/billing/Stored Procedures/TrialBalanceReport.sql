/* -----------------------------------------------------------
  TrialBalanceReport (2025-06-22)
  -------------------------------------------------------------
  PARAMETERS
    @FromMonth   – first month (1-12)
    @ToMonth     – last  month (1-12)
    @CompanyIds  – comma list of CompanyNo to include or NULL / '' for “ALL”
  OUTPUT
    One row per Company × GL Chart plus
    “TOTAL TRIAL BALANCE” row per company and a grand total row.
   --------------------------------------------------------------*/
CREATE PROCEDURE billing.TrialBalanceReport
       @StartDate    date ,                  
       @EndDate      date ,                  
       @CompanyIds  varchar(max) = NULL     -- ‘1,2,3’ or NULL / '' for ALL
AS
BEGIN
    SET NOCOUNT ON;

    IF @StartDate IS NULL OR @EndDate IS NULL
    BEGIN
        RAISERROR('Both @StartDate and @EndDate are required.',16,1); RETURN;
    END;
    IF @StartDate > @EndDate
    BEGIN
        RAISERROR('@StartDate cannot be after @EndDate.',16,1); RETURN;
    END;

    DECLARE @PeriodStart   date = DATEFROMPARTS(YEAR(@StartDate), MONTH(@StartDate), 1);  -- first day of @StartDate’s month
    DECLARE @PeriodEnd     date = EOMONTH(@EndDate);                                      -- last  day of @EndDate’s month
    DECLARE @OpeningCutOff date = EOMONTH(DATEADD(MONTH,-1,@PeriodStart));               -- end of month before period


    DECLARE @tvpCompany TABLE (CompanyNo int PRIMARY KEY);
    IF ISNULL(@CompanyIds,'') <> ''
        INSERT INTO @tvpCompany
        SELECT DISTINCT TRY_CAST(value AS int)
        FROM string_split(@CompanyIds,',')
        WHERE TRY_CAST(value AS int) IS NOT NULL;

   -- Base transaction set/
    ;WITH Tx AS
    (
        SELECT
            ac.CompanyNo,
            ac.BranchNo,
            ac.Level1,
            ac.Level2,
            ac.Level3,
            FORMAT(t.TransactionDate,'yyyy/MM')           AS PeriodKey,      -- yyyy/MM for report
            CASE WHEN ac.TransactionType IN ('Invoice','Credit Note','Invoice Reversal')
                 THEN ac.ChartISNo ELSE ac.ChartBSNo END  AS ChartCode,
            ac.ChartIsName                                AS ChartName,
            CASE WHEN ac.TransactionType = 'Invoice'
                 THEN ISNULL(i.InvoiceNumber,'')
                 ELSE COALESCE(NULLIF(t.RmaReference,''),t.BankReference,'')
            END                                           AS ItemReference,
            at.Amount                                     AS AmountSigned,
            t.TransactionDate,
            at.[Reference]                                AS [Description]
        FROM  billing.AbilityCollections       ac  WITH (NOLOCK)
        JOIN  billing.AbilityTransactionsAudit at  WITH (NOLOCK)
                   ON at.[Reference]  = ac.[Reference]
        JOIN  billing.Transactions             t   WITH (NOLOCK)
                   ON t.TransactionId = at.TransactionId
        LEFT JOIN billing.Invoice              i   WITH (NOLOCK)
                   ON i.InvoiceId     = t.InvoiceId
        WHERE ac.IsBilling = 1
          AND t.TransactionDate <= @PeriodEnd
          AND (NOT EXISTS (SELECT 1 FROM @tvpCompany)
               OR ac.CompanyNo IN (SELECT CompanyNo FROM @tvpCompany))
    ),

    -- Opening balances: everything up to the month before the range
    Opening AS
    (
        SELECT CompanyNo, ChartCode,
               SUM(AmountSigned) AS OpeningBal
        FROM   Tx
        WHERE  TransactionDate <= @OpeningCutOff
        GROUP  BY CompanyNo, ChartCode
    ),

    -- Movements inside requested period
    Movement AS
    (
        SELECT CompanyNo, ChartCode,
               SUM(AmountSigned) AS PeriodMov
        FROM   Tx
        WHERE  TransactionDate BETWEEN @PeriodStart AND @PeriodEnd
        GROUP  BY CompanyNo, ChartCode
    )

   -- Final projection with company totals & grand total
    SELECT
        MAX(tx.PeriodKey)                               AS [Date],             -- yyyy/MM
        CASE WHEN GROUPING(tx.CompanyNo)=1
             THEN 'TOTAL TRIAL BALANCE'
             ELSE CAST(tx.CompanyNo AS varchar(10))
        END                                             AS Company,
        COALESCE(o.ChartCode , m.ChartCode)             AS Code,
        MAX(tx.ChartName)                               AS [Description],
        ISNULL(MAX(o.OpeningBal),  0.00)                AS OpeningBalance,
        ISNULL(MAX(m.PeriodMov),   0.00)                AS MonthlyMovements,
        ISNULL(MAX(m.PeriodMov),   0.00) -
        ISNULL(MAX(o.OpeningBal),  0.00)                AS ClosingBalance
    FROM        Tx                    tx
    LEFT JOIN   Opening   o  ON o.CompanyNo = tx.CompanyNo
                             AND o.ChartCode = tx.ChartCode
    LEFT JOIN   Movement  m  ON m.CompanyNo = tx.CompanyNo
                             AND m.ChartCode = tx.ChartCode
    GROUP BY    GROUPING SETS
               ( (tx.CompanyNo, COALESCE(o.ChartCode , m.ChartCode)),  -- detail rows
                 (tx.CompanyNo),                                       -- per-company subtotals
                 () )                                                  -- grand total
    HAVING      GROUPING(tx.CompanyNo)=0
                OR GROUPING(COALESCE(o.ChartCode , m.ChartCode))=0
                OR (GROUPING(tx.CompanyNo)=1 AND GROUPING(COALESCE(o.ChartCode , m.ChartCode))=1)
    ORDER BY    CASE WHEN GROUPING(tx.CompanyNo)=1 AND GROUPING(COALESCE(o.ChartCode , m.ChartCode))=1
                     THEN 2 ELSE 1 END,
                Company,
                Code;
END
GO
