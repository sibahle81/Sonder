CREATE PROCEDURE [claim].[ExgratiaReport]
	@DateFrom As Date,
	@DateTo AS Date
	--@ClaimStatusId As INT = 0
AS
BEGIN
	
	/*IdDECLARE @Claim AS TABLE(
			 INT,
			Product VARCHAR(100),
			Brokerage VARCHAR(100), 
			[Broker] VARCHAR(100),
			Scheme VARCHAR(100),  
			CompanyName VARCHAR(100), 
			Channel VARCHAR(50),
			DatePaid DATETIME, 
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
			RefundsToRMA MONEY,
			UnclaimedBenefitInterest MONEY,
			AmountPaid MONEY,
			BenefitAmount MONEY);

	INSERT INTO @Claim
	
	
	
	
	Date of Death,,Type of Death, Benefit Amount, date paid , claim status , reason for payment,  Gross amount,Net payment
	*/


SELECT DISTINCT
			--clm.claimId,
				
			--clm.CreatedDate				[RegistrationDate],
			--pe.DateCaptured				[Date Captured],
			--isnull (clm.claimreferencenumber, pe.Personeventreferencenumber)	[Claim Number],
			clm.modifieddate			[Decision Date],
			clm.CreatedDate				[RegistrationDate],
			channel.name				[Channel],
			users1.displayname		    [Assessor],
			brg.name					[Brokerage],
			bpre.Code					[Broker],
			prod.name					[Scheme],
			bpre.SurnameOrCompanyName	[Company Name],
			pers.FirstName				[Deceased name]	,
			pers.Surname				[Deceased Surname],
			pol.PolicyNumber			[Policy Number]	,
			isnull (clm.claimreferencenumber, pe.Personeventreferencenumber)	[Claim Number],
			Pers.idnumber				[Id Number or Passport],
			dt.name						[Type of Death],
			pd.deathdate				[Date of Death]	,
			ben.benefitamount			[Benefit Amount],
			pay.PaymentConfirmationDate	[Date Paid],
			sts.name                    [Claim Status],
			''							[reason for payment],
			pay.amount					[Gross amount],
			pay.amount								[Net payment]
	
		
	
			FROM [claim].[Claim] (NOLOCK) clm 
			LEFT JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			LEFT JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			left JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
			LEFT JOIN [Payment].[Payment] (NOLOCK) pay ON pay.claimid = clm.claimid
			LEFT JOIN [client].[person](NOLOCK)pers ON  pers.roleplayerid =  pe.InsuredLifeId
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
			LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
			LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
			LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
			LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
			LEFT JOIN [common].communicationtype(NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
			LEFT JOIN [security].[User](NOLOCK) users ON users.id = clm.AssignedToUserId
			JOIN [policy].policyInsuredLives pil ON pil.RolePlayerId = pe.InsuredLifeId
            JOIN client.RolePlayerType rpt ON rpt.RolePlayerTypeId = pil.RolePlayerTypeId
			JOIN [claim].[claimstatus]sts ON sts.claimstatusid = clm.claimstatusid
			LEFT JOIN [product].[ProductOptionBenefit] pob ON pob.ProductOptionId = pol.ProductOptionId
            LEFT JOIN [product].BenefitRate ben ON ben.BenefitId = pob.BenefitId
			--LEFT JOIN [policy].[policyInsuredLives] pil ON pil.roleplayerid = pe.insuredlifeid
			--left join client.RolePlayerType rt ON rt.roleplayertypeid = pil.roleplayertypeid
			left JOIN [claim].[claimworkflow](NOLOCK)workflowAssesor ON workflowAssesor.claimid=clm.claimid and workflowAssesor.claimstatusid=1
			left JOIN [security].[User](NOLOCK) users1 ON users1.id = workflowAssesor.AssignedToUserId
			
	
		WHERE
			clm.CreatedDate BETWEEN @DateFrom AND @DateTo AND
			clm.ClaimStatusId IN (9,16,17,18)

		--SELECT * FROM @Claim			order by [RegistrationDate] desc
END








