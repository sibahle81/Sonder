

-- =============================================
-- Author:		Gram Letoaba
-- Create date: 06/04/2020
-- EXEC [billing].[GetEuropeAssistPremiums]
-- =============================================
CREATE PROCEDURE [billing].[GetEuropeAssistPremiums]
AS

	 DECLARE @EuropAssistRMAPremium Decimal(18,2)
	 SET @EuropAssistRMAPremium = (SELECT [BasePremium] + [ProfitExpenseLoadingPremium] FROM [common].[EuropAssistPremiumMatrix] WHERE ([EndDate] > GetDate() OR [EndDate] IS NULL) AND IsDeleted = 0)

	
	DECLARE @SearchTable TABLE (
		DebtorPaymentId INT,
		BankStatementEntryId INT,
		DebtorName VARCHAR(250),
		InvoiceNumber VARCHAR(250),
		PolicyNumber VARCHAR(250),
		UserReference VARCHAR(250),
		TransactionDate Date,
		StatementDate Date,
	    HyphenDateProcessed Date,
		HyphenDateReceived Date,
		Amount Decimal(18,2),
		BankAccountNumber BIGINT,
		UserReference1 VARCHAR(250),
		UserReference2 VARCHAR(250),
		TransactionType VARCHAR(100),
		SchemeName VARCHAR(250),
        BrokerName VARCHAR(250),
        PolicyStatus VARCHAR(100),
        ClientType  VARCHAR(100)
	);

    INSERT INTO @SearchTable
	SELECT DISTINCT 0 InvoiceAllocationId,
	    0 BankStatementEntryId,
		R.DisplayName,
		P.PolicyNumber AS [InvoiceNumber],
		P.PolicyNumber,
		'' [UserReference],
		PT.[PaymentDate] AS [TransactionDate],
		PT.[PaymentDate] AS [StatementDate],
	    '' [HyphenDateProcessed],
		'' [HyphenDateReceived],
		CASE WHEN B.[FSPNumber] = '46113' THEN @EuropAssistRMAPremium ELSE (SELECT FORMAT([BasePremium]/(1-(0.2 + P.CommissionPercentage)),'N2') FROM [common].[EuropAssistPremiumMatrix]) END,
		'' AS [BankAccountNumber],
		'' [UserReference1],
		'' [UserReference2],
		'' [TransactionType],
		CP.Name [SchemeName],
		B.Name [BrokerName],
        S.Name [PolicyStatus],
        C.Name [ClientType]
	FROM [policy].[Policy] P
	INNER JOIN [billing].[PremiumListingTransaction] PT ON PT.PolicyId = P.PolicyId
	INNER JOIN [payment].[EuropeAssistPayment] EP ON EP.[PremiumListingTransactionId] = PT.Id
	INNER JOIN [client].[RolePlayer] R ON P.PolicyOwnerId = R.RolePlayerId
	INNER JOIN [broker].[Brokerage] B ON P.BrokerageId = B.Id
	INNER JOIN [common].[PolicyStatus] S ON P.PolicyStatusId = S.Id
	INNER JOIN [client].[FinPayee] F ON P.PolicyPayeeId = F.RolePlayerId
	INNER JOIN [common].[Industry] I ON F.IndustryId = I.Id 
	INNER JOIN [common].[IndustryClass] C ON I.IndustryClassId = C.Id
	INNER JOIN [client].[Company] CP ON P.PolicyPayeeId = CP.RolePlayerId
	WHERE P.IsEuropAssist = 1 AND PT.[PaymentDate] >= P.[EuropAssistEffectiveDate]

      SELECT DISTINCT DebtorPaymentId,
		BankStatementEntryId,
		DebtorName,
		InvoiceNumber,
		PolicyNumber,
		UserReference,
		TransactionDate,
		StatementDate,
	    HyphenDateProcessed,
		HyphenDateReceived,
		Amount,
		BankAccountNumber,
		UserReference1,
		UserReference2,
		TransactionType,
		SchemeName,
        BrokerName,
        PolicyStatus,
        ClientType
	 FROM @SearchTable