
--/****** Object:  StoredProcedure [policy].[ActiveFuneralLivesReport]    Script Date: 2021/03/23 8:52:44 AM ******/
--SET ANSI_NULLS ON
--GO

--SET QUOTED_IDENTIFIER ON
--GO



---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2021/01/25
---- EXEC [policy].[ActiveFuneralLivesReport] '2020-08-01', '2020-10-31'
---- =============================================
CREATE   PROCEDURE [policy].[ActiveFuneralLivesReport]
	@StartDate As Date,
	@EndDate AS Date

AS
BEGIN

	IF OBJECT_ID(N'tempdb..#TempPolicyInsuredLives', N'U') IS NOT NULL
		DROP TABLE #TempPolicyInsuredLives;

		select count(policyid) Nooflives,
				policyid 
		into #TempPolicyInsuredLives
		from [policy].[PolicyInsuredLives] 
		group by policyid


	IF OBJECT_ID(N'tempdb..#tempparentpol', N'U') IS NOT NULL
		DROP TABLE #tempparentpol;

	select distinct
 
		[PolicyHolderName] = r.[DisplayName],
		CASE WHEN r.RolePlayerIdentificationTypeId = 2 THEN ccmp.Name
			 WHEN r.RolePlayerIdentificationTypeId = 1 THEN cpn.FirstName + ' ' + cpn.Surname 
			 END AS [name],
		[MemberNumber] = cfp.[FinPayeNumber],
		p.[PolicyNumber],
		paPol.[PolicyNumber] AS [ChildPolicyNumber],
		[InceptionDate] = p.[PolicyInceptionDate],
		[CreationDate] = CAST(p.[CreatedDate] AS DATE),
		Sum(pil.Nooflives) AS [Lives],
		[Premium] = p.[InstallmentPremium] ,
		[IndustryClass] =ICD.[Name] 

	into #tempparentpol 
	FROM [policy].[Policy] p 
    inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
	left join Client.FinPayee cfp ON p.[PolicyOwnerId] = cfp.RolePlayerID 
	left join [common].[Industry] IC ON IC.Id =cfp.IndustryId
	left join [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
	left join [common].[PolicyStatus] cps ON p.[PolicyStatusId] = cps.[Id]
	left join Client.Person cpn ON  r.RolePlayerId = cpn.RolePlayerId
	left join Client.Company ccmp ON r.RolePlayerId = ccmp.RolePlayerId
	left join [policy].[Policy] paPol (nolock) on  p.PolicyId = paPol.ParentPolicyId 
	left join #TempPolicyInsuredLives pil on pil.[PolicyId] = ISNULL(papol.[PolicyId],p.[PolicyId])
	WHERE p.policyid IN (SELECT PolicyId FROM [policy].[policy]
							WHERE PolicyStatusId in (1,8))
	and p.[PolicyInceptionDate]between @StartDate and @EndDate

	group by 
		r.[DisplayName],
		CASE WHEN r.RolePlayerIdentificationTypeId = 2 THEN ccmp.Name
			 WHEN r.RolePlayerIdentificationTypeId = 1 THEN cpn.FirstName + ' ' + cpn.Surname 
			 END,
		cfp.[FinPayeNumber],
		p.[PolicyNumber],
		paPol.[PolicyNumber],
		p.[PolicyInceptionDate],
		CAST(p.[CreatedDate] AS DATE),
		p.[InstallmentPremium] ,
		ICD.[Name]



	IF OBJECT_ID(N'tempdb..#tempfinal', N'U') IS NOT NULL
	DROP TABLE #tempfinal;

	SELECT 
		tmp.[PolicyHolderName],
		tmp.[name],
		tmp.[MemberNumber],
		tmp.[PolicyNumber],
		tmp.[ChildPolicyNumber],
		tmp.[InceptionDate],
		tmp.[CreationDate],
		tmp.[Lives],
		tmp.[Premium] ,
		tmp.[IndustryClass],
		CASE WHEN tmp.[IndustryClass] ='Individual' THEN 'N/A'
			 ELSE r.[DisplayName] END AS [ChildPolicyHolderName],
		CASE WHEN tmp.[IndustryClass] ='Individual' THEN 'N/A'
			 ELSE cfp.[FinPayeNumber] END  AS [ChildMemberNumber] ,
		CASE WHEN tmp.[IndustryClass] ='Individual' THEN NULL
			 ELSE p.[PolicyInceptionDate] END AS [ChildInceptionDate],
		CASE WHEN tmp.[IndustryClass] ='Individual' THEN NULL
			 ELSE CAST(p.[CreatedDate] AS DATE) END AS [ChildCreationDate],
		CASE WHEN tmp.[IndustryClass] ='Individual' THEN 0
			 ELSE p.[InstallmentPremium] END AS [ChildPremium]

--select count(*) --50094
	into #tempfinal
	from policy.policy p
	inner join #tempparentpol tmp on p.[PolicyNumber] = ISNULL(tmp.[ChildPolicyNumber],tmp.[PolicyNumber])
	inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
	left join Client.FinPayee cfp ON p.[PolicyOwnerId] = cfp.RolePlayerID 
	LEFT JOIN policy.PolicyInsuredLives pil ON p.PolicyId = pil.PolicyId
	Where p.[PolicyInceptionDate]between @StartDate and @EndDate
	AND pil.[RolePlayerTypeId] = 10 
	AND p.PolicyStatusId in (1,8)
	ORDER BY tmp.[PolicyNumber]

	select * from #tempfinal
	where [IndustryClass] IS NOT NULL 

END