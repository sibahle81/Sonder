-- =============================================
-- Author:		Sanele Ngidi
-- Create date: 2019-10-16
-- Description:	
-- =============================================
CREATE PROCEDURE [claim].[UnclaimedBenefitReport]
	@DateFrom As Date,
	@DateTo AS Date
	--@ClaimStatusId As INT = 0
AS
BEGIN
	
	DECLARE @Claim AS TABLE(
			Id INT,
			RegistrationDate DATETIME,
			PolicyNumber VARCHAR(20), 
			Scheme VARCHAR(100),
			Product VARCHAR(100),
			DeseasedName VARCHAR(100),
			DeseasedSurname VARCHAR(100),
			ClaimNumber VARCHAR(20), 
			BenefitAmount MONEY,
			TypeOfDeath VARCHAR(50),
			UnclaimedBenefitInterest MONEY,
			TAT DECIMAL(8,2),
			Brokerage VARCHAR(100), 
			[Broker] VARCHAR(100),
			Channel VARCHAR(50),
			CompanyName VARCHAR(100),   
			DecisionDate DATETIME,
			UnclaimedBenefitReason VARCHAR(MAX));

	INSERT INTO @Claim
	SELECT DISTINCT
			clm.Id,
			clm.CreatedDate,
			pol.PolicyNumber,
			'Test Scheme', 
			prd.[Name], 
			fdr.FirstName,
			fdr.LastName, 
			clm.ClaimUniqueReference, 
			10000.00,
			dt.[Name],
			13444.56,
			12.4,
			coms.BrokerageName, 
			comd.BrokerName,
			'Test Email',
			cnt.[Name],  
			GETDATE(),
			'Test Unclaimed Benefit Reason'
		FROM 
			[claim].[Claim] (NOLOCK) clm 
			INNER JOIN [claim].[FuneralRegistryDetails] (NOLOCK) fdr ON fdr.ClaimId = clm.Id
			INNER JOIN [common].[DeathType] (NOLOCK) dt ON fdr.DeathTypeId = dt.Id
			INNER JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.Id
			INNER JOIN [client].[Client] (NOLOCK) cnt ON pol.ClientId = cnt.Id
			INNER JOIN [client].[BankAccount] (NOLOCK) acc ON pol.BankAccountId = acc.Id
			INNER JOIN [common].[Bank] (NOLOCK) bnk ON acc.BankId = bnk.Id
			INNER JOIN [security].[User] (NOLOCK) u ON clm.AssignedToUserId = u.Id
			INNER JOIN [policy].[ClientCover] (NOLOCK) cvr ON cvr.PolicyId = pol.Id AND cvr.ClientId = cnt.Id
			INNER JOIN [product].[Product] (NOLOCK) prd ON cvr.ProductId = prd.Id
			LEFT JOIN [policy].[CommissionDetail] (NOLOCK) comd ON comd.PolicyId = pol.Id
			LEFT JOIN [policy].[CommissionSummary] (NOLOCK) coms ON comd.CommissionSummaryId = coms.Id
			LEFT JOIN [claim].[CauseOfDeathType] (NOLOCK) cod ON fdr.CauseOfDeathId = cod.Id
			LEFT JOIN [claim].[ClaimPayment] (NOLOCK) cp ON cp.ClaimId = clm.Id
			LEFT JOIN [payment].[Payment] (NOLOCK) py ON cp.PaymentId = py.Id
		WHERE
			clm.CreatedDate BETWEEN @DateFrom AND @DateTo AND
			clm.ClaimStatusId IN (20)

		SELECT * FROM @Claim
END
