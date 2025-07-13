CREATE PROCEDURE [billing].[StatementOpeningAnalysis]
    @invoiceId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RefDate DATE = GETDATE();        -- single reference point

    ;WITH Tx AS (
        SELECT
              bal = CASE WHEN t.TransactionTypeLinkId = 1
                         THEN  t.Amount
                         ELSE -t.Amount
                    END,
              ageDays = DATEDIFF(
                           DAY,
                           CASE WHEN i.InvoiceDate > @RefDate
                                THEN i.InvoiceDate
                                ELSE t.CreatedDate
                           END,
                           @RefDate)
        FROM  [billing].[Transactions]      AS t
        JOIN  [billing].[Invoice]           AS i ON i.InvoiceId = t.InvoiceId
        JOIN  [policy].[Policy]             AS p ON p.PolicyId   = i.PolicyId
        WHERE p.PolicyId        = @invoiceId
          AND t.IsDeleted       = 0
          AND t.TransactionTypeId NOT IN (14,15,16)
          AND (   -- period / future filtering, unchanged
                 (NOT EXISTS (SELECT 1
                              FROM [common].[Period] pr
                              WHERE pr.StartDate <= t.TransactionDate
                                AND pr.Status = 'Future')
                  AND t.TransactionTypeId <> 6)
               OR
                 (EXISTS (SELECT 1
                          FROM [common].[Period] pr
                          WHERE pr.StartDate >= t.TransactionDate
                            AND pr.Status <> 'Future')
                  AND t.TransactionTypeId  = 6)
              )
    )

 
    SELECT
        CurrentBalance   = COALESCE(SUM(CASE WHEN ageDays BETWEEN 30  AND  59 THEN bal END), 0),
        ThirtyBalance    = COALESCE(SUM(CASE WHEN ageDays BETWEEN 60  AND  89 THEN bal END), 0),
        SixtyBalance     = COALESCE(SUM(CASE WHEN ageDays BETWEEN 90  AND 119 THEN bal END), 0),
        NinetyBalance    = COALESCE(SUM(CASE WHEN ageDays BETWEEN 120 AND 149 THEN bal END), 0),
        OneTwentyBalance = COALESCE(SUM(CASE WHEN ageDays >= 150            THEN bal END), 0)
    FROM Tx;
END
GO
