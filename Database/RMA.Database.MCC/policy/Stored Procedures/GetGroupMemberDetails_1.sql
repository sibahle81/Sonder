
CREATE   PROCEDURE [policy].[GetGroupMemberDetails] (@policyId int)
AS BEGIN

-- Check if the policy id belongs to a scheme
declare @isScheme bit = 0
select @isScheme = iif(isnull(co.RolePlayerId, 0) > 0, 1, 0) 
	from [client].[Company] co with (nolock)
		inner join policy.Policy p with (nolock) on p.PolicyOwnerId = co.RolePlayerId 
	where p.PolicyId = @policyId

select p.[PolicyNumber],
       concat(per.[FirstName], ' ', per.[Surname]) [MemberName],
       per.[IdNumber],per.[DateOfBirth],
       isnull(pil.[StartDate], p.[PolicyInceptionDate]) [StartDate],
    --   case isnull(p.[ParentPolicyId], -1) 
		  --when -1 then [policy].[CalculateIndividualPolicyPremium](t.[BaseRate], p.[AdminPercentage], p.[CommissionPercentage], p.[BinderFeePercentage]) 
    --      else         [policy].[CalculateGroupPolicyPremium](t.[BaseRate], p.[AdminPercentage], p.[CommissionPercentage], p.[BinderFeePercentage], p.[PremiumAdjustmentPercentage])
    --   end [MemberRate],
       p.InstallmentPremium [MemberRate],		
       t.[BenefitAmount],
       [WaitingPeriodEnd] = dateadd(month,CAST(ISNULL(json_value(ppor.[RuleConfiguration], '$[0].fieldValue'),0) AS INT),ISNULL(pil.[StartDate], p.[PolicyInceptionDate])),
       [UpgradeDowngradeWaitingPeriodEnd] = dateadd(month,CAST(ISNULL(json_value(ppor.[RuleConfiguration], '$[0].fieldValue'),0) AS INT), ppcp.[EffectiveDate]),
	   ppcp.[EffectiveDate],
	   [IsEuropAssist] = p.[IsEuropAssist]
from [policy].[Policy] parent (nolock)
       inner join [policy].[Policy] p (nolock) on p.[ParentPolicyId] = parent.[PolicyId]
       inner join [policy].[PolicyStatusActionsMatrix] pam (nolock) on pam.PolicyStatus = p.PolicyStatusId
       inner join [policy].[PolicyInsuredLives] pil (nolock) on pil.[PolicyId] = p.[PolicyId]
       inner join [client].[Person] per (nolock) on per.[RolePlayerId] = pil.[RolePlayerId]
       inner join  product.ProductOption ppo on  p.[ProductOptionId] = ppo.Id
       left join product.ProductOptionRule ppor on ppo.id = ppor.ProductOptionId and ppor.RuleId = 5 and ppor.IsDeleted = 0
	   left join [product].[Benefit] b (nolock) on b.[Id] = pil.[StatedBenefitId]
       left join (
              select [BenefitId],
              [BaseRate],
              [BenefitAmount],
              rank() over (partition by [BenefitId] order by [EffectiveDate] desc) [Rank]
              from [product].[BenefitRate] (nolock)
              where [EffectiveDate] <= getdate() 
              and [IsDeleted] = 0
			   ) t on t.[BenefitId] = b.[Id]
		left join [policy].[PolicyChangeProduct] ppcp (nolock) on ppcp.policyid =parent.[PolicyId] 
where iif(@isScheme = 1, p.ParentPolicyId, p.[PolicyId]) = @policyId
  and pil.[InsuredLifeStatusId] = 1
  and pam.[DoRaiseInstallementPremiums] = 1
  and t.[Rank] = 1
order by p.[PolicyNumber], b.[CoverMemberTypeId], [MemberName]

END