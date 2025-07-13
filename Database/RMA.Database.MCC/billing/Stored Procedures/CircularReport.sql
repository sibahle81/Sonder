CREATE PROCEDURE billing.CircularReport
    @IndustryId varchar(200) = '25',
    @ProductId  varchar(200) = '25'
AS
BEGIN
    SET NOCOUNT ON;

   
    DECLARE @tblIndustry TABLE(id int PRIMARY KEY);
    DECLARE @tblProduct  TABLE(id int PRIMARY KEY);

    IF @IndustryId <> '0'
        INSERT @tblIndustry
        SELECT CAST(value AS int) FROM string_split(@IndustryId, ',');

    IF @ProductId <> '-1'
        INSERT @tblProduct
        SELECT CAST(value AS int) FROM string_split(@ProductId, ',');

    ;WITH x AS
    (
        SELECT
            R.DisplayName                       AS DebtorName,
            T.TransactionId,
            P.PolicyId,
            F.FinPayeNumber                     AS AccountNumber,
            C.[Name]                            AS IndustryName,
            F.RolePlayerId,
            Pr.[Name]                           AS Product,
            CASE                                    -- one calculation, reused below
                WHEN DATEDIFF(day, T.CreatedDate, GETDATE()) <  30  THEN 0
                WHEN DATEDIFF(day, T.CreatedDate, GETDATE()) <  60  THEN 1
                WHEN DATEDIFF(day, T.CreatedDate, GETDATE()) <  90  THEN 2
                WHEN DATEDIFF(day, T.CreatedDate, GETDATE()) < 120  THEN 3
                WHEN DATEDIFF(day, T.CreatedDate, GETDATE()) < 150  THEN 4
                ELSE                                        5
            END                                   AS AgeBand,
            CASE WHEN T.TransactionTypeLinkId = 1
                 THEN  T.Amount
                 ELSE -T.Amount
            END                                   AS SignedAmount
        FROM client.RolePlayer          R
        JOIN client.FinPayee            F  ON F.RolePlayerId = R.RolePlayerId
        JOIN billing.Transactions       T  ON T.RolePlayerId = R.RolePlayerId
        JOIN billing.TransactionTypeLink TTL ON TTL.Id = T.TransactionTypeLinkId
        JOIN common.Industry            I  ON F.IndustryId = I.Id
        JOIN common.IndustryClass       C  ON I.IndustryClassId = C.Id
        LEFT JOIN billing.Invoice       I1 ON T.InvoiceId     = I1.InvoiceId
        LEFT JOIN billing.Invoice       I2 ON T.RmaReference  = I2.InvoiceNumber
                                           AND T.InvoiceId IS NULL
        LEFT JOIN policy.Policy         P  ON ISNULL(I1.PolicyId, I2.PolicyId) = P.PolicyId
                                           AND P.PolicyOwnerId = R.RolePlayerId
        LEFT JOIN product.ProductOption PO ON P.ProductOptionId = PO.Id
        LEFT JOIN product.Product       Pr ON PO.ProductId      = Pr.Id
        WHERE
              P.PolicyStatusId = 1           -- active only
          AND T.IsDeleted = 0
          AND (NOT EXISTS (SELECT 1 FROM @tblIndustry) 
               OR C.Id IN (SELECT id FROM @tblIndustry))
          AND (NOT EXISTS (SELECT 1 FROM @tblProduct)
               OR Pr.Id IN (SELECT id FROM @tblProduct))
    )
    SELECT TOP 20
        PolicyId,
        SUM(CASE WHEN AgeBand = 0 THEN SignedAmount END) AS CurrentBalance,
        SUM(CASE WHEN AgeBand = 1 THEN SignedAmount END) AS ThirtyBalance,
        SUM(CASE WHEN AgeBand = 2 THEN SignedAmount END) AS SixtyBalance,
        SUM(CASE WHEN AgeBand = 3 THEN SignedAmount END) AS NinetyBalance,
        SUM(CASE WHEN AgeBand = 4 THEN SignedAmount END) AS OneTwentyBalance,
        SUM(CASE WHEN AgeBand = 5 THEN SignedAmount END) AS OneTwentyPlusBalance,
        SUM(SignedAmount)                               AS Balance,
        AccountNumber,
        DebtorName,
        IndustryName,
        RolePlayerId,
        Product
    FROM x
    GROUP BY
        PolicyId, AccountNumber, DebtorName,
        IndustryName, RolePlayerId, Product
    ORDER BY Balance DESC;
END
GO
