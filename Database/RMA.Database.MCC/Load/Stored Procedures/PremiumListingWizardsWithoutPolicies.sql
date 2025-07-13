CREATE PROCEDURE [Load].[PremiumListingWizardsWithoutPolicies]
AS BEGIN

	declare @start date = dateadd(month, -6, getdate())
	set @start = datefromparts(year(@start), month(@start), 1)

	declare @wizard table (
		WizardId int primary key,
		WizardName varchar(128),
		FileIdentifier uniqueidentifier index idxWizardFileIdentifier,
		BrokerageName varchar(128),
		SchemeName varchar(128),
		PolicyId int index idxWizardPolicyId,
		PolicyNumber varchar(32),
		PolicyStatus varchar(64),
		InceptionDate date,
		CreatedBy varchar(128),
		CreatedDate date,
		CompletedBy varchar(128),
		CompletedDate date
	)

	-- Find all the wizards where there are unaccounted for members
	insert into @wizard ([WizardId], [WizardName], [FileIdentifier], [BrokerageName], [SchemeName], [PolicyId], [PolicyNumber], [PolicyStatus], [InceptionDate], [CreatedBy], [CreatedDate], [CompletedBy], [CompletedDate])
		select distinct t.WizardId,
			t.WizardName,
			t.FileIdentifier,
			b.[Name] [BrokerageName],
			upper(co.CompanyName) [SchemeName],
			p.PolicyId,
			p.PolicyNumber,
			ps.Name [PolicyStatus],
			p.PolicyInceptionDate [InceptionDate],
			t.CreatedBy,
			t.CreatedDate,
			t.CompletedBy,
			t.CompletedDate
		from (
			select w.Id [WizardId],
				w.[Name] [WizardName],
				json_value(w.[Data], '$[0].fileIdentifier') [FileIdentifier],
				isnull(c.[DisplayName], w.[CreatedBy]) [CreatedBy],
				w.CreatedDate,
				isnull(a.[DisplayName], w.[ModifiedBy]) [CompletedBy],
				w.EndDateAndTime [CompletedDate]
			from bpm.Wizard w (nolock)
				left join [security].[User] c (nolock) on c.[Email] = w.[CreatedBy]
				left join [security].[User] a (nolock) on a.[Email] = w.[ModifiedBy]
			where w.[WizardConfigurationId] = 24
			  and w.[WizardStatusId] = 2
			  and w.[CreatedDate] >= @start
			) t 
			inner join [Load].[PremiumListingCompany] co (nolock) on co.[FileIdentifier] = t.[FileIdentifier]
			inner join [Load].[PremiumListingMember] m (nolock) on m.[FileIdentifier] = t.[FileIdentifier]
			inner join [policy].[Policy] p (nolock) on p.[PolicyId] = co.[PolicyId]
			inner join [broker].[Brokerage] b (nolock) on b.Id = p.BrokerageId
			inner join [common].[PolicyStatus] ps (nolock) on ps.Id = p.PolicyStatusId
		where m.CoverMemberTypeId < 10 

	declare @member table (
		[WizardId] int, 
		[ParentPolicyId] int index idxMemberParentPolicy, 
		[PolicyId] int index idxMemberPolicy, 
		[RolePlayerId] int index idxMemberRolePlayer,
		[CoverMemberTypeId] int,
		[RolePlayerTypeId] int index idxMemberRolePlayerType,  
		[FirstName] varchar(64), 
		[Surname] varchar(64), 
		[IdNumber] varchar(64), 
		[DateOfBirth] date, 
		[Age] int,
		[JoinDate] date, 
		[BenefitId] int, 
		[BenefitName] varchar(128),
		[Premium] money default (0)
	)

	insert into @member ([WizardId], [ParentPolicyId], [PolicyId], [RolePlayerId], [CoverMemberTypeId], [RolePlayerTypeId], [FirstName], [Surname], [IdNumber], [DateOfBirth], [Age], [JoinDate], [BenefitId], [BenefitName])
	select distinct w.WizardId,
		w.[PolicyId] [ParentPolicyId],
		m.[PolicyId],
		m.[RolePlayerId],
		m.[CoverMemberTypeId],
		m.[RolePlayerTypeId],
		m.[FirstName],
		m.[Surname],
		m.[IdNumber],
		m.[DateOfBirth],
		m.[Age],
		m.[JoinDate],
		m.[BenefitId],
		m.[BenefitName]
	from @wizard w
		inner join [Load].[PremiumListingMember] m (nolock) on m.[FileIdentifier] = w.[FileIdentifier]
		left join policy.Policy p (nolock) on p.PolicyId = m.PolicyId
		left join policy.PolicyInsuredLives pil (nolock) on 
			pil.PolicyId = p.PolicyId and 
			pil.RolePlayerId = m.RolePlayerId
	where m.CoverMemberTypeId < 10 
	  and m.PolicyId > 0
	  and m.RolePlayerId > 0
	  and (p.PolicyId is null or pil.RolePlayerId is null)

	insert into @member ([WizardId], [ParentPolicyId], [PolicyId], [RolePlayerId], [CoverMemberTypeId], [RolePlayerTypeId], [FirstName], [Surname], [IdNumber], [DateOfBirth], [Age], [JoinDate], [BenefitId], [BenefitName])
	select distinct w.WizardId,
		w.[PolicyId] [ParentPolicyId],
		m.[PolicyId],
		m.[RolePlayerId],
		m.[CoverMemberTypeId],
		m.[RolePlayerTypeId],
		m.[FirstName],
		m.[Surname],
		m.[IdNumber],
		m.[DateOfBirth],
		m.[Age],
		m.[JoinDate],
		m.[BenefitId],
		m.[BenefitName]
	from @wizard w
		inner join [Load].[PremiumListingMember] m (nolock) on m.[FileIdentifier] = w.[FileIdentifier]
	where m.CoverMemberTypeId < 10 
	  and (isnull(m.RolePlayerId, 0) = 0 or isnull(m.PolicyId, 0) = 0)

	delete m
	from @member m
		inner join policy.Policy parent (nolock) on parent.PolicyId = m.ParentPolicyId
		inner join policy.Policy child (nolock) on child.ParentPolicyId = parent.PolicyId
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = child.PolicyId and pil.RolePlayerId = m.RolePlayerId and pil.RolePlayerTypeId = m.RolePlayerTypeId

	delete m
	from @member m
		inner join policy.Policy parent (nolock) on parent.PolicyId = m.ParentPolicyId
		inner join policy.Policy child (nolock) on child.ParentPolicyId = parent.PolicyId
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = child.PolicyId and pil.RolePlayerTypeId = m.RolePlayerTypeId
		inner join client.Person per (nolock) on per.RolePlayerId = pil.RolePlayerId
	where len(m.IdNumber) = 13
	  and per.IdNumber = m.IdNumber

	delete m
	from @member m
		inner join policy.Policy parent (nolock) on parent.PolicyId = m.ParentPolicyId
		inner join policy.Policy child (nolock) on child.ParentPolicyId = parent.PolicyId
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = child.PolicyId and pil.RolePlayerTypeId = m.RolePlayerTypeId
		inner join client.Person per (nolock) on per.RolePlayerId = pil.RolePlayerId
	where per.FirstName = m.FirstName
	  and per.Surname = m.Surname
	  and per.DateOfBirth = m.DateOfBirth

	update m set
		m.Premium = br.BaseRate
	from @member m
		inner join policy.Policy p (nolock) on p.PolicyId = m.ParentPolicyId
		inner join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = p.ProductOptionId and br.BenefitId = m.BenefitId

	select w.WizardId,
		w.BrokerageName,
		w.SchemeName,
		w.WizardName,
		w.PolicyNumber [SchemePolicyNumber],
		w.InceptionDate [SchemeInceptionDate],
		w.PolicyStatus [SchemePolicyStatus],
		w.CreatedBy,
		w.CreatedDate,
		w.CompletedBy,
		w.CompletedDate,
		sum(case m.CoverMemberTypeId when 1 then 1 else 0 end) [Policies],
		count(*) [Members],
		sum(m.Premium) [Premium],
		isnull(e.ErrorCategory, 'SQL Server Error / Timeout') [Error]
	from @wizard w
		inner join @member m on m.WizardId = w.WizardId
		left join (
			select e.FileIdentifier,
				e.ErrorCategory,
				rank() over (partition by e.FileIdentifier order by e.Id desc) [Rank]
			from @wizard w
				inner join Load.PremiumListingError e (nolock) on e.FileIdentifier = w.FileIdentifier
		) e on e.FileIdentifier = w.FileIdentifier and e.[Rank] = 1
	group by w.WizardId,
		w.WizardName,
		w.BrokerageName,
		w.SchemeName,
		w.PolicyNumber,
		w.InceptionDate,
		w.PolicyStatus,
		w.CreatedBy,
		w.CreatedDate,
		w.CompletedBy,
		w.CompletedDate,
		e.ErrorCategory
	order by w.BrokerageName,
		w.SchemeName,
		w.CreatedDate

	select w.BrokerageName,
		w.SchemeName,
		w.WizardName,
		w.PolicyNumber [SchemePolicyNumber],
		w.InceptionDate [SchemeInceptionDate],
		w.PolicyStatus [SchemePolicyStatus],
		w.CreatedBy,
		w.CreatedDate,
		w.CompletedBy,
		w.CompletedDate,
		concat(m.FirstName, ' ', m.Surname) [MemberName],
		ct.[Name] [MemberType],
		case len(m.IdNumber) when 13 then m.IdNumber else cast(m.DateOfBirth as varchar(16)) end [IdNumber],
		m.DateOfBirth,
		m.Age,
		m.JoinDate,
		m.BenefitName,
		m.Premium
	from @wizard w
		inner join @member m on m.WizardId = w.WizardId
		left join common.CoverMemberType ct (nolock) on ct.Id = m.CoverMemberTypeId
	order by w.BrokerageName,
		w.SchemeName,
		w.WizardName,
		m.CoverMemberTypeId

END