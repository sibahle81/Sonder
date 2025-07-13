
---- =============================================
---- Author:		Mbali Mkhize
---- Create date: 2021-04-06
---- Description:	Report Process [claim].[ClaimSummaryVolumesReport] 
---- =============================================


 CREATE PROCEDURE [claim].[ClaimSummaryVolumesReport]
	
AS
BEGIN   

DECLARE @MinMonth INT
DECLARE @CurrMonth INT
DECLARE @SecondMonth INT
DECLARE @ThirdMonth INT
DECLARE @FourthMonth INT
DECLARE @FifthMonth INT

 SET @MinMonth = Year(DATEADD(MONTH, -5, GETDATE())) * 100 + (Month(DATEADD(MONTH, -5, GETDATE())))
 SET @SecondMonth =Year(DATEADD(MONTH, -4, GETDATE())) * 100 + (Month(DATEADD(MONTH, -4, GETDATE())))
 SET @ThirdMonth =Year(DATEADD(MONTH, -3, GETDATE())) * 100 + (Month(DATEADD(MONTH, -3, GETDATE())))
 SET @FourthMonth =Year(DATEADD(MONTH, -2, GETDATE())) * 100 + (Month(DATEADD(MONTH, -2, GETDATE())))
 SET @FifthMonth =Year(DATEADD(MONTH, -1, GETDATE())) * 100 + (Month(DATEADD(MONTH, -1, GETDATE())))
 SET @CurrMonth =(YEAR(getdate()) * 100) + (MONTH(getdate()) * 1)



 IF OBJECT_ID(N'tempdb..#tempfinal', N'U') IS NOT NULL
	DROP TABLE #tempfinal;

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
			clm.CreatedDate				[RegistrationDate],
			pe.DateCaptured				[Date Captured],
			isnull (clm.claimreferencenumber, pe.Personeventreferencenumber)	[Claim Number],
			pol.PolicyNumber			[Policy Number]	,
			parp.DisplayName			[Scheme],
			ccs.[Status]				[ClaimStatus],
			CASE WHEN ccs.[Status] IN ('Pending','New','Approved','Awaiting Decline decision','Awaiting Requirements') THEN 'Pending'
				 WHEN ccs.[Status] ='Paid' THEN 'Paid'
				 WHEN ccs.[Status] ='Authorised' THEN 'Authorised'
				 WHEN clm.ClaimStatusId in (10,19,27) THEN 'Declined'
				 WHEN clm.ClaimStatusId in (7) THEN 'Cancelled' ELSE 'Other' END AS OverallStatus,
			SUM(CASE WHEN ccs.[Status] IN ('Authorised','Declined','Pending','New','Approved','Awaiting Decline decision','Awaiting Requirements','Paid') THEN 1 ELSE 0 END) AS [TotalClaims],
			SUM(CASE WHEN ccs.[Status] = 'Paid' THEN 1 ELSE 0 END) AS [PaidClaims],
			SUM(CASE WHEN ccs.[Status] IN ('Pending','New','Approved','Awaiting Decline decision','Awaiting Requirements') THEN 1 ELSE 0 END) AS [PendingClaims],
			SUM(CASE WHEN clm.ClaimStatusId in (10,19,27) THEN 1 ELSE 0 END) AS [DeclinedClaims],
			SUM(CASE WHEN clm.ClaimStatusId in (7) THEN 1 ELSE 0 END) AS [CancelledClaims],
			SUM(CASE WHEN ccs.[Status] ='Authorised' THEN 1 ELSE 0 END) AS [AuthorisedClaims],
			Month(clm.[CreatedDate])	[RegistrationMonth],
			Year(clm.[CreatedDate])		[RegistrationYear],
			(YEAR(clm.[CreatedDate]) * 100) + (MONTH(clm.[CreatedDate]) * 1) [RegistrationYearMonth],
			Sum(ISNULL(pay.[Amount],0)) As [AmountPaid],
			SUM(CASE WHEN ccs.[Status] = 'Paid' THEN ISNULL(pay.[Amount],0) ELSE 0 END) AS [PaidClaimsAmount],
			SUM(CASE WHEN ccs.[Status] IN ('Pending','New','Approved','Awaiting Decline decision','Awaiting Requirements') THEN ISNULL(cca.[TotalAmount],0) ELSE 0 END) AS [PendingClaimsAmount],
			SUM(CASE WHEN clm.ClaimStatusId in (10,19,27) THEN ISNULL(cca.[TotalAmount],0) ELSE 0 END) AS [DeclinedClaimsAmount],
			SUM(CASE WHEN clm.ClaimStatusId in (7) THEN ISNULL(cca.[TotalAmount],0) ELSE 0 END) AS [CancelledClaimsAmount],
			SUM(CASE WHEN clm.ClaimStatusId in (14) THEN ISNULL(cca.[TotalAmount],0) ELSE 0 END) AS [AuthorisedClaimsAmount],
			(select Top 1 CAST(StartDateTime As date)
			from Claim.ClaimWorkflow where claimStatusId in (select distinct ClaimStatusId from [claim].[ClaimStatus]
															where Status ='Pending') 
															and claimid = clm.ClaimId order by ClaimWorkflowId 	)  AS PendingDate	

			
			INTO #tempfinal 
			FROM [claim].[Claim] (NOLOCK) clm 
			INNER JOIN [claim].[PersonEvent] (NOLOCK) pe ON pe.personEventid = clm.PersonEventid 
			--INNER JOIN bpm.Wizard wizard WITH (NOLOCK) ON pe.EventId = wizard.LinkedItemId
			LEFT JOIN [claim].[PersonEventDeathDetail] (NOLOCK) pd ON pd.personEventid = clm.PersonEventid 
			LEFT JOIN [common].[DeathType] (NOLOCK) dt ON pd.DeathTypeId = dt.Id
			left JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.policyid
			--LEFT JOIN [Payment].[Payment] (NOLOCK) pay ON pay.claimid = clm.claimid
			LEFT JOIN [client].[person](NOLOCK)pers ON  pers.roleplayerid =  pe.InsuredLifeId
			LEFT JOIN [client].[Company] (NOLOCK) com ON  com.roleplayerid =  pe.InsuredLifeId
			LEFT join [product].[ProductOption] (NOLOCK) prod ON prod.id = pol.ProductOptionId
			LEFT join [product].[Product] (NOLOCK) ppr ON prod.ProductId = ppr.Id
			LEFT JOIN [product].[ProductOptionCoverType] (NOLOCK)prodCT ON  prodCT.ProductOptionId = prod.id
			INNER JOIN [Common].[CoverType] CT (NOLOCK)ON ct.id = prodCT.covertypeid
			LEFT JOIN [client].[roleplayer](NOLOCK)rp ON rp.roleplayerid =  pe.InsuredLifeId
			LEFT join [broker].[brokerage] (NOLOCK) brg ON brg.Id =	pol.BrokerageId
			LEFT JOIN [broker].[Representative] (NOLOCK)bpre ON bpre.Id =  pol.RepresentativeId
			LEFT JOIN [common].communicationtype(NOLOCK) channel ON channel.id = rp.PreferredCommunicationTypeId
			LEFT JOIN [security].[User](NOLOCK) users ON users.id = clm.AssignedToUserId
			LEFT JOIN [policy].[Policy] papol (nolock) on paPol.PolicyId = pol.ParentPolicyId
			LEFT JOIN [client].[roleplayer] parp  (NOLOCK) on parp.RolePlayerId = papol.policyOwnerId
			LEFT JOIN [claim].[claimworkflow](NOLOCK)workflowAssesor ON clm.claimid=workflowAssesor.claimid and workflowAssesor.claimstatusid=1
			LEFT JOIN [security].[User](NOLOCK) users1 ON users1.id = workflowAssesor.AssignedToUserId
			LEFT JOIN [claim].[ClaimStatus] (NOLOCK) ccs ON clm.ClaimStatusId = ccs.ClaimStatusId
			LEFT JOIN [claim].[ClaimsCalculatedAmount] (NOLOCK)  cca ON cca.ClaimId = clm.ClaimId
			LEFT JOIN [Payment].[Payment] (NOLOCK) pay ON pay.claimid = clm.claimid
			--where pay.paymentstatusid <> 4
		WHERE			
			(YEAR(clm.CreatedDate) * 100) + (MONTH(clm.CreatedDate) * 1) BETWEEN  @MinMonth AND @CurrMonth 

		Group by
		    clm.CreatedDate,
			pe.DateCaptured,
			clm.claimreferencenumber, 
			pe.Personeventreferencenumber,
			CT.name,
			ppr.[Name],
			pol.PolicyNumber,
			parp.DisplayName,
			ccs.[Status],
			clm.[ClaimStatusId],
			clm.claimid

		 	SELECT  top 10
					Scheme,
					[Business Class],
					[RegistrationYearMonth],
					SUM([TotalClaims]) AS [TotalClaims],
					SUM([DeclinedClaimsAmount]) AS [DeclinedClaimsAmount],
					SUM([PaidClaimsAmount]) AS [PaidClaimsAmount],
					OverallStatus
			INTO #final
			FROM #tempfinal
			WHERE [Scheme]IS NOT NULL AND [Business Class] ='Group' 
			AND [RegistrationYearMonth] =@CurrMonth
			group by Scheme,
					[Business Class],
					[RegistrationYearMonth],
					OverallStatus
			ORDER BY [TotalClaims] desc				



			SELECT  top 10
					Scheme,
					[Business Class],
					[RegistrationYearMonth],
					SUM([TotalClaims]) AS [TotalClaims],
					SUM([DeclinedClaimsAmount]) AS [DeclinedClaimsAmount],
					SUM([PaidClaimsAmount]) AS [PaidClaimsAmount],
					OverallStatus
			INTO #final1
			FROM #tempfinal
			WHERE [Scheme]IS NOT NULL AND [Business Class] ='Group' 
			AND [RegistrationYearMonth] =@MinMonth
			group by Scheme,
					[Business Class],
					[RegistrationYearMonth],
					OverallStatus
			ORDER BY [TotalClaims] desc	



			SELECT  top 10
					Scheme,
					[Business Class],
					[RegistrationYearMonth],
					SUM([TotalClaims]) AS [TotalClaims],
					SUM([DeclinedClaimsAmount]) AS [DeclinedClaimsAmount],
					SUM([PaidClaimsAmount]) AS [PaidClaimsAmount],
					OverallStatus
			INTO #final2
			FROM #tempfinal
			WHERE [Scheme]IS NOT NULL AND [Business Class] ='Group'
			AND [RegistrationYearMonth] =@ThirdMonth
			group by Scheme,
					[Business Class],
					[RegistrationYearMonth],
					OverallStatus 
			ORDER BY [TotalClaims] desc			

			

			SELECT  top 10
					Scheme,
					[Business Class],
					[RegistrationYearMonth],
					SUM([TotalClaims]) AS [TotalClaims],
					SUM([DeclinedClaimsAmount]) AS [DeclinedClaimsAmount],
					SUM([PaidClaimsAmount]) AS [PaidClaimsAmount],
					OverallStatus
			INTO #final3
			FROM #tempfinal
			WHERE [Scheme]IS NOT NULL AND [Business Class] ='Group'
			AND [RegistrationYearMonth] =@SecondMonth
			group by Scheme,
					[Business Class],
					[RegistrationYearMonth],
					OverallStatus
			ORDER BY [TotalClaims] desc	

			SELECT  top 10
					Scheme,
					[Business Class],
					[RegistrationYearMonth],
					SUM([TotalClaims]) AS [TotalClaims],
					SUM([DeclinedClaimsAmount]) AS [DeclinedClaimsAmount],
					SUM([PaidClaimsAmount]) AS [PaidClaimsAmount],
					OverallStatus
			INTO #final4
			FROM #tempfinal
			WHERE [Scheme]IS NOT NULL AND [Business Class] ='Group'
			AND [RegistrationYearMonth] =@FourthMonth
			group by Scheme,
					[Business Class],
					[RegistrationYearMonth],
					OverallStatus	
			ORDER BY [TotalClaims] desc			

			

			SELECT  top 10
					Scheme,
					[Business Class],
					[RegistrationYearMonth],
					SUM([TotalClaims]) AS [TotalClaims],
					SUM([DeclinedClaimsAmount]) AS [DeclinedClaimsAmount],
					SUM([PaidClaimsAmount]) AS [PaidClaimsAmount],
					OverallStatus
			INTO #final5
			FROM #tempfinal
			WHERE [Scheme]IS NOT NULL AND [Business Class] ='Group' 
			AND [RegistrationYearMonth] =@FifthMonth
			group by Scheme,
					[Business Class],
					[RegistrationYearMonth],
					OverallStatus
			ORDER BY [TotalClaims] DESC

			SELECT * FROM #final
			UNION
			SELECT * FROM #final1
			UNION
			SELECT * FROM #final2
			UNION
			SELECT * FROM #final3
			UNION
			SELECT * FROM #final4
			UNION
			SELECT * FROM #final5

	
END