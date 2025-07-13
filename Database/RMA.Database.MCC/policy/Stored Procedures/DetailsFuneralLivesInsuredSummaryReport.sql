CREATE PROCEDURE [policy].[DetailsFuneralLivesInsuredSummaryReport]
AS BEGIN

	declare @policyMembers table (
		PolicyId int,
		RolePlayerId int,
		ParentPolicyId int,
		FuneralType varchar(100),
		PolicyNumber varchar(100),
		ChildStatus varchar(100),
		MemberName varchar(128),
		FirstName varchar(100),
		Surname varchar(100),
		ChildIdNumber varchar(100),
		BirthDate date,
		Age int,
		RolePlayerTypeId int,
		Relation varchar(100)
		primary key (PolicyId, RolePlayerId)
	)

	insert into @policyMembers
		select p.PolicyId,
			pil.RolePlayerId,
			isnull(p.ParentPolicyId, -1) [ParentPolicyId],
			iif(p.ParentPolicyId is null, 'Individual', 'Group') [FuneralType],
			p.PolicyNumber,
			ps.Name [ChildStatus],
			rp.DisplayName [MemberName],
			per.FirstName,
			per.Surname, 
			per.IdNumber [ChildIdNumber],
			per.DateOfBirth [BirthDate],
			client.CalculateAge(isnull(per.DateOfBirth, getdate())) [Age],
			pil.RolePlayerTypeId,
			rt.Name [Relation]
		from policy.Policy p with (nolock)
			inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
			inner join policy.PolicyInsuredLives pil with (nolock) on pil.PolicyId = p.PolicyId
			inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = pil.RolePlayerId
			inner join client.RolePlayerType rt with (nolock) on rt.RolePlayerTypeId = pil.RolePlayerTypeId
			left join client.Person per with (nolock) on per.RolePlayerId = pil.RolePlayerId
		where pil.InsuredLifeStatusId = 1

	declare @policySummary table (
		PolicyId int primary key,
		FuneralType varchar(100),
		PolicyNumber varchar(100),
		PolicyStatus varchar(100),
		PolicyInceptionDate date,
		InstallmentPremium money,
		Brokerage varchar(100),
		SchemeName varchar(100),
		PolicyHolderName varchar(128),
		PolicyHolderIdNumber varchar(100),
		ProductName varchar(100),
		ProductOptionName varchar(100),
		InsuredLives int
	)

	insert into @policySummary
		select p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			b.Name [Brokerage],
			rp.DisplayName,
			rp.DisplayName,
			'',
			pr.Name,
			po.Name,
			count(distinct m.RolePlayerId)
		from @policyMembers m
			inner join policy.Policy p with (nolock) on p.PolicyId = m.ParentPolicyId
			inner join broker.Brokerage b with (nolock) on b.Id = p.BrokerageId
			inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
			inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			inner join product.ProductOption po with (nolock) on po.Id = p.ProductOptionId
			inner join product.Product pr with (nolock) on pr.Id = po.ProductId
		where m.ParentPolicyId > 0
		group by p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			b.Name,
			rp.DisplayName,
			rp.DisplayName,
			pr.Name,
			po.Name

	insert into @policySummary
		select p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			b.Name,
			'',
			rp.DisplayName,
			per.IdNumber,
			pr.Name,
			po.Name,
			count(distinct m.RolePlayerId)
		from @policyMembers m
			inner join policy.Policy p with (nolock) on p.PolicyId = m.PolicyId
			inner join broker.Brokerage b with (nolock) on b.Id = p.BrokerageId
			inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
			inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			inner join product.ProductOption po with (nolock) on po.Id = p.ProductOptionId
			inner join product.Product pr with (nolock) on pr.Id = po.ProductId
			left join @policySummary t on t.PolicyId = m.PolicyId
			left join client.Person per with (nolock) on per.RolePlayerId = rp.RolePlayerId
		where t.PolicyId is null	
		  and m.ParentPolicyId < 0
		group by p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			b.Name,
			rp.DisplayName,
			rp.DisplayName,
			per.IdNumber,
			pr.Name,
			po.Name

	select s.FuneralType,
		s.Brokerage,
		s.PolicyHolderName,
		s.PolicyNumber,
		m.PolicyNumber [ChildPolicyNumber],
		s.InstallmentPremium,
		s.InsuredLives [Lives],
		s.PolicyHolderIdNumber [IdNumber],
		m.MemberName,
		m.FirstName,
		m.Surname,
		m.BirthDate,
		m.Age,
		m.Relation,
		s.Schemename,
		s.PolicyStatus [Status],
		m.ChildStatus,
		m.ChildIdNumber,
		s.ProductName [Product],
		s.ProductOptionName [ProductOption],
		s.PolicyInceptionDate
	from @policySummary s
		inner join @policyMembers m on s.PolicyId = iif(m.ParentPolicyId < 0, m.PolicyId, m.ParentPolicyId)
	order by s.PolicyHolderName,
		s.PolicyNumber,
		m.PolicyNumber,
		m.RolePlayerTypeId
END
