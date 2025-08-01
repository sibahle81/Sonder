
/**********************************************************************************************
Script Name      : billing.fn_GetTransactionDetailsForAbilityPosting
Schema           : billing
Type             : Table-Valued Function
Author           : Livhuwani Rambuda
Created On       : 2025-05-27
Description      : 
    This function retrieves detailed transaction metadata required for the 
    Ability Posting process, based on a supplied TransactionId.

    It joins key financial, policy, product, role player, and bank statement 
    tables to form a consolidated result set containing all the attributes 
    required for downstream processes such as reference generation, audit tracking, 
    and GL posting enrichment.

    Notably, this function includes business logic to:
    - Determine funeral product classification
    - Extract policy brokerage and FSP details
    - Resolve associated bank account and reference data
    - Derive AbilityCollectionChartPrefix for structured mapping

Parameters:
    @TransactionId     INT     -- Unique identifier for the transaction to extract details for

Returns:
    A table with the following fields:
        - RolePlayerId
        - TransactionTypeLinkId
        - FinPayeNumber
        - PolicyId
        - BrokerageId
        - FspNumber
        - ProductOptionId
        - ProductName
        - ProductId
        - IndustryId
        - IndustryClassId
        - RolePlayerType
        - IsFuneralProduct
        - StrDate
        - ProductClass
        - BankStatementEntryId
        - BankAccountNumber
        - UnpaddedBankAccountNumber
        - BankDepartmentName
        - BrokerName
        - InvoiceId
        - AbilityCollectionChartPrefixId
        - AbilityCollectionChartPrefix

Usage:
    SELECT * 
    FROM billing.fn_GetTransactionDetailsForAbilityPosting(@TransactionId = 12345);

Dependencies:
    - billing.Transactions
    - billing.Invoice
    - client.RolePlayer
    - client.Company
    - client.FinPayee
    - common.Industry
    - finance.BankStatementEntry
    - policy.Policy
    - broker.Brokerage
    - product.ProductOption
    - product.Product
    - finance.ProductCrossRefTranType
    - common.AbilityCollectionChartPrefix

Notes:
    - This function is optimized to return a single result per TransactionId.
    - Consumed by various services, including AbilityReferenceGenerator, for structured financial processing.
**********************************************************************************************/

CREATE OR ALTER   FUNCTION [billing].[fn_GetTransactionDetailsForAbilityPosting]
(
    @TransactionId INT
)
RETURNS TABLE
AS
RETURN
(
    SELECT  
        rp.RolePlayerId,
		t.TransactionTypeLinkId,
		fp.FinPayeNumber,
        i.PolicyId,
        pol.BrokerageId,
        b.FSPNumber,
        pol.ProductOptionId,
		p.Name AS ProductName,
        p.Id AS ProductId,
        fp.IndustryId,
        ind.IndustryClassId,
        rp.RolePlayerIdentificationTypeId AS RolePlayerType,
        CASE 
            WHEN p.UnderwriterId = 1 THEN 1
            ELSE 0
        END AS IsFuneralProduct,
        FORMAT(t.TransactionDate, 'ddMMyyyy') AS StrDate,
        p.ProductClassId AS ProductClass,
        t.BankStatementEntryId,
        bse.BankAccountNumber,
        LTRIM(RTRIM(bse.BankAccountNumber)) AS UnpaddedBankAccountNumber,
        bse.UserReference1 AS BankDepartmentName,
        COALESCE(b.Name, c.Name) AS BrokerName,
        i.InvoiceId,
        x.AbilityCollectionChartPrefixId,
        x.AbilityCollectionChartPrefix
    FROM billing.Transactions t
    INNER JOIN billing.Invoice i ON i.InvoiceId = t.InvoiceId
    INNER JOIN client.RolePlayer rp ON rp.RolePlayerId = t.RolePlayerId
    LEFT JOIN client.Company c ON c.RolePlayerId = rp.RolePlayerId
    LEFT JOIN client.FinPayee fp ON fp.RolePlayerId = rp.RolePlayerId
    LEFT JOIN common.Industry ind ON ind.Id = fp.IndustryId
    LEFT JOIN finance.BankStatementEntry bse ON bse.BankStatementEntryId = t.BankStatementEntryId
    LEFT JOIN policy.Policy pol ON pol.PolicyId = i.PolicyId
    LEFT JOIN broker.Brokerage b ON b.Id = pol.BrokerageId
    LEFT JOIN product.ProductOption po ON po.Id = pol.ProductOptionId
    LEFT JOIN product.Product p ON p.Id = po.ProductId
    OUTER APPLY (
		SELECT TOP 1 
			x.AbilityCollectionChartPrefixId, 
			acr.Name AS AbilityCollectionChartPrefix
		FROM finance.ProductCrossRefTranType x
		LEFT JOIN common.AbilityCollectionChartPrefix acr 
			ON acr.Id = x.AbilityCollectionChartPrefixId
		WHERE x.ProductCodeId = p.Id
		  AND x.IsActive = 1
		  AND x.IsDeleted = 0
	) AS x
    WHERE t.TransactionId = @TransactionId
)