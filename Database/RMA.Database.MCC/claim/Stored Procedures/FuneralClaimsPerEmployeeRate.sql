
CREATE PROCEDURE [claim].[FuneralClaimsPerEmployeeRate]
AS
BEGIN

	SELECT
			YEAR(PP.[PolicyInceptionDate]) AS [CoverPolicyYear],
			FP.[FinPayeNumber] AS [MemberNumber],
			PRP.[DisplayName] AS [MemberName],
			I.[Name] AS [IndustryClass],
			ICD.[NAME] AS [Industry],
			C.[Name] AS [GroupName],
			Pro.[Name] AS [Product],
			SUM(P.[InstallmentPremium]) AS [TotalPremium],
			COUNT(PIL.[PolicyId]) AS [NumberOfLives],
			COUNT(DISTINCT CLM.[ClaimId]) AS [NumberOfClaims],
			COALESCE(SUM(PMT.Amount),0) AS [TotalPaid],
			(CAST(COUNT(DISTINCT CLM.[ClaimId]) AS FLOAT) / CAST(COUNT(PIL.[PolicyId]) AS FLOAT)) * 100 AS [Rate]	
		FROM [policy].[Policy] PP	
			INNER JOIN [policy].[Policy] P (nolock) ON PP.[PolicyId] = P.[ParentPolicyId]
			INNER JOIN [policy].[PolicyInsuredLives] PIL ON P.[PolicyId] = PIL.[PolicyId]
			INNER JOIN [client].[RolePlayer] PRP ON PRP.[RolePlayerId] = PP.[PolicyOwnerId]
			INNER JOIN [client].[FinPayee] FP ON FP.[RolePlayerId] = PP.[PolicyOwnerId]
			INNER JOIN [client].[Company] C ON PRP.[RolePlayerId] = C.[RolePlayerId]
			INNER JOIN [common].[Industry] I ON I.[Id] = FP.[IndustryId]
			INNER JOIN [common].[IndustryClass] ICD ON ICD.[Id] =I.[IndustryClassId]
			INNER JOIN [product].[ProductOption] PO (nolock) ON PO.[Id] = P.[ProductOptionId]
			INNER JOIN [product].[Product] Pro ON PO.[ProductId] = pro.[Id]
			Inner JOIN [claim].[Claim] CLM (nolock) ON P.[PolicyId] = CLM.[PolicyId] 
			LEFT JOIN [payment].[Payment] PMT ON CLM.[ClaimId] = PMT.[ClaimId] AND CLM.[ClaimStatusId] = 9	
		GROUP BY YEAR(PP.[PolicyInceptionDate]),FP.[FinPayeNumber],PRP.[DisplayName],I.[Name],ICD.[NAME],C.[Name],Pro.[Name]
		HAVING ((CAST(COUNT(DISTINCT CLM.[ClaimId]) AS FLOAT) / CAST(COUNT(PIL.[PolicyId]) AS FLOAT)) * 100) > 49
		ORDER BY YEAR(PP.[PolicyInceptionDate])
	
END