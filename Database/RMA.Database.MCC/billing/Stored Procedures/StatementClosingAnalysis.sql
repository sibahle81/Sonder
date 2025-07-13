CREATE PROCEDURE [billing].[StatementClosingAnalysis]
    @invoiceId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RefDate DATE = GETDATE();   

     -- Base set
    ;WITH Tx AS (
        SELECT
            bal = CASE WHEN t.TransactionTypeLinkId = 1
                       THEN  t.Amount        -- debit
                       ELSE -t.Amount        -- credit
                  END,
            ageDays = DATEDIFF(
                         DAY,
                         CASE WHEN i.InvoiceDate > @RefDate
                              THEN i.InvoiceDate
                              ELSE t.CreatedDate
                         END,
                         @RefDate)
        FROM   [billing].[Transactions] t
        JOIN   [billing].[Invoice]      i ON i.InvoiceId = t.InvoiceId
        JOIN   [policy].[Policy]        p ON p.PolicyId   = i.PolicyId
        WHERE  p.PolicyId = @invoiceId
          AND  t.IsDeleted = 0
          AND  t.TransactionTypeId NOT IN (14,15,16)   -- same exclusion as original
    )

    -- Conditional aggregation
    SELECT
        [Current]   = COALESCE(SUM(CASE WHEN ageDays  <  30            THEN bal END), 0),
        [30days]    = COALESCE(SUM(CASE WHEN ageDays BETWEEN  30 AND  59 THEN bal END), 0),
        [60days]    = COALESCE(SUM(CASE WHEN ageDays BETWEEN  60 AND  89 THEN bal END), 0),
        [90days]    = COALESCE(SUM(CASE WHEN ageDays BETWEEN  90 AND 119 THEN bal END), 0),
        [120days]   = COALESCE(SUM(CASE WHEN ageDays BETWEEN 120 AND 149 THEN bal END), 0),
        NetBalance  = SUM(bal)  -- all included rows
    FROM Tx;
END
GO
