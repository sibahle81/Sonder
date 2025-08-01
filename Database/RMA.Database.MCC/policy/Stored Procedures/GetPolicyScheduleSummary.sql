CREATE PROCEDURE [policy].[GetPolicyScheduleSummary] (@policyId int, @counter int)
as begin
/*

EXEC [policy].[GetPolicyScheduleSummary] @policyId = 485337, @counter = 1
EXEC [policy].[GetPolicyScheduleSummary] @policyId = 302187, @counter = 1

*/

	declare @date date;
	declare @plan varchar(128)
	declare @amount float
	declare @PolicyScheduleOwnerText varchar(250)

	SELECT @PolicyScheduleOwnerText = CASE WHEN(ISNULL(pdom.PolicyPayeeId,0) = 0) THEN NULL ELSE rp.DisplayName END
	FROM [POLICY].[POLICY] POL (NOLOCK)
		inner join [client].RolePlayer rp (nolock) on rp.RolePlayerId = POL.PolicyPayeeId 
		INNER JOIN [CLIENT].[COMPANY] COMP (NOLOCK) ON COMP.RolePlayerId = rp.RolePlayerId 
		LEFT JOIN [policy].PolicyScheduleOwnerMap pdom (nolock) on pdom.PolicyPayeeId =pol.PolicyPayeeId
	where pol.PolicyId = @policyId
	  and pol.ParentPolicyId is not null 

	select @date = [PolicyInceptionDate] from [policy].[Policy] with (nolock) where [PolicyId] = @policyId
	while @date < getdate() begin
		set @date = dateadd(year, 1, @date)
	end

	select @plan = t.[BenefitName],
	  @amount = t.[BenefitAmount]
	from (
		select b.[Name] [BenefitName],
			br.[BenefitAmount],
			rank() over (partition by b.[Id] order by br.[EffectiveDate] desc) [Rank]
		from [policy].[Policy] p with (nolock)
			inner join [policy].[PolicyInsuredLives] pil with (nolock) on pil.[PolicyId] = p.[PolicyId] and pil.[RolePlayerTypeId] = 10
			inner join [product].[Benefit] b with (nolock) on b.[Id] = pil.[StatedBenefitId]
			inner join [product].[BenefitRate] br with (nolock) on br.[BenefitId] = b.[Id]
		where p.[PolicyId] = @policyId
			and b.[CoverMemberTypeId] = 1
			and br.[IsDeleted] = 0		  
	) t

	select b.[Name] [Brokerage],
		concat(r.[FirstName], ' ', r.[SurnameOrCompanyName]) [Representative],
		p.[PolicyNumber],
		pm.[Name] [PaymentMethod],
		@plan [PolicyPlan],
		@amount [PolicyBenefit],
		p.[PolicyInceptionDate],
		@date [AnniversaryDate],
		p.[CreatedDate] [ApplicationDate],
		convert(date, getdate()) [IssueDate],
		sum(t.[BaseRate]) [BasePremium],
		p.[InstallmentPremium] [PolicyPremium],
		[policy].[CalculateCommission](sum(t.[BaseRate]), p.[CommissionPercentage], p.[BinderFeePercentage]) [Commission],
		[policy].[CalculateServiceFee](sum(t.[BaseRate]), p.[AdminPercentage], p.[CommissionPercentage], p.[BinderFeePercentage]) [ServiceFee],
		cast(iif(isnull(p.[ParentPolicyId], 0) = 0, iif(rp.[RolePlayerIdentificationTypeId] = 1, 0, 1), 1) as bit) [IsGroupPolicyMember],
		[IsEuropAssist] =p.[IsEuropAssist],
		rpScheme.DisplayName as SchemeName,
		ISNULL(@PolicyScheduleOwnerText, 'The Main Member') as PolicyScheduleOwnerText
	from [policy].[Policy] p with (nolock)
		inner join [client].[RolePlayer] rp with (nolock) on rp.[RolePlayerId] = p.[PolicyOwnerId]
		inner join [client].[RolePlayer] rpScheme with (nolock) on rpScheme.[RolePlayerId] = p.[PolicyPayeeId]
		inner join [common].[PaymentMethod] pm with (nolock) on pm.[Id] = p.[PaymentMethodId]
		inner join [policy].[PolicyInsuredLives] pil with (nolock) on pil.[PolicyId] = p.[PolicyId]
		inner join [product].[ProductOption] po with (nolock) on po.[Id] = p.[ProductOptionId]
		inner join [broker].[Brokerage] b with (nolock) on b.[Id] = p.[BrokerageId]
		inner join [broker].[Representative] r with (nolock) on r.[Id] = p.[RepresentativeId]		
		inner join  (
			select b.[Id] [BenefitId],
				b.[Name] [BenefitName],
				b.[CoverMemberTypeId],
				br.[EffectiveDate],
				br.[BaseRate],
				br.[BenefitAmount],
				rank() over (partition by b.[Id] order by br.[EffectiveDate] desc) [Rank]
			from [product].[Benefit] b with (nolock)
				inner join [product].[BenefitRate] br with (nolock) on br.[BenefitId] = b.[Id]
			where b.[IsDeleted] = 0
			  and br.[IsDeleted] = 0
		) t on pil.[StatedBenefitId] = t.[BenefitId]
	where p.[PolicyId] = @policyId
	  and (pil.EndDate is null or pil.EndDate > (select getdate()))
	  and t.[Rank] = 1
	group by b.[Name],	
		p.[PolicyNumber],
		p.[PolicyInceptionDate],
		r.[FirstName],
		r.[SurnameOrCompanyName],
		pm.[Name],
		p.CreatedDate,
		p.InstallmentPremium,
		p.AdminPercentage,
		p.CommissionPercentage,
		p.BinderFeePercentage,
		p.ParentPolicyId,
		rp.RolePlayerIdentificationTypeId,
		p.IsEuropAssist,
		rpScheme.DisplayName

end
