CREATE PROCEDURE [billing].[StatementProdCatAddressDetails]
    @policyIds VARCHAR(4000) = '-1'      -- comma list or '-1' for “all”
AS
BEGIN
    SET NOCOUNT ON;

    -- Split incoming list once
    DECLARE @tblPol TABLE (PolicyId INT PRIMARY KEY);
    IF @policyIds <> '-1'
        INSERT INTO @tblPol (PolicyId)
        SELECT DISTINCT TRY_CAST(LTRIM(value) AS INT)
        FROM STRING_SPLIT(@policyIds, ',')
        WHERE TRY_CAST(value AS INT) IS NOT NULL;

   -- Single pass query
    SELECT TOP (1)
        p.PolicyNumber                       AS PolicyNumber,
        fp.FinPayeNumber                    AS FinPayeeNumber,
        CONVERT(VARCHAR(10), GETDATE(), 23)  AS DocumentDate,
        UPPER(rp.DisplayName)                AS DisplayName,
        UPPER(rpa.AddressLine1)              AS AddressLine1,
        UPPER(rpa.AddressLine2)              AS AddressLine2,
        UPPER(ISNULL(rpa.City,''))           AS City,
        rpa.PostalCode                       AS PostalCode
    FROM   policy.Policy              AS p        WITH (NOLOCK)
    JOIN   client.RolePlayer           AS rp       WITH (NOLOCK)
           ON rp.RolePlayerId = p.PolicyOwnerId
    JOIN   client.FinPayee             AS fp       WITH (NOLOCK)
           ON fp.RolePlayerId  = rp.RolePlayerId
    LEFT  JOIN client.RolePlayerAddress AS rpa     WITH (NOLOCK)
           ON rpa.RolePlayerId = rp.RolePlayerId
          AND rpa.AddressTypeId = 1          -- “postal” (adjust if needed)
    WHERE  (NOT EXISTS (SELECT 1 FROM @tblPol)         -- “all policies”
            OR p.PolicyId IN (SELECT PolicyId FROM @tblPol))
    ORDER  BY rp.DisplayName;                         -- deterministic TOP 1
END;
GO
