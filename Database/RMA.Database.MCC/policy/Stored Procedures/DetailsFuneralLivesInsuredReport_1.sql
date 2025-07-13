CREATE PROCEDURE [policy].[DetailsFuneralLivesInsuredReport]
AS BEGIN

	declare @policyMembers table (
		PolicyId int,
		RolePlayerId int,
		ParentPolicyId int,
		FuneralType varchar(100),
		PolicyNumber varchar(100),
		InstallmentPremium money,
		ClientReference varchar(100),
		ChildStatus varchar(100),
		MemberName varchar(128),
		FirstName varchar(100),
		Surname varchar(100),
		StartDate date,
		ChildIdNumber varchar(100),
		BirthDate date,
		Age int,
		IsAlive varchar(8),
		DateOfDeath date,
		RolePlayerTypeId int,
		Relation varchar(100),
		CreationDate date,
		BenefitName varchar(100),
		BenefitAmount money
		primary key (PolicyId, RolePlayerId)
	)

	insert into @policyMembers
		select p.PolicyId,
			pil.RolePlayerId,
			isnull(p.ParentPolicyId, -1) [ParentPolicyId],
			iif(p.ParentPolicyId is null, 'Individual', 'Group') [FuneralType],
			p.PolicyNumber,
			p.InstallmentPremium,
			p.ClientReference,
			ps.Name [ChildStatus],
			rp.DisplayName [MemberName],
			per.FirstName,
			per.Surname, 
			pil.StartDate,
			per.IdNumber [ChildIdNumber],
			per.DateOfBirth [BirthDate],
			client.CalculateAge(isnull(per.DateOfBirth, getdate())) [Age],
			case isnull(per.IsAlive, 1) when 1 then 'YES' else 'NO' end [IsAlive],
			case isnull(per.IsAlive, 1) when 1 then null else per.DateOfDeath end [DateOfDeath],
			pil.RolePlayerTypeId,
			rt.Name [Relation],
			p.CreatedDate [CreationDate],
			br.BenefitName,
			br.BenefitAmount
		from policy.Policy p with (nolock)
			inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
			inner join policy.PolicyInsuredLives pil with (nolock) on pil.PolicyId = p.PolicyId
			inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = pil.RolePlayerId
			inner join client.RolePlayerType rt with (nolock) on rt.RolePlayerTypeId = pil.RolePlayerTypeId
			left join client.Person per with (nolock) on per.RolePlayerId = pil.RolePlayerId
			left join product.CurrentBenefitRate br with (nolock) on br.ProductOptionId = p.ProductOptionId and br.BenefitId = pil.StatedBenefitId
		where pil.InsuredLifeStatusId = 1

	declare @policySummary table (
		PolicyId int primary key,
		FuneralType varchar(100),
		PolicyNumber varchar(100),
		PolicyStatus varchar(100),
		PolicyInceptionDate date,
		InstallmentPremium money,
		Brokerage varchar(100),
		AgentName varchar(100),
		FinPayeeNumber varchar(100),
		IndustryClass varchar(100),
		SchemeName varchar(100),
		PolicyHolderName varchar(128),
		PolicyHolderIdNumber varchar(100),
		ProductName varchar(100),
		ProductOptionName varchar(100),
		CreationDate date,
		WaitingPeriod int,
		WaitingPeriodEnd date,
		InsuredLives int
	)

	insert into @policySummary
		select p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			b.Name,
			concat(r.FirstName, ' ', r.SurnameOrCompanyName),
			fp.FinPayeNumber,
			ic.Name,
			rp.DisplayName,
			rp.DisplayName,
			'',
			pr.Name,
			po.Name,
			p.CreatedDate,
			isnull(json_value(por.[RuleConfiguration], '$[0].fieldValue'), 0),
			dateadd(month, cast(isnull(json_value(por.[RuleConfiguration], '$[0].fieldValue'), 0) as int), p.PolicyInceptionDate),
			count(distinct m.RolePlayerId)
		from @policyMembers m
			inner join policy.Policy p with (nolock) on p.PolicyId = m.ParentPolicyId
			inner join broker.Brokerage b with (nolock) on b.Id = p.BrokerageId
			inner join broker.Representative r with (nolock) on r.Id = p.RepresentativeId
			inner join client.FinPayee fp with (nolock) on fp.RolePlayerId = p.PolicyOwnerId
			inner join [common].[Industry] i with (nolock) ON i.Id = fp.IndustryId
			inner join [common].[IndustryClass] ic with (nolock) ON ic.Id = i.IndustryClassId
			inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
			inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			inner join product.ProductOption po with (nolock) on po.Id = p.ProductOptionId
			inner join product.Product pr with (nolock) on pr.Id = po.ProductId
			left join product.ProductOptionRule por with (nolock) on po.Id = por.ProductOptionId and por.RuleId = 5 and por.IsDeleted = 0
		where p.IsDeleted = 0		
		  and m.ParentPolicyId > 0
		group by p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			b.Name,
			r.FirstName,
			r.SurnameOrCompanyName,
			p.CreatedDate,
			fp.FinPayeNumber,
			ic.Name,
			rp.DisplayName,
			rp.DisplayName,
			pr.Name,
			po.Name,
			por.[RuleConfiguration]

	-- Number of insured lives per policy
	declare @policyLives table (
		PolicyId int primary key,
		InsuredLives int
	)
	insert into @policyLives
	select PolicyId,
		count(distinct RolePlayerId)
	from @policyMembers
	group by PolicyId

	insert into @policySummary
		select p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			b.Name,
			concat(r.FirstName, ' ', r.SurnameOrCompanyName),
			fp.FinPayeNumber,
			ic.Name,
			'',
			rp.DisplayName,
			per.IdNumber,
			pr.Name,
			po.Name,
			p.CreatedDate,
			isnull(json_value(por.[RuleConfiguration], '$[0].fieldValue'), 0),
			dateadd(month, cast(isnull(json_value(por.[RuleConfiguration], '$[0].fieldValue'), 0) as int), p.PolicyInceptionDate),
			count(distinct m.RolePlayerId)
		from @policyMembers m
			inner join policy.Policy p with (nolock) on p.PolicyId = m.PolicyId
			inner join broker.Brokerage b with (nolock) on b.Id = p.BrokerageId
			inner join broker.Representative r with (nolock) on r.Id = p.RepresentativeId
			inner join client.FinPayee fp with (nolock) on fp.RolePlayerId = p.PolicyOwnerId
			inner join [common].[Industry] i with (nolock) ON i.Id = fp.IndustryId
			inner join [common].[IndustryClass] ic with (nolock) ON ic.Id = i.IndustryClassId
			inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
			inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			inner join product.ProductOption po with (nolock) on po.Id = p.ProductOptionId
			inner join product.Product pr with (nolock) on pr.Id = po.ProductId
			left join @policySummary t on t.PolicyId = m.PolicyId
			left join client.Person per with (nolock) on per.RolePlayerId = rp.RolePlayerId
			left join product.ProductOptionRule por with (nolock) on po.Id = por.ProductOptionId and por.RuleId = 5 and por.IsDeleted = 0
		where t.PolicyId is null
		  and p.IsDeleted = 0		
		  and m.ParentPolicyId < 0
		group by p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			b.Name,
			r.FirstName,
			r.SurnameOrCompanyName,
			p.CreatedDate,
			fp.FinPayeNumber,
			ic.Name,
			rp.DisplayName,
			rp.DisplayName,
			per.IdNumber,
			pr.Name,
			po.Name,
			por.[RuleConfiguration]

	declare @today date = getdate()
	select s.FuneralType [FuneralType],
		s.PolicyHolderName [PolicyHolderName],
		s.FinPayeeNumber [MemberNumber],
		s.PolicyNumber [PolicyNumber],
		m.PolicyNumber [ChildPolicyNumber],
		m.ClientReference [AdsolPolicyNumber],
		s.PolicyInceptionDate [InceptionDate],
		m.[CreationDate],
		l.[InsuredLives] [Lives],
		s.PolicyHolderIdNumber [IdNumber],
		s.InstallmentPremium [Premium],
		s.[IndustryClass],
		s.PolicyHolderName [ChildPolicyHolderName],
		null [ChildMemberNumber],	-- Fin Paye number of child
		m.[StartDate] [ChildInceptionDate],
		m.CreationDate [ChildCreationDate],
		m.InstallmentPremium [ChildPremium],
		m.[MemberName],
		m.[FirstName],
		m.[Surname],
		m.[BirthDate],
		m.[Age],
		m.[Relation],
		s.[Brokerage] [BrokerName],
		s.[SchemeName] [Schemename],
		s.[AgentName] [AgentName],
		s.[PolicyStatus] [Status],
		m.[ChildStatus],
		m.[ChildIdNumber] [ChildIdNumber],
		m.[BenefitAmount],
		m.[BenefitName] [Benefit],
		s.WaitingPeriodEnd [WaitingPeriodEnd],
		iif(s.WaitingPeriodEnd < @today, 0, datediff(day, @today, s.WaitingPeriodEnd))  [WaitingPeriodOutstandinginDays],
		m.[IsAlive] [AliveIndicator],
		m.[DateOfDeath]
	from @policySummary s
		inner join @policyMembers m on s.PolicyId = iif(m.ParentPolicyId < 0, m.PolicyId, m.ParentPolicyId)
		inner join @policyLives l on m.PolicyId = l.PolicyId
	order by m.PolicyNumber
END

