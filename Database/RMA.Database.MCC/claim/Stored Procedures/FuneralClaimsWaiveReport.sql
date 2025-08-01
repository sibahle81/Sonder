-- =============================================
-- Author:		Sanele Ngidi
-- Create date: 2019-10-16
-- Description:	
-- =============================================
CREATE PROCEDURE [claim].[FuneralClaimsWaiveReport]
	@DateFrom As Date,
	@DateTo AS Date
	--@ClaimStatusId As INT = 0
AS
BEGIN
	
	DECLARE @Claim AS TABLE(
			Id INT,  
			DateWaived DATETIME,
			NameOfDocument VARCHAR(100),
			WaivedBy VARCHAR(100),
			ClaimNumber VARCHAR(20),
			PolicyNumber VARCHAR(20), 
			Scheme VARCHAR(100), 
			StatusOfTheClaim VARCHAR(100),
			Product VARCHAR(100),
			Channel VARCHAR(50),
			Brokerage VARCHAR(100), 
			[Broker] VARCHAR(100),
			CompanyName VARCHAR(100));

	INSERT INTO @Claim
	

			
			
		SELECT DISTINCT 
			clm.claimId,
			GETDATE()						[Date waived],---mock date
			'FuneralClaimsWaiveReport'		[Name of document],
			users.displayname				[Waived By],
			clm.claimreferencenumber		[Claim Number],
			pol.PolicyNumber				[policy number],
			prod.name						[Scheme], 
			cs.Status						[Status of the claim],
			prod.name						[Product type],
			channel.name					[Channel],
			brg.name						[Brokerage], 
			bpre.Code						[Broker],
			bpre.SurnameOrCompanyName		[Company Name]
			


		FROM 
			[claim].[Claim] (NOLOCK) clm 
			LEFT JOIN [claim].[PersonEvent]		(NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			INNER JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			LEFT JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyId
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
			LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
			LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
			LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
			LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
			inner JOIN [claim].[claimstatus](NOLOCK)cs ON cs.claimstatusid = clm.claimstatusid
			left JOIN [common].[communicationtype](NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
			LEFT JOIN [security].[User](NOLOCK) users ON users.id = clm.AssignedToUserId

		WHERE
			clm.CreatedDate BETWEEN @DateFrom AND @DateTo AND
			clm.ClaimStatusId IN (22)

		SELECT * FROM @Claim
END
