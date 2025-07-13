CREATE PROCEDURE [billing].[StatementProdCatBankDetails]
    @policyIds VARCHAR(4000) = '-1'      -- comma list or '-1' for “all”
AS
BEGIN
    SET NOCOUNT ON;

    -- Split incoming list just once
    DECLARE @tblPol TABLE (PolicyId INT PRIMARY KEY);
    IF @policyIds <> '-1'
        INSERT INTO @tblPol (PolicyId)
        SELECT DISTINCT TRY_CAST(value AS INT)
        FROM STRING_SPLIT(@policyIds, ',')
        WHERE TRY_CAST(value AS INT) IS NOT NULL;

    -- Single, deterministic query
    SELECT TOP (1)
           b.Name             AS BankName,
           br.Name            AS BranchName,
           br.Code            AS BranchCode,
           ba.AccountNumber   AS AccNumber
    FROM   policy.Policy                 p   WITH (NOLOCK)
    JOIN   client.FinPayee               fp  WITH (NOLOCK) ON fp.RolePlayerId     = p.PolicyOwnerId
    JOIN   common.Industry               i   WITH (NOLOCK) ON i.Id               = fp.IndustryId
    JOIN   common.IndustryClass          ic  WITH (NOLOCK) ON ic.Id              = i.IndustryClassId
    JOIN   product.ProductOption         po  WITH (NOLOCK) ON po.Id              = p.ProductOptionId
    JOIN   product.Product               pr  WITH (NOLOCK) ON pr.Id              = po.ProductId
    JOIN   product.ProductBankAccount    pba WITH (NOLOCK) ON pba.IndustryClassId = ic.Id
                                            AND pba.ProductId        = pr.Id
    JOIN   common.BankAccount            ba  WITH (NOLOCK) ON ba.Id              = pba.BankAccountId
    JOIN   common.Bank                   b   WITH (NOLOCK) ON b.Id               = ba.BankId
    JOIN   common.BankBranch             br  WITH (NOLOCK) ON br.Id              = ba.BranchId
    WHERE  ( NOT EXISTS (SELECT 1 FROM @tblPol)         -- “all policies”
             OR p.PolicyId IN (SELECT PolicyId FROM @tblPol) )
    ORDER  BY b.Name, br.Code;                          -- deterministic TOP(1)
END;
GO


















