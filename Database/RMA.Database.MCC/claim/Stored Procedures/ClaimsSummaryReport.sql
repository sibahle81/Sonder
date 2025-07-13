




-- =============================================
-- Author:		Mbali Mkhize
-- Create date: 2021-04-06
-- Description:	Report Process [claim].[ClaimsSummaryReport] '2019-12-01', '2020-04-30'
-- =============================================


CREATE  PROCEDURE [claim].[ClaimsSummaryReport]
	--@DateFrom As varchar(20),
	--@DateTo AS varchar(20)
	
	
AS
BEGIN   

DECLARE @MinMonth INT
DECLARE @CurrMonth INT

 SET @MinMonth = Year(DATEADD(MONTH, -5, GETDATE())) * 100 + (Month(DATEADD(MONTH, -5, GETDATE())))
 SET @CurrMonth =(YEAR(getdate()) * 100) + (MONTH(getdate()) * 1)

  IF OBJECT_ID(N'tempdb..#ClaimTAT', N'U') IS NOT NULL
			DROP TABLE #ClaimTAT;

  SELECT
  clm.[ClaimId],
  bpm.CalculateOverAllTAT(wizard.StartDateAndTime,
							CASE WHEN clm.ClaimId IS NULL 
								THEN wizard.EndDateAndTime 
								ELSE (select top 1 CW.EndDateTime 
									from [claim].[claim] CL INNER JOIN [claim].[claimWorkflow] CW 
										ON CL.ClaimId = CW.ClaimId 
										where CL.ClaimId = clm.ClaimId 
									order by CW.ClaimWorkflowId desc) 
								END) As OverAllTAT,
	(Select Top 1 StartDateTime  
		from Claim.ClaimWorkflow 
		where claimStatusId in (1,2,3,4,5,11,12,13,21,22,24,26,28,31) And ClaimId = clm.ClaimId 
		order by ClaimWorkflowId) as DateClaimPended,
	(Select Top 1 ISNULL(EndDateTime ,GETDATE()) 
		from Claim.ClaimWorkflow 
		where claimStatusId in (1,2,3,4,5,11,12,13,21,22,24,26,28,31) And ClaimId = clm.ClaimId 
		order by ClaimWorkflowId desc) as EndDateClaimPended
	INTO #ClaimTAT
	FROM [claim].[Claim] (NOLOCK) clm 
	INNER JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
	INNER JOIN bpm.Wizard wizard WITH (NOLOCK) ON pe.EventId = wizard.LinkedItemId
 	WHERE wizard.Name = 'New funeral claim: - ' + CAST(pe.PersonEventId AS VARCHAR(12)) 

	
	IF OBJECT_ID(N'tempdb..#Final', N'U') IS NOT NULL
			DROP TABLE #Final;

	 SELECT DISTINCT
		 CASE WHEN(CT.name='Individual Voluntary') 
				THEN 'Individual'
				WHEN (CT.name LIKE'%Group%') 
				THEN 'Group'
				WHEN (CT.name LIKE'%Corperate%') 
				THEN 'Corperate'
				WHEN (CT.name LIKE'%Staff%') 
				THEN 'Staff'
		END AS [Business Class],
			pe.CreatedDate				[RegistrationDate],
			pe.DateCaptured				[Date Captured],
			isnull (pe.Personeventreferencenumber,clm.claimreferencenumber)	[Claim Number],
			pol.PolicyNumber			[Policy Number]	,
			ISNULL(ccs.[Status],'New')		[ClaimStatus],
			CASE WHEN ISNULL(ccs.[Status],'New') IN ('Pending','New','Approved','Awaiting Decline decision','Awaiting Requirements') THEN 'Pending'
				 WHEN ccs.[Status] ='Paid' THEN 'Paid'
				 WHEN ccs.[Status] ='Authorised' THEN 'Authorised'
				 WHEN clm.ClaimStatusId in (10,19,27) THEN 'Declined'
				 WHEN clm.ClaimStatusId in (7) THEN 'Cancelled' ELSE 'Other' END AS OverallStatus,
			SUM(CASE WHEN ISNULL(ccs.[Status],'New') IN ('Authorised','Declined','Pending','New','Approved','Awaiting Decline decision','Awaiting Requirements','Paid') THEN 1 ELSE 0 END) AS [TotalClaims],
			SUM(CASE WHEN ccs.[Status] = 'Paid' THEN 1 ELSE 0 END) AS [PaidClaims],
			SUM(CASE WHEN ISNULL(ccs.[Status],'New') IN ('Pending','New','Approved','Awaiting Decline decision','Awaiting Requirements') THEN 1 ELSE 0 END) AS [PendingClaims],
			SUM(CASE WHEN clm.ClaimStatusId in (10,19,27) THEN 1 ELSE 0 END) AS [DeclinedClaims],
			SUM(CASE WHEN clm.ClaimStatusId in (7) THEN 1 ELSE 0 END) AS [CancelledClaims],
			SUM(CASE WHEN ccs.[Status] ='Authorised' THEN 1 ELSE 0 END) AS [AuthorisedClaims],
			Month(pe.[CreatedDate])	[RegistrationMonth],
			Year(pe.[CreatedDate])		[RegistrationYear],
			(YEAR(pe.[CreatedDate]) * 100) + (MONTH(pe.[CreatedDate]) * 1) [RegistrationYearMonth],
			Sum(ISNULL(pay.[Amount],0)) As [AmountPaid],
			SUM(CASE WHEN ccs.[Status] = 'Paid' THEN ISNULL(pay.[Amount],0) ELSE 0 END) AS [PaidClaimsAmount],
			SUM(CASE WHEN ccs.[Status] IN (NULL,'Pending','New','Approved','Awaiting Decline decision','Awaiting Requirements') THEN ISNULL(cca.[TotalAmount],0) ELSE 0 END) AS [PendingClaimsAmount],
			SUM(CASE WHEN clm.ClaimStatusId in (10,19,27) THEN ISNULL(cca.[TotalAmount],0) ELSE 0 END) AS [DeclinedClaimsAmount],
			SUM(CASE WHEN clm.ClaimStatusId in (7) THEN ISNULL(cca.[TotalAmount],0) ELSE 0 END) AS [CancelledClaimsAmount],
			SUM(CASE WHEN clm.ClaimStatusId in (14) THEN ISNULL(cca.[TotalAmount],0) ELSE 0 END) AS [AuthorisedClaimsAmount],
			ctat.OverAllTAT,
			ISNULL(ctat.DateClaimPended,pe.DateCaptured) AS DateClaimPended, 
			ISNULL(ctat.EndDateClaimPended,GETDATE()) AS EndDateClaimPended,
			Datediff(dd,pe.DateCaptured,ISNULL(ctat.EndDateClaimPended,GETDATE()))AS DaysClaimPended,
			SUM(CASE WHEN ccs.[Status] = 'Paid' AND substring(ctat.OverAllTAT,1,3) <=24 THEN 1 ELSE 0 END) AS [PaidWithin24],
			SUM(CASE WHEN ccs.[Status] = 'Paid' AND substring(ctat.OverAllTAT,1,3) BETWEEN 24 AND 48 THEN 1 ELSE 0 END) AS [PaidWithin48],
			SUM(CASE WHEN ccs.[Status] = 'Paid' AND substring(ctat.OverAllTAT,1,3) BETWEEN 48 AND 72 THEN 1 ELSE 0 END) AS [PaidWithin72],
			SUM(CASE WHEN ccs.[Status] = 'Paid' AND substring(ctat.OverAllTAT,1,3) >72 THEN 1 ELSE 0 END) AS [PaidAfter72]
	

			
			INTO #Final --Select count(*)--1296
			FROM [claim].[PersonEvent] (NOLOCK) pe
			LEFT JOIN [claim].[Claim] (NOLOCK) clm ON pe.personEventid = clm.PersonEventid 
			--INNER JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			--INNER JOIN bpm.Wizard wizard WITH (NOLOCK) ON pe.EventId = wizard.LinkedItemId
			LEFT JOIN #ClaimTAT ctat ON clm.[ClaimId] =ctat.[ClaimId]
			LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			LEFT JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			left JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
			--LEFT JOIN [Payment].[Payment] (NOLOCK) pay ON pay.claimid = clm.claimid
			LEFT JOIN [client].[person](NOLOCK)pers ON  pers.roleplayerid =  pe.InsuredLifeId
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
			LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
			LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
			LEFT JOIN [product].[ProductOptionCoverType] (NOLOCK)prodCT ON  prodCT.ProductOptionId = prod.id and prodct.CoverTypeId =4
			LEFT JOIN [Common].[CoverType] CT (NOLOCK)ON ct.id = prodCT.covertypeid
			LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
			LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
			LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
			LEFT JOIN [common].communicationtype(NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
			LEFT JOIN [security].[User](NOLOCK) users ON users.id = clm.AssignedToUserId
			LEFT JOIN [policy].[Policy] papol (nolock) on paPol.PolicyId = pol.ParentPolicyId
			LEFT JOIN [client].[roleplayer]  (NOLOCK) parp on parp.RolePlayerId = papol.policyOwnerId
			LEFT JOIN [claim].[claimworkflow](NOLOCK)workflowAssesor ON clm.claimid=workflowAssesor.claimid and workflowAssesor.claimstatusid=1
			LEFT JOIN [security].[User](NOLOCK) users1 ON users1.id = workflowAssesor.AssignedToUserId
			LEFT JOIN [claim].[ClaimStatus] (NOLOCK) ccs ON clm.ClaimStatusId = ccs.ClaimStatusId
			LEFT JOIN [claim].[ClaimsCalculatedAmount] (NOLOCK) cca ON cca.ClaimId = clm.ClaimId
			LEFT JOIN [Payment].[Payment] (NOLOCK) pay ON pay.claimid = clm.claimid
			--where pay.paymentstatusid <> 4
		WHERE			
			(YEAR(pe.[CreatedDate]) * 100) + (MONTH(pe.[CreatedDate]) * 1) BETWEEN  @MinMonth AND @CurrMonth 


		Group by
		    pe.[CreatedDate],
			pe.DateCaptured,
			clm.claimreferencenumber, 
			pe.Personeventreferencenumber,
			ctat.OverAllTAT,
			CT.name,
			ppr.[Name],
			pol.PolicyNumber,
			ccs.[Status],
			clm.[ClaimStatusId],
			ctat.DateClaimPended,
			ctat.EndDateClaimPended

		Select 
			[Business Class],
			RegistrationDate,
			[Date Captured],
			[Claim Number],
			[Policy Number]	,
			[ClaimStatus],
			OverallStatus,
			[TotalClaims],
			[PaidClaims],
			PendingClaims,
			DeclinedClaims,
			CancelledClaims,
			AuthorisedClaims,
			RegistrationMonth,
			RegistrationYear,
			RegistrationYearMonth,
			AmountPaid,
			PaidClaimsAmount,
			PendingClaimsAmount,
			DeclinedClaimsAmount,
			CancelledClaimsAmount,
			AuthorisedClaimsAmount,
			OverAllTAT,
			DateClaimPended,
			EndDateClaimPended,
			DaysClaimPended,			
			SUM(CASE WHEN DaysClaimPended  BETWEEN 0 AND 2 THEN 1 ELSE 0 END) AS [1-2Days],
			SUM(CASE WHEN DaysClaimPended  BETWEEN 3 AND 5 THEN 1 ELSE 0 END) AS [3-5Days],
			SUM(CASE WHEN DaysClaimPended  BETWEEN 6 AND 10 THEN 1 ELSE 0 END) AS [6-10Days],
			SUM(CASE WHEN DaysClaimPended  BETWEEN 11 AND 15 THEN 1 ELSE 0 END) AS [11-15Days],
			SUM(CASE WHEN DaysClaimPended >15 THEN 1 ELSE 0 END) AS [MoreThan16Days],
			PaidWithin24,
			PaidWithin48,
			PaidWithin72,
			PaidAfter72
	
		From #Final
		group by
		[Business Class],
			RegistrationDate,
			[Date Captured],
			[Claim Number],
			[Policy Number]	,
			[ClaimStatus],
			OverallStatus,
			[TotalClaims],
			[PaidClaims],
			PendingClaims,
			DeclinedClaims,
			CancelledClaims,
			AuthorisedClaims,
			RegistrationMonth,
			RegistrationYear,
			RegistrationYearMonth,
			AmountPaid,
			PaidClaimsAmount,
			PendingClaimsAmount,
			DeclinedClaimsAmount,
			CancelledClaimsAmount,
			AuthorisedClaimsAmount,
			OverAllTAT,
			DateClaimPended,
			EndDateClaimPended,
			DaysClaimPended,			
			PaidWithin24,
			PaidWithin48,
			PaidWithin72,
			PaidAfter72

	
END