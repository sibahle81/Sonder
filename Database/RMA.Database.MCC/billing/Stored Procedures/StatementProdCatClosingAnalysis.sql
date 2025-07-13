CREATE PROCEDURE [billing].[StatementProdCatClosingAnalysis]
    @policyIds VARCHAR(4000) = '-1'     -- comma list, or '-1' = all
AS
BEGIN
    SET NOCOUNT ON;

   DECLARE @tblPol TABLE (PolicyId INT PRIMARY KEY);
    IF @policyIds <> '-1'
        INSERT INTO @tblPol (PolicyId)
        SELECT DISTINCT TRY_CAST(value AS INT)
        FROM STRING_SPLIT(@policyIds, ',')
        WHERE TRY_CAST(value AS INT) IS NOT NULL;

  ;WITH Tx AS (
        SELECT
            t.TransactionId,
            SignAmt = CASE   WHEN t.TransactionTypeLinkId = 1
                             THEN  t.Amount         -- debit
                             ELSE -t.Amount         -- credit
                      END,
            AgeDays = DATEDIFF(
                        DAY,
                        CASE WHEN i.InvoiceDate > GETDATE()
                             THEN i.InvoiceDate
                             ELSE t.CreatedDate
                        END,
                        GETDATE()
                      )
        FROM   billing.Transactions            t   WITH (NOLOCK)
        LEFT  JOIN billing.InvoiceAllocation   ia  WITH (NOLOCK)
                   ON ia.TransactionId = t.TransactionId
        LEFT  JOIN billing.Invoice             i   WITH (NOLOCK)
                   ON ISNULL(ia.InvoiceId, t.InvoiceId) = i.InvoiceId
        LEFT  JOIN billing.Invoice             bi  WITH (NOLOCK)
                   ON t.RmaReference = bi.InvoiceNumber
                  AND t.InvoiceId IS NULL
        JOIN   policy.Policy                   p   WITH (NOLOCK)
                   ON p.PolicyOwnerId = t.RolePlayerId
        WHERE  t.TransactionTypeId NOT IN (14,15,16)     -- exclusions
          AND  t.IsDeleted = 0
          AND  t.TransactionId NOT IN ( SELECT DISTINCT LinkedTransactionId
                                        FROM billing.Transactions
                                        WHERE TransactionTypeId = 17 )    -- reversals
          AND ( NOT EXISTS (SELECT 1 FROM @tblPol)        -- “all policies”
                OR  p.PolicyId IN (SELECT PolicyId FROM @tblPol)
                OR  bi.PolicyId IN (SELECT PolicyId FROM @tblPol) )
        /* De-duplicate on TransactionId in case
           joins create multiple rows                */
        GROUP BY t.TransactionId,
                 t.TransactionTypeLinkId,
                 t.Amount,
                 i.InvoiceDate,
                 t.CreatedDate
    )

    -- Aggregate once into ageing buckets
    SELECT
        [Current]   = COALESCE(SUM(CASE WHEN AgeDays  <  30            THEN SignAmt END), 0),
        [30Days]    = COALESCE(SUM(CASE WHEN AgeDays BETWEEN  30 AND  59 THEN SignAmt END), 0),
        [60Days]    = COALESCE(SUM(CASE WHEN AgeDays BETWEEN  60 AND  89 THEN SignAmt END), 0),
        [90Days]    = COALESCE(SUM(CASE WHEN AgeDays BETWEEN  90 AND 119 THEN SignAmt END), 0),
        [120Days]   = COALESCE(SUM(CASE WHEN AgeDays >= 120            THEN SignAmt END), 0),
        NetBalance  = SUM(SignAmt)
    FROM Tx;
END;
GO
