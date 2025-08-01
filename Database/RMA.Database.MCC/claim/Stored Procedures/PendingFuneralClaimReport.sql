-- =============================================
-- Author:		Sanele Ngidi
-- Create date: 2019-10-16
-- Description:	
-- =============================================
CREATE PROCEDURE [claim].[PendingFuneralClaimReport]
	@DateFrom As Date,
	@DateTo AS Date
	--@ClaimStatusId As INT = 0
AS
BEGIN
	
	DECLARE @Claim AS TABLE(
		/*	Id INT,
			ClaimNumber VARCHAR(20), 
			PolicyNumber VARCHAR(20),
			Channel VARCHAR(50),  
			CurrentDate DATETIME,
			DateReqOutstNotSent DATETIME,
			TypeOfDeath VARCHAR(50),
			Product VARCHAR(100),  
			Brokerage VARCHAR(100),  
			[Broker] VARCHAR(100), 
			Scheme VARCHAR(100), 
			CompanyName VARCHAR(100),
			Assessor VARCHAR(100));

	INSERT INTO @Claim
	SELECT
			clm.Id,
			clm.ClaimUniqueReference, 
			pol.PolicyNumber,
			'Test Email',
			GETDATE(),
			GETDATE(), --Mocked this date still to get the appropriate date 
			dt.[Name], 
			prd.[Name],
			coms.BrokerageName,
			comd.BrokerName,
			'Test Scheme',  
			cnt.[Name],
			u.DisplayName
		FROM 
			[claim].[Claim] (NOLOCK) clm 
			INNER JOIN [claim].[FuneralRegistryDetails] (NOLOCK) fdr ON fdr.ClaimId = clm.Id
			INNER JOIN [common].[DeathType] (NOLOCK) dt ON fdr.DeathTypeId = dt.Id
			INNER JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.Id
			INNER JOIN [client].[Client] (NOLOCK) cnt ON pol.ClientId = cnt.Id
			INNER JOIN [security].[User] (NOLOCK) u ON clm.AssignedToUserId = u.Id
			LEFT JOIN [policy].[CommissionDetail] (NOLOCK) comd ON comd.PolicyId = pol.Id
			LEFT JOIN [policy].[CommissionSummary] (NOLOCK) coms ON comd.CommissionSummaryId = coms.Id
			INNER JOIN [policy].[ClientCover] (NOLOCK) cvr ON cvr.PolicyId = pol.Id AND cvr.ClientId = cnt.Id
			INNER JOIN [product].[Product] (NOLOCK) prd ON cvr.ProductId = prd.Id
		WHERE
			clm.CreatedDate BETWEEN @DateFrom AND @DateTo AND
			clm.ClaimStatusId IN (SELECT Id FROM [claim].[ClaimStatus] (NOLOCK)
								  WHERE [Status] IN (SELECT [Status] FROM [claim].[ClaimStatus] (NOLOCK) WHERE Id = 3) AND Id NOT IN (4))*/
								  Id INT,
			ClaimNumber VARCHAR(20), 
			PolicyNumber VARCHAR(20),
			Channel VARCHAR(50),  
			CurrentDate DATETIME,
			DatePended DATETIME,
			TypeOfDeath VARCHAR(50),
			Product VARCHAR(100),  
			Brokerage VARCHAR(100),  
			[Broker] VARCHAR(100), 
			Scheme VARCHAR(100), 
			CompanyName VARCHAR(100),
			Assessor VARCHAR(100));

	INSERT INTO @Claim
	SELECT distinct
	--Current Date 
	--Date Pended
	--Claim Number
	--Policy Number
	--Channel
	--Type of Death
	--Product
	--Brokerage
	--Broker
	--Scheme
	--Company name
	--Assessor
			clm.ClaimId,
			--clm.CreatedDate,
			GETDATE()					[Current Date],
			GETDATE()					[Date Pended], --Mocked this date still to get the appropriate date 
			clm.ClaimReferenceNumber	[Claim Number], 
			pol.PolicyNumber			[Policy Number],
			''							[Channel],
			''							[Type of Death], 
			''				[Product],
			''		[Brokerage],
			''			[Broker],
			'Test Scheme'				[Scheme],  
			''							[Company name],
			u.DisplayName				[Assessor]
		FROM 
			[claim].[Claim] (NOLOCK) clm 
			LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			LEFT JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.PolicyId
			--LEFT JOIN [client].[Client] (NOLOCK) cnt ON pol.ClientId = cnt.Id
			LEFT JOIN [security].[User] (NOLOCK) u ON clm.AssignedToUserId = u.Id
			--LEFT JOIN [policy].[CommissionDetail] (NOLOCK) comd ON comd.PolicyId = pol.PolicyId
			--LEFT JOIN [policy].[CommissionSummary] (NOLOCK) coms ON comd.CommissionSummaryId = coms.Id
			--INNER JOIN [policy].[ClientCover] (NOLOCK) cvr ON cvr.PolicyId = pol.PolicyId AND cvr.ClientId = cnt.Id
			--INNER JOIN [product].[Product] (NOLOCK) prd ON cvr.ProductId = prd.Id
		WHERE
			clm.CreatedDate BETWEEN @DateFrom AND @DateTo AND
			clm.ClaimStatusId IN (3) and clm.claimstatusid not in(4)
		--ORDER BY clm.CreatedDate DESC

		SELECT * FROM @Claim
END
