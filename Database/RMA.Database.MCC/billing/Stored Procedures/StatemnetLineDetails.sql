CREATE PROCEDURE [billing].[StatemnetLineDetails]
    @policyIds VARCHAR(100) = '-1'
AS
BEGIN
    SET NOCOUNT ON;

   -- Policy selection & role-player lookup
    DECLARE @Pol TABLE (PolicyId INT PRIMARY KEY);
    INSERT INTO @Pol
    SELECT TRY_CAST(value AS INT)
    FROM STRING_SPLIT(@policyIds, ',')
    WHERE @policyIds <> '-1';      -- empty table = “all policies”

    DECLARE @rolePlayerId INT;

    SELECT TOP (1) @rolePlayerId = PolicyOwnerId
    FROM   [policy].[Policy]
    WHERE  ( @policyIds = '-1'
             OR PolicyId IN (SELECT PolicyId FROM @Pol) );

    IF @rolePlayerId IS NULL
    BEGIN
        SELECT  CAST(NULL AS DATETIME) AS TransactionDate
        WHERE 1 = 0;
        RETURN;
    END

  
    DECLARE @PolicyCount INT;
    SELECT @PolicyCount = COUNT(*)
    FROM [policy].[Policy]
    WHERE PolicyOwnerId = @rolePlayerId;

   
    ;WITH Tx AS (

        SELECT  t.TransactionId,
                TxDate = CASE WHEN i.InvoiceDate > GETDATE()
                              THEN i.InvoiceDate ELSE i.CreatedDate END,
                TxType = tt.Name,
                DocNo  = i.InvoiceNumber,
                Ref    = ISNULL(t.BankReference, p.PolicyNumber),
                Descr  = CONCAT('Premium - ', DATENAME(MONTH,i.InvoiceDate)),

                DebitAmt   = MAX(        -- FIX: aggregate
                               CASE WHEN tl.IsDebit = 1
                                    THEN t.Amount ELSE 0 END
                             ),

                CredAmt    = ISNULL(SUM(ISNULL(ia1.Amount, ia2.Amount)),0),

                SignAmount = MAX(t.Amount)                     -- FIX: aggregate
                             - ISNULL(SUM(ISNULL(ia1.Amount, ia2.Amount)),0), -- untouched

                Created = t.CreatedDate,
                KeepRow = 1

        FROM   [billing].[Invoice]             i
        JOIN   [billing].[Transactions]        t   ON i.InvoiceId = t.InvoiceId
        LEFT  JOIN [billing].[InvoiceAllocation] ia1
                     ON ia1.InvoiceId = t.InvoiceId
                    AND ia1.IsDeleted = 0
        LEFT  JOIN [billing].[InvoiceAllocation] ia2
                     ON ia2.LinkedTransactionId = t.TransactionId
                    AND ia2.IsDeleted = 0
        JOIN   [policy].[Policy]               p   ON p.PolicyId  = i.PolicyId
        JOIN   [common].[TransactionType]      tt  ON tt.Id       = t.TransactionTypeId
        JOIN   [billing].[TransactionTypeLink] tl  ON tl.Id       = t.TransactionTypeLinkId
        WHERE  t.TransactionTypeId = 6
          AND  t.IsDeleted = 0
          AND  t.Amount    <> 0
          AND  t.TransactionId NOT IN
               ( SELECT DISTINCT LinkedTransactionId
                 FROM [billing].[Transactions]
                 WHERE TransactionTypeId = 5 )
          AND  ( @PolicyCount = 1
                  AND p.PolicyOwnerId = @rolePlayerId
                OR @PolicyCount > 1
                  AND p.PolicyOwnerId = @rolePlayerId
                  AND ( @policyIds = '-1'
                        OR p.PolicyId IN (SELECT PolicyId FROM @Pol) ) )

        GROUP BY t.TransactionId, tt.Name, tl.IsDebit,
                 i.InvoiceNumber, i.InvoiceDate, i.CreatedDate,
                 p.PolicyNumber, t.BankReference, p.PolicyId, t.CreatedDate

        UNION ALL
        SELECT  t.TransactionId,
                t.CreatedDate,
                tt.Name,
                CASE WHEN ISNULL(t.BankReference,'') = '' THEN t.RmaReference ELSE t.BankReference END,
                CASE WHEN ISNULL(t.BankReference,'') = '' THEN t.RmaReference ELSE t.BankReference END,
                CONCAT('Payment - ', DATENAME(MONTH, COALESCE(pr.StartDate, t.TransactionDate))),
                0,
                ISNULL(ia.Amount, t.Amount),
                -ISNULL(ia.Amount, t.Amount),   -- credit is negative for running total
                t.CreatedDate,
                1
        FROM   [billing].[Transactions]        t
        LEFT  JOIN [billing].[InvoiceAllocation] ia ON ia.TransactionId = t.TransactionId
        OUTER APPLY ( SELECT TOP 1 * FROM [common].[Period] pr
                      WHERE t.TransactionDate BETWEEN pr.StartDate AND pr.EndDate ) pr
        JOIN   [common].[TransactionType]      tt ON tt.Id = t.TransactionTypeId
        JOIN   [billing].[TransactionTypeLink] tl ON tl.Id = t.TransactionTypeLinkId
        JOIN   [policy].[Policy]               p  ON p.PolicyId = ISNULL(t.InvoiceId, ia.InvoiceId)
        WHERE  t.TransactionTypeId = 3
          AND  tl.IsDebit = 0
          AND  t.IsDeleted = 0
          AND  NOT EXISTS ( SELECT 1
                            FROM  [billing].[InvoiceAllocation] iax
                            WHERE iax.InvoiceId = t.InvoiceId )
          AND  ( @PolicyCount = 1
                 AND t.RolePlayerId = @rolePlayerId
               OR @PolicyCount > 1
                 AND t.RolePlayerId = @rolePlayerId
                 AND ( @policyIds = '-1' OR p.PolicyId IN (SELECT PolicyId FROM @Pol) ))

        UNION ALL
        SELECT  t.TransactionId,
                t.CreatedDate,
                tt.Name,
                COALESCE(NULLIF(t.BankReference,''), t.RmaReference),
                COALESCE(NULLIF(t.BankReference,''), t.RmaReference),
                CONCAT('Credit Note - ', ctr.Name, ' ',
                       DATENAME(MONTH, COALESCE(pr.StartDate, t.TransactionDate))),
                0,
                t.Amount,
                -t.Amount,
                t.CreatedDate,
                1
        FROM   [billing].[Transactions]        t
        LEFT  JOIN [billing].[InvoiceAllocation] ia ON ia.InvoiceId = t.InvoiceId
        LEFT  JOIN [billing].[Invoice]         i  ON i.InvoiceId = ia.InvoiceId
        LEFT  JOIN [billing].[Transactions]     bt ON ia.LinkedTransactionId = bt.TransactionId
        LEFT  JOIN [Common].[TransactionReason] ctr ON ctr.Id = t.TransactionReasonId
        OUTER APPLY ( SELECT TOP 1 * FROM [common].[Period] pr
                      WHERE t.TransactionDate BETWEEN pr.StartDate AND pr.EndDate ) pr
        JOIN   [common].[TransactionType]      tt ON tt.Id = t.TransactionTypeId
        JOIN   [billing].[TransactionTypeLink] tl ON tl.Id = t.TransactionTypeLinkId
        JOIN   [policy].[Policy]               p  ON p.PolicyId = ISNULL(i.PolicyId, bt.InvoiceId)
        WHERE  t.TransactionTypeId = 4
          AND  t.IsDeleted = 0
          AND  NOT EXISTS ( SELECT 1
                            FROM [billing].[InvoiceAllocation] iax
                            WHERE iax.TransactionId = t.TransactionId )
          AND  ( @PolicyCount = 1
                 AND t.RolePlayerId = @rolePlayerId
               OR @PolicyCount > 1
                 AND t.RolePlayerId = @rolePlayerId
                 AND ( @policyIds = '-1' OR p.PolicyId IN (SELECT PolicyId FROM @Pol) ))

        UNION ALL
        SELECT  t.TransactionId,
                t.CreatedDate,
                tt.Name,
                COALESCE(NULLIF(t.BankReference,''), t.RmaReference),
                COALESCE(NULLIF(t.BankReference,''), t.RmaReference),
                CONCAT('Credit Reallocation - ',
                       DATENAME(MONTH, COALESCE(pr.StartDate, t.TransactionDate))),
                0,
                t.Amount,
                -t.Amount,
                t.CreatedDate,
                1
        FROM   [billing].[Transactions]        t
        LEFT  JOIN [billing].[InvoiceAllocation] ia ON ia.TransactionId = t.TransactionId
        OUTER APPLY ( SELECT TOP 1 * FROM [common].[Period] pr
                      WHERE t.TransactionDate BETWEEN pr.StartDate AND pr.EndDate ) pr
        JOIN   [common].[TransactionType]      tt ON tt.Id = t.TransactionTypeId
        JOIN   [billing].[TransactionTypeLink] tl ON tl.Id = t.TransactionTypeLinkId
        JOIN   [policy].[Policy]               p  ON p.PolicyId = ISNULL(t.InvoiceId, ia.InvoiceId)
        WHERE  t.TransactionTypeId = 19
          AND  t.IsDeleted = 0
          AND  NOT EXISTS (SELECT 1 FROM [billing].[InvoiceAllocation] iax WHERE iax.TransactionId = t.TransactionId)
          AND  ( @PolicyCount = 1
                 AND t.RolePlayerId = @rolePlayerId
               OR @PolicyCount > 1
                 AND t.RolePlayerId = @rolePlayerId
                 AND ( @policyIds = '-1' OR p.PolicyId IN (SELECT PolicyId FROM @Pol) ))

        UNION ALL
        SELECT  t.TransactionId,
                t.CreatedDate,
                tt.Name,
                COALESCE(NULLIF(t.BankReference,''), t.RmaReference),
                CASE WHEN t.TransactionTypeId = 7
                     THEN REPLACE(t.Reason,'12:','')
                     ELSE COALESCE(NULLIF(t.BankReference,''), t.RmaReference)
                END,
                CASE WHEN t.TransactionTypeId = 7
                     THEN CONCAT(tt.Name,' - ', DATENAME(MONTH, COALESCE(pr.EndDate, t.TransactionEffectiveDate)))
                     ELSE CONCAT(tt.Name,' - ', DATENAME(MONTH, COALESCE(pr.StartDate, t.CreatedDate)))
                END,
                CASE WHEN tl.IsDebit = 1 THEN t.Amount ELSE 0 END,
                CASE WHEN tl.IsDebit = 0 THEN ISNULL(t.Amount - ia.Amount, 0) ELSE 0 END,
                CASE WHEN tl.IsDebit = 1 THEN  t.Amount
                     ELSE -ISNULL(t.Amount - ia.Amount, 0) END,
                t.CreatedDate,
                1
        FROM   [billing].[Transactions]        t
        LEFT  JOIN [billing].[InvoiceAllocation] ia ON ia.TransactionId = t.TransactionId AND ia.IsDeleted = 0
        OUTER APPLY ( SELECT TOP 1 * FROM [common].[Period] pr
                      WHERE t.CreatedDate BETWEEN pr.StartDate AND pr.EndDate ) pr
        JOIN   [common].[TransactionType]      tt ON tt.Id = t.TransactionTypeId
        JOIN   [billing].[TransactionTypeLink] tl ON tl.Id = t.TransactionTypeLinkId
        JOIN   [policy].[Policy]               p  ON p.PolicyId = ISNULL(t.InvoiceId, ia.InvoiceId)
        WHERE  t.TransactionTypeId NOT IN (4,6,3,19,5,8,17)
          AND  t.IsDeleted = 0
          AND  t.TransactionId NOT IN ( SELECT DISTINCT LinkedTransactionId
                                        FROM [billing].[Transactions]
                                        WHERE TransactionTypeId = 17)
          AND  ( @PolicyCount = 1
                 AND t.RolePlayerId = @rolePlayerId
               OR @PolicyCount > 1
                 AND t.RolePlayerId = @rolePlayerId
                 AND ( @policyIds = '-1' OR p.PolicyId IN (SELECT PolicyId FROM @Pol) ))

        UNION ALL
        SELECT  t.TransactionId,
                t.CreatedDate,
                'Refund',
                COALESCE(NULLIF(t.BankReference,''), t.RmaReference),
                COALESCE(NULLIF(t.BankReference,''), t.RmaReference),
                CONCAT('Refund - ', DATENAME(MONTH, COALESCE(pr.StartDate, t.TransactionDate))),
                t.Amount,
                0,
                t.Amount,                    -- debit (positive)
                t.CreatedDate,
                ROW_NUMBER() OVER (PARTITION BY t.TransactionId ORDER BY t.CreatedDate, t.TransactionId)
        FROM   [billing].[Transactions]        t
        LEFT  JOIN [billing].[InvoiceAllocation] ia ON ia.TransactionId = t.TransactionId
        OUTER APPLY ( SELECT TOP 1 * FROM [common].[Period] pr
                      WHERE t.TransactionDate BETWEEN pr.StartDate AND pr.EndDate ) pr
        JOIN   [billing].[TransactionTypeLink] tl ON tl.Id = t.TransactionTypeLinkId
        JOIN   [policy].[Policy]               p  ON p.PolicyId = ISNULL(t.InvoiceId, ia.InvoiceId)
        WHERE  t.TransactionTypeId = 8
          AND  tl.IsDebit = 1
          AND  t.IsDeleted = 0
          AND  ( @PolicyCount = 1
                 AND p.PolicyOwnerId = @rolePlayerId
               OR @PolicyCount > 1
                 AND p.PolicyOwnerId = @rolePlayerId
                 AND ( @policyIds = '-1' OR p.PolicyId IN (SELECT PolicyId FROM @Pol) ))
    )
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
            Amount     = ABS(SignAmount),
            Balance    = SUM(SignAmount) OVER (ORDER BY TxDate, TransactionId
                                               ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW),
            [Year]     = YEAR(TxDate),
            [Period]   = MONTH(COALESCE(prP.StartDate, TxDate)),
            Created
        FROM Tx
        OUTER APPLY ( SELECT TOP 1 * FROM [common].[Period] prP
                      WHERE Tx.TxDate BETWEEN prP.StartDate AND prP.EndDate ) prP
        WHERE NOT (TxType = 'Refund' AND KeepRow <> 1)  -- keep only first refund row
    )

    SELECT
        TransactionId,
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
    WHERE TxType NOT IN ('Payment Allocation','Payment Allocation Reversal',
                         'Claim Recovery Invoice','Claim Recovery Payment',
                         'Claim Recovery Payment Reversal')
      AND Amount <> 0
    ORDER BY TxDate, TransactionId;
END
GO
