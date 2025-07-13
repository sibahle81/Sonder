CREATE PROCEDURE [billing].[TransactionStatemnetLineDetails]
      @invoiceId  INT,
      @startDate  DATE,
      @endDate    DATE,
      @period     INT = 0,
      @year       INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @rolePlayerId INT,
            @ProcEndDate  DATE = DATEADD(DAY, 1, @endDate);

    SELECT @rolePlayerId = PolicyOwnerId
    FROM   [policy].[Policy]
    WHERE  PolicyId = @invoiceId;

    -- All qualifying transactions in ONE set
    ;WITH Tx AS (
        SELECT  t.TransactionId,
                TxDate   = CASE WHEN i.InvoiceDate > GETDATE()
                                THEN i.InvoiceDate
                                ELSE i.CreatedDate
                           END,
                TxType   = tt.Name,
                DocNo    = i.InvoiceNumber,
                Ref      = ISNULL(t.BankReference, p.PolicyNumber),
                Descr    = CASE WHEN t.TransactionReasonId = 6
                                THEN CONCAT('Premium Adj- ', DATENAME(MONTH,i.InvoiceDate))
                                ELSE CONCAT('Premium - '   , DATENAME(MONTH,i.InvoiceDate))
                           END,
                DebitAmt = CASE WHEN tl.IsDebit = 1 THEN t.Amount ELSE 0 END,
                CredAmt  = CASE WHEN tl.IsDebit = 0 THEN t.Amount ELSE 0 END,
                SignAmount = CASE WHEN tl.IsDebit = 1 THEN  t.Amount
                                  ELSE -t.Amount
                             END,
                Created  = t.CreatedDate,
                KeepRow  = 1         -- always keep invoice rows
        FROM   [billing].[Invoice]            i
        JOIN   [billing].[Transactions]       t  ON i.InvoiceId = t.InvoiceId
        JOIN   [policy].[Policy]              p  ON p.PolicyId  = i.PolicyId
        JOIN   [common].[TransactionType]     tt ON tt.Id       = t.TransactionTypeId
        JOIN   [billing].[TransactionTypeLink]tl ON tl.Id       = t.TransactionTypeLinkId
        WHERE  t.RolePlayerId       = @rolePlayerId
          AND  t.TransactionTypeId  = 6        -- invoice
          AND  t.TransactionId NOT IN (SELECT DISTINCT LinkedTransactionId
                                       FROM [billing].[Transactions]
                                       WHERE TransactionTypeId = 5)         -- allocations
          AND  t.IsDeleted = 0

        UNION ALL
        SELECT  t.TransactionId,
                t.CreatedDate,
                tt.Name,
                CASE WHEN ISNULL(t.BankReference,'') = '' THEN t.RmaReference ELSE t.BankReference END,
                CASE WHEN ISNULL(t.BankReference,'') = '' THEN t.RmaReference ELSE t.BankReference END,
                CONCAT('Payment - ',
                       DATENAME(MONTH, COALESCE(pr.StartDate, t.TransactionDate))),
                0,
                t.Amount,
                -t.Amount,             -- credit is negative for running total
                t.CreatedDate,
                1
        FROM   [billing].[Transactions]       t
        JOIN   [client].[RolePlayer]          rp ON rp.RolePlayerId = t.RolePlayerId
        JOIN   [common].[TransactionType]     tt ON tt.Id           = t.TransactionTypeId
        JOIN   [billing].[TransactionTypeLink]tl ON tl.Id           = t.TransactionTypeLinkId
        OUTER APPLY ( SELECT TOP(1) *
                      FROM [common].[Period] pr
                      WHERE t.TransactionDate BETWEEN pr.StartDate AND pr.EndDate
                    ) pr
        WHERE  t.RolePlayerId      = @rolePlayerId
          AND  tl.IsDebit          = 0
          AND  t.TransactionTypeId = 3          -- payments
          AND  t.IsDeleted         = 0

        UNION ALL
        SELECT  t.TransactionId,
                t.CreatedDate,
                tt.Name,
                CASE WHEN ISNULL(t.BankReference,'') = '' THEN t.RmaReference ELSE t.BankReference END,
                CASE WHEN ISNULL(t.BankReference,'') = '' THEN t.RmaReference ELSE t.BankReference END,
                CONCAT('Credit Note - ', ctr.Name, ' ',
                       DATENAME(MONTH, COALESCE(pr.StartDate, t.TransactionDate))),
                0,
                t.Amount,
                -t.Amount,
                t.CreatedDate,
                1
        FROM   [billing].[Transactions]       t
        JOIN   [common].[TransactionType]     tt  ON tt.Id  = t.TransactionTypeId
        JOIN   [billing].[TransactionTypeLink]tl  ON tl.Id  = t.TransactionTypeLinkId
        LEFT  JOIN [Common].[TransactionReason] ctr ON ctr.Id = t.TransactionReasonId
        OUTER APPLY ( SELECT TOP 1 *
                      FROM [common].[Period] pr
                      WHERE t.TransactionDate BETWEEN pr.StartDate AND pr.EndDate
                    ) pr
        WHERE  t.RolePlayerId      = @rolePlayerId
          AND  tl.IsDebit          = 0
          AND  t.TransactionTypeId = 4          -- credit notes
          AND  t.IsDeleted         = 0

        UNION ALL
        SELECT  t.TransactionId,
                t.CreatedDate,
                tt.Name,
                CASE WHEN ISNULL(t.BankReference,'') = '' THEN t.RmaReference ELSE t.BankReference END,
                CASE WHEN ISNULL(t.BankReference,'') = '' THEN t.RmaReference ELSE t.BankReference END,
                CONCAT('Credit Reallocation - ',
                       DATENAME(MONTH, COALESCE(pr.StartDate, t.TransactionDate))),
                0,
                t.Amount,
                -t.Amount,
                t.CreatedDate,
                1
        FROM   [billing].[Transactions]       t
        JOIN   [common].[TransactionType]     tt  ON tt.Id  = t.TransactionTypeId
        JOIN   [billing].[TransactionTypeLink]tl  ON tl.Id  = t.TransactionTypeLinkId
        OUTER APPLY ( SELECT TOP 1 *
                      FROM [common].[Period] pr
                      WHERE t.TransactionDate BETWEEN pr.StartDate AND pr.EndDate
                    ) pr
        WHERE  t.RolePlayerId      = @rolePlayerId
          AND  tl.IsDebit          = 0
          AND  t.TransactionTypeId = 19         -- credit reallocation
          AND  t.IsDeleted         = 0

        UNION ALL
        SELECT  t.TransactionId,
                t.CreatedDate,
                tt.Name,
                CASE WHEN ISNULL(t.BankReference,'') = '' THEN t.RmaReference ELSE t.BankReference END,
                CASE WHEN t.TransactionTypeId = 7
                     THEN REPLACE(t.Reason, '12:','')
                     ELSE CASE WHEN ISNULL(t.BankReference,'') = ''
                               THEN t.RmaReference ELSE t.BankReference END
                END,
                CASE WHEN t.TransactionTypeId = 7
                     THEN CONCAT(tt.Name, ' - ', DATENAME(MONTH, COALESCE(pr.EndDate, t.TransactionEffectiveDate)))
                     ELSE CONCAT(tt.Name, ' - ', DATENAME(MONTH, COALESCE(pr.StartDate, t.CreatedDate)))
                END,
                CASE WHEN tl.IsDebit = 1 THEN t.Amount ELSE 0 END,
                CASE WHEN tl.IsDebit = 0 THEN t.Amount ELSE 0 END,
                CASE WHEN tl.IsDebit = 1 THEN  t.Amount ELSE -t.Amount END,
                t.CreatedDate,
                1
        FROM   [billing].[Transactions]       t
        JOIN   [common].[TransactionType]     tt  ON tt.Id = t.TransactionTypeId
        JOIN   [billing].[TransactionTypeLink]tl  ON tl.Id = t.TransactionTypeLinkId
        OUTER APPLY ( SELECT TOP 1 *
                      FROM [common].[Period] pr
                      WHERE t.CreatedDate BETWEEN pr.StartDate AND pr.EndDate
                    ) pr
        WHERE  t.RolePlayerId = @rolePlayerId
          AND  t.TransactionTypeId NOT IN (4,6,3,19,5,8,17)
          AND  t.IsDeleted = 0
          AND  t.TransactionId NOT IN ( SELECT DISTINCT LinkedTransactionId
                                        FROM [billing].[Transactions]
                                        WHERE TransactionTypeId = 17)

        UNION ALL
        SELECT  t.TransactionId,
                t.CreatedDate,
                'Refund',
                CASE WHEN ISNULL(t.BankReference,'') = '' THEN t.RmaReference ELSE t.BankReference END,
                CASE WHEN ISNULL(t.BankReference,'') = '' THEN t.RmaReference ELSE t.BankReference END,
                CONCAT('Refund - ', DATENAME(MONTH, COALESCE(pr.StartDate, t.TransactionDate))),
                t.Amount,
                0,
                t.Amount,      -- debit is positive for running total
                t.CreatedDate,
                -- keep only rowNum = 1 later …
                ROW_NUMBER() OVER (PARTITION BY t.TransactionId ORDER BY t.CreatedDate, t.TransactionId)
        FROM   [billing].[Transactions]       t
        JOIN   [billing].[TransactionTypeLink]tl ON tl.Id = t.TransactionTypeLinkId
        OUTER APPLY ( SELECT TOP 1 *
                      FROM [common].[Period] pr
                      WHERE t.TransactionDate BETWEEN pr.StartDate AND pr.EndDate
                    ) pr
        WHERE  t.RolePlayerId      = @rolePlayerId
          AND  tl.IsDebit          = 1
          AND  t.TransactionTypeId = 8
          AND  t.IsDeleted = 0
    )

    -- Add Year, Period, Running balance
    , TxEnriched AS (
        SELECT
            TransactionId,
            TxDate,
            TxType,
            DocNo,
            Ref,
            Descr,
            DebitAmt,
            CredAmt,
            Amount      = ABS(SignAmount),              -- original “Amount” column
            Balance     = SUM(SignAmount) OVER (ORDER BY TxDate, TransactionId
                                                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW),
            [Year]      = YEAR(TxDate),
            [Period]    = MONTH(COALESCE(prP.StartDate, TxDate)),
            Created     = Created,
            KeepRow
        FROM   Tx
        OUTER APPLY ( SELECT TOP 1 *
                      FROM [common].[Period] prP
                      WHERE Tx.TxDate BETWEEN prP.StartDate AND prP.EndDate
                    ) prP
    )

    SELECT
           TxDate        AS TransactionDate,
           TxType        AS TransactionType,
           DocNo         AS DocumentNumber,
           Ref           AS Reference,
           Descr         AS [Description],
           DebitAmt,
           CredAmt,
           Balance,
           Amount,
           [Year],
           [Period]
    FROM TxEnriched
    WHERE (TxType NOT IN ('Payment Allocation','Payment Allocation Reversal',
                          'Claim Recovery Invoice', 'Claim Recovery Payment',
                          'Claim Recovery Payment Reversal'))
      AND Amount <> 0
      AND ( @period = 0 OR @period IS NULL OR [Period] = @period )
      AND ( @year   = 0 OR @year   IS NULL OR [Year]   = @year   )
      AND ( @startDate IS NULL OR TxDate >= @startDate )
      AND ( @endDate   IS NULL OR TxDate <  @ProcEndDate )
      AND ( NOT ( TxType = 'Refund' AND KeepRow <> 1 ) )   -- keep only first refund row
    ORDER BY TxDate, TransactionId;
END
GO
