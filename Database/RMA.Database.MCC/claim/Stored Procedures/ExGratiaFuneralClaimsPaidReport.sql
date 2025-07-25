-- =============================================
-- Author:		Sanele Ngidi
-- Create date: 2019-10-16
-- Description:	
-- =============================================
CREATE PROCEDURE [claim].[ExGratiaFuneralClaimsPaidReport]
	@DateFrom As Date,
	@DateTo AS Date
	--@ClaimStatusId As INT = 0
AS
BEGIN
	
	DECLARE @Claim AS TABLE(
			Id INT,
			Product VARCHAR(100),
			Brokerage VARCHAR(100), 
			[Broker] VARCHAR(100),
			CompanyName VARCHAR(100), 
			Scheme VARCHAR(100),  
			Channel VARCHAR(50),
			DecisionDate DATETIME, 
			AmountPaid MONEY,
			BenefitAmount MONEY,
			BeneficiaryName VARCHAR(50), 
			MainMember VARCHAR(50),
			DeseasedName VARCHAR(200), 
			PolicyNumber VARCHAR(20), 
			ClaimNumber VARCHAR(20), 
			BankAccountName VARCHAR(50),
			BankAccountNumber VARCHAR(50),
			BranchCode VARCHAR(50),
			TypeOfDeath VARCHAR(50),
			CauseOfDeath VARCHAR(50),
			Relationship VARCHAR(50),
			UnmetPremiumDeduction MONEY,
			Refunds MONEY,
			UnclaimedBenefitInterest MONEY,
			ExGratiaReasons VARCHAR(MAX));

	INSERT INTO @Claim
	SELECT DISTINCT
			clm.claimId,
			--prd.[Name], 
			''[Product],
			--coms.BrokerageName, 
			--comd.BrokerName,
			''[BrokerageName],
			''[BrokerName],
			--cnt.[Name], 
			''[Company],
			'Test Scheme', 
			'Test Email',
			--py.PaymentConfirmationDate,
			''[PaymentConfirmationDate],
			10000.00,
			15000.00,
			'Test Beneficiary',
			'Test Main Member',
			--fdr.FirstName + ' ' + fdr.LastName, 
			'Test Name',
			pol.PolicyNumber, 
			clm.claimreferencenumber, 
			--bnk.[Name],
			''[bank],
			--acc.AccountNumber,
			--acc.UniversalBranchCode,
			''[AccountNumber],
			''[UniversalBranchCode],
			dt.[Name],
			--cod.[Name],
			''	[name],
			'Test Relatonship',
			--cp.OutstandingPremium,
			--cp.Refund,
			--cp.UnclaimedPaymentInterest,

			''[cp.OutstandingPremium],
			''[cp.Refund],
			''[cp.UnclaimedPaymentInterest],
			'Test Ex-Gratia Reason'
		FROM 
			[claim].[Claim] (NOLOCK) clm 
			--INNER JOIN [claim].[FuneralRegistryDetails] (NOLOCK) fdr ON fdr.ClaimId = clm.Id
			
			LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			LEFT JOIN [client].[Person](NOLOCK)pers ON pers.roleplayerid = pe.insuredlifeid
			LEFT JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.POLICYId
			--LEFT JOIN [client].[Client] (NOLOCK) cnt ON pol.ClientId = cnt.Id
			--LEFT JOIN [client].[BankAccount] (NOLOCK) acc ON pol.BankAccountId = acc.Id
			LEFT JOIN [client].[RolePlayerBankingDetails] bnk ON bnk.roleplayerid =  pe.InsuredLifeId
			--LEFT JOIN [common].[Bank] (NOLOCK) bnk ON acc.BankId = bnk.Id
			LEFT JOIN [security].[User] (NOLOCK) u ON clm.AssignedToUserId = u.Id
			--INNER JOIN [policy].[ClientCover] (NOLOCK) cvr ON cvr.PolicyId = pol.Id AND cvr.ClientId = cnt.Id
			--LEFT JOIN [product].[Product] (NOLOCK) prd ON cvr.ProductId = prd.Id
			--LEFT JOIN [policy].[CommissionDetail] (NOLOCK) comd ON comd.PolicyId = pol.Id
			--LEFT JOIN [policy].[CommissionSummary] (NOLOCK) coms ON comd.CommissionSummaryId = coms.Id
			--LEFT JOIN [common].[CauseOfDeathType] (NOLOCK) cod ON pe.CauseOfDeathId = cod.Id
			--LEFT JOIN [claim].[ClaimPayment] (NOLOCK) cp ON cp.ClaimId = clm.Id
			--LEFT JOIN [payment].[Payment] (NOLOCK) py ON cp.PaymentId = py.Id
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
		WHERE
			clm.CreatedDate BETWEEN @DateFrom AND @DateTo AND
			clm.ClaimStatusId IN (16)

		SELECT * FROM @Claim
END
