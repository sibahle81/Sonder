/**********************************************************************************************
Script Name      : billing.GetAbilityTransactionDetails
Schema           : billing
Type             : Stored Procedure
Author           : Livhuwani Rambuda
Created On       : 2025-05-27
Description      : 
    This procedure retrieves detailed financial transaction metadata based on a 
    provided TransactionId. It acts as a wrapper around the 
    [billing].[fn_GetTransactionDetailsForAbilityPosting] function and extracts 
    all relevant financial, policy, role player, and product information required 
    for generating ability references.

    The data is commonly consumed by services responsible for generating 
    structured bank references, notably the AbilityReferenceGenerator class 
    in the Billing Application.

Parameters:
    @TransactionId     INT     -- The unique identifier of the transaction

Returns:
    A single result set with the following fields:
        - RolePlayerId, TransactionTypeLinkId, FinPayeNumber, PolicyId,
        - BrokerageId, FspNumber, ProductOptionId, ProductName, ProductId,
        - IndustryId, IndustryClassId, RolePlayerType, IsFuneralProduct,
        - StrDate, ProductClass, BankStatementEntryId, BankAccountNumber,
        - UnpaddedBankAccountNumber, BankDepartmentName, BrokerName, InvoiceId

Usage:
    EXEC billing.GetAbilityTransactionDetails @TransactionId = 12345;

Dependencies:
    - billing.fn_GetTransactionDetailsForAbilityPosting

Notes:
    - This procedure simplifies application-side mapping by centralizing
      all required transaction context into a single SQL call.
    - Expected to return exactly one row per valid TransactionId.
**********************************************************************************************/
CREATE OR ALTER   PROCEDURE [billing].[GetAbilityTransactionDetails]
    @TransactionId INT
AS
BEGIN
    SET NOCOUNT ON;

        DECLARE @RolePlayerId INT,
			@TransactionTypeLinkId INT,
			@FinPayeNumber VARCHAR(64),
            @PolicyId INT,
            @BrokerageId INT,
            @FspNumber VARCHAR(64),
            @ProductOptionId INT,
			@ProductName VARCHAR(128),
            @ProductId INT,
            @IndustryId INT,
            @IndustryClassId INT,
            @RolePlayerType INT,
            @IsFuneralProduct BIT,
            @StrDate VARCHAR(16),
            @ProductClass INT,
            @BankStatementEntryId INT,
            @BankAccountNumber VARCHAR(64),
            @UnpaddedBankAccountNumber VARCHAR(64),
            @BankDepartmentName VARCHAR(128),
            @BrokerName VARCHAR(255),
            @InvoiceId INT,
            @GeneratedBankReference VARCHAR(128),
            @SennaFsp VARCHAR(64);

    -------------------------------------------------------------------------------------
    -- Get Transaction
    -------------------------------------------------------------------------------------s
		SELECT 
			@RolePlayerId = RolePlayerId,
			@TransactionTypeLinkId = TransactionTypeLinkId,
			@FinPayeNumber = FinPayeNumber,
			@PolicyId = PolicyId,
			@BrokerageId = BrokerageId,
			@FspNumber = FspNumber,
			@ProductOptionId = ProductOptionId,
			@ProductName = ProductName,
			@ProductId = ProductId,
			@IndustryId = IndustryId,
			@IndustryClassId = IndustryClassId,
			@RolePlayerType = RolePlayerType,
			@IsFuneralProduct = IsFuneralProduct,
			@StrDate = StrDate,
			@ProductClass = ProductClass,
			@BankStatementEntryId = BankStatementEntryId,
			@BankAccountNumber = BankAccountNumber,
			@UnpaddedBankAccountNumber = UnpaddedBankAccountNumber,
			@BankDepartmentName = BankDepartmentName,
			@BrokerName = BrokerName,
			@InvoiceId = InvoiceId
		FROM [billing].[fn_GetTransactionDetailsForAbilityPosting](@TransactionId);
END

SELECT 
    @RolePlayerId AS RolePlayerId,
    @TransactionTypeLinkId AS TransactionTypeLinkId,
    @FinPayeNumber AS FinPayeNumber,
    @PolicyId AS PolicyId,
    @BrokerageId AS BrokerageId,
    @FspNumber AS FspNumber,
    @ProductOptionId AS ProductOptionId,
    @ProductName AS ProductName,
    @ProductId AS ProductId,
    @IndustryId AS IndustryId,
    @IndustryClassId AS IndustryClassId,
    @RolePlayerType AS RolePlayerType,
    @IsFuneralProduct AS IsFuneralProduct,
    @StrDate AS StrDate,
    @ProductClass AS ProductClass,
    @BankStatementEntryId AS BankStatementEntryId,
    @BankAccountNumber AS BankAccountNumber,
    @UnpaddedBankAccountNumber AS UnpaddedBankAccountNumber,
    @BankDepartmentName AS BankDepartmentName,
    @BrokerName AS BrokerName,
    @InvoiceId AS InvoiceId;
