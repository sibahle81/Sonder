CREATE PROCEDURE [policy].[ThresholdCapCoverReport] @group varchar(128)
AS BEGIN

	if (@group = 'All') begin
		set @group = 'do not extract anything, too much data'
	end

	declare @roleplayer table (
		RolePlayerId int primary key,
		Policies int,
		CoverAmount money
	)

	insert into @roleplayer (RolePlayerId)
		select distinct pil.RolePlayerId
		from policy.Policy p (nolock)
			inner join client.Company co (nolock) on co.RolePlayerId = p.PolicyPayeeId
			inner join broker.Brokerage b (nolock) on b.Id = p.BrokerageId
			inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
		where co.[Name] like concat('%',@group,'%')
		  and p.[PolicyStatusId] not in (2, 4, 5)
		  and pil.InsuredLifeStatusId = 1

	update rp set
		rp.Policies = t.Policies,
		rp.CoverAmount = t.CoverAmount
	from @roleplayer rp inner join (
		select rp.RolePlayerId,
			count(distinct pil.PolicyId) [Policies],
			sum(br.BenefitAmount) [CoverAmount]
		from @roleplayer rp
			inner join policy.PolicyInsuredLives pil (nolock) on pil.RolePlayerId = rp.RolePlayerId
			inner join policy.Policy p (nolock) on p.PolicyId = pil.PolicyId
			inner join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = p.ProductOptionId and br.BenefitId = pil.StatedBenefitId
		where p.[PolicyStatusId] not in (2, 4, 5)
		  and pil.InsuredLifeStatusId = 1
		group by rp.RolePlayerId
	) t on t.RolePlayerId = rp.RolePlayerId

	select * from (
		select b.[Name] [Brokerage],
			isnull(co.[Name], '-Individual-') [Scheme],
			p.PolicyNumber,
			p.PolicyInceptionDate,
			ps.Name [PolicyStatus],
			replace(trim(replace(concat(per.FirstName, ' ', per.Surname), '  ', ' ')), '.', '') [MemberName],
			ct.Name [MemberType],
			case per.IdTypeId when 1 then per.IdNumber else cast(per.DateOfBirth as varchar(16)) end [IdNumber],
			per.DateOfBirth,
			br.BenefitName,
			br.BenefitAmount [CoverAmount],
			rp.Policies [TotalPolicies],
			rp.CoverAmount [TotalCoverAmount]
		from @rolePlayer rp
			inner join policy.PolicyInsuredLives pil (nolock) on pil.RolePlayerId = rp.RolePlayerId
			inner join policy.Policy p (nolock) on p.PolicyId = pil.PolicyId
			inner join broker.Brokerage b (nolock) on b.Id = p.BrokerageId
			inner join common.PolicyStatus ps (nolock) on ps.Id = p.PolicyStatusId
			inner join client.Person per (nolock) on per.RolePlayerId = pil.RolePlayerId
			inner join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = p.ProductOptionId and br.BenefitId = pil.StatedBenefitId
			inner join common.CoverMemberType ct (nolock) on ct.Id = br.CoverMemberTypeId
			left join client.Company co (nolock) on co.RolePlayerId = p.PolicyPayeeId
		where p.[PolicyStatusId] not in (2, 4, 5)
			and pil.InsuredLifeStatusId = 1
	) t
	order by t.[MemberName],
		t.[IdNumber],
		t.[Scheme]

END
GO
