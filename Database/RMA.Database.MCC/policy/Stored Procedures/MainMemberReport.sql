CREATE  PROCEDURE [policy].[MainMemberReport]
	@Brokerage AS VARCHAR(255),
	@Group AS VARCHAR(255),
	@Status AS INT,
	@StartDate AS DATE,
	@EndDate AS DATE
AS BEGIN

	declare @brokerageId int
	declare @policyPayeeId int
	declare @firstOfTheYear date = datefromparts(year(getdate()), 1, 1)

	if (@Brokerage = 'All' or @Brokerage = '[All]' or isnull(@Brokerage, '') = '') BEGIN
		set @brokerageId = 0
	end else begin
		select @brokerageId = Id from broker.Brokerage with (nolock) where [Name] = @Brokerage
	end

	if (@Group = 'All' or isnull(@Group, '') = '') begin
		set @policyPayeeId = 0
	end else begin
		select @policyPayeeId = RolePlayerId from client.RolePlayer with (nolock) where DisplayName = @Group
	end

	   --Scheme details
	   declare @SchemeDetails table (
			RolePlayerId int,
			Underwritten varchar(50),
			PolicyHolder varchar(50),
			Partnership varchar(5)	
		)

		insert into @SchemeDetails
		select 
			sc.RolePlayerId,
			u.[Name],
			ph.[Name],
			case when sc.IsPartnership = 1 then 'Yes' else 'No' end as [Partnership]
		from client.SchemeClassification sc with (nolock)
			left join [common].[Underwritten] u with (nolock) on sc.UnderwrittenId = u.Id
			left join [common].[PolicyHolder] ph with (nolock) on  sc.PolicyHolderId = ph.Id

	declare @policyMembers table (
		PolicyId int,
		RolePlayerId int,
		ParentPolicyId int,
		FuneralType varchar(100),
		PolicyNumber varchar(100),
		PolicyInceptionDate date,
		InstallmentPremium money,
		CreationDate date,
		ClientReference varchar(100),
		ChildStatus varchar(100),
		MemberName varchar(128),
		TelNumber varchar(100),
		CelNumber varchar(100),
		Email varchar(128),
		FirstName varchar(100),
		Surname varchar(100),
		IdTypeId int,
		IdNumber varchar(100),
		PassportNumber varchar(100),
		BirthDate date,
		DeathDate date,
		Age int,
		RolePlayerTypeId int,
		Relation varchar(100),
		BrokerName varchar(100),
		RepresentativeName varchar(100),
		JuristicRepresentative varchar(100),
		Industry varchar(100),
		IndustryClass varchar(100),
		ClientType varchar(100),
		Underwritten varchar(30),
		PolicyHolder varchar(30),
		Partnership varchar(5)
		primary key (PolicyId, RolePlayerId)
	)

	insert into @policyMembers
		select p.PolicyId,
			pil.RolePlayerId,
			isnull(p.ParentPolicyId, -1) [ParentPolicyId],
			iif(p.ParentPolicyId is null, 'Individual', 'Group') [FuneralType],
			p.PolicyNumber,
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			p.CreatedDate,
			p.ClientReference,
			ps.Name [ChildStatus],
			rp.DisplayName [MemberName],
			rp.TellNumber,
			rp.CellNumber,
			rp.EmailAddress,
			per.FirstName,
			per.Surname,
			isnull(per.IdTypeId, 4) [IdTypeId],
			case isnull(per.IdTypeId, 6) when 1 then per.IdNumber else '' end [IdNumber],
			case isnull(per.IdTypeId, 6) when 1 then '' else per.IdNumber end [PassportNumber],
			per.DateOfBirth [BirthDate],
			case isnull(per.IsAlive, 1) when 1 then null else per.DateOfDeath end,
			client.CalculateAge(isnull(per.DateOfBirth, getdate())) [Age],
			pil.RolePlayerTypeId,
			rt.Name [Relation],
			b.Name,
			concat(r.FirstName, ' ', r.SurnameOrCompanyName),
			concat(j.FirstName, ' ', j.SurnameOrCompanyName),
			ind.Name [Industry],
			inc.Name [IndustryClass],
			ct.Name [ClientType],
			sd.Underwritten,
			sd.PolicyHolder,
			sd.Partnership
		from policy.Policy p with (nolock)
			inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
			inner join broker.Brokerage b with (nolock) on b.Id = p.BrokerageId
			inner join broker.Representative r with (nolock) on r.Id = p.RepresentativeId
			inner join policy.PolicyInsuredLives pil with (nolock) on pil.PolicyId = p.PolicyId
			inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = pil.RolePlayerId
			inner join client.RolePlayerType rt with (nolock) on rt.RolePlayerTypeId = pil.RolePlayerTypeId
			left join broker.Representative j with (nolock) on j.Id = p.JuristicRepresentativeId
			left join client.Person per with (nolock) on per.RolePlayerId = pil.RolePlayerId
			left join client.FinPayee fp with (nolock) on fp.RolePlayerId = p.PolicyPayeeId
			left join common.Industry ind with (nolock) on ind.Id = fp.IndustryId
			left join common.IndustryClass inc with (nolock) on inc.Id = ind.IndustryClassId			
			left join client.RolePlayer po with (nolock) on po.RolePlayerId = p.PolicyPayeeId
			left join common.ClientType ct with (nolock) on ct.Id = po.ClientTypeId
			left join @SchemeDetails sd on rp.RolePlayerId = sd.RolePlayerId
		where pil.InsuredLifeStatusId = 1
		  and (p.CreatedDate between @StartDate and @EndDate or p.PolicyInceptionDate between @StartDate and @EndDate)
		  and p.PolicyStatusId = case @Status when 0 then p.PolicyStatusId else @Status end
		  and p.BrokerageId = case @brokerageId when 0 then p.BrokerageId else @brokerageId end
		  and p.PolicyPayeeId = case @policyPayeeId when 0 then p.PolicyPayeeId else @policyPayeeId end

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

	-- Collection details
	declare @policyCollection table (
		InvoiceId int,
		CollectionDate date,
		InvoiceDate date,
		PolicyId int
	)

	insert into @policyCollection
    select distinct
            FIRST_VALUE([InvoiceId]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate] DESC) AS [InvoiceId],
            FIRST_VALUE([CollectionDate]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate]  DESC) AS [CollectionDate],
            FIRST_VALUE([InvoiceDate]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate]  DESC) AS [InvoiceDate],
            FIRST_VALUE([PolicyId]) OVER (PARTITION BY [Policyid] ORDER BY [CollectionDate] DESC) AS [PolicyId]
    from [billing].[Invoice] with (NOLOCK)

	declare @policySummary table (
		PolicyId int primary key,
		FuneralType varchar(100),
		PolicyNumber varchar(100),
		PolicyStatus varchar(100),
		PolicyInceptionDate date,
		InstallmentPremium money,
		CreationDate date,
		CancellationDate date,
		LastLapsedDate date,
		Brokerage varchar(100),
		-- IndustryClass varchar(100),
		SchemeName varchar(100),
		PolicyHolderName varchar(128),
		PolicyHolderIdNumber varchar(100),
		ProductName varchar(100),
		ProductOptionName varchar(100),
		CancelReason varchar(100),
		InsuredLives int,
		Underwritten varchar(30),
		PolicyHolder varchar(30),
		Partnership varchar(5)
		)

	insert into @policySummary
		select p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			p.CreatedDate,
			p.CancellationDate,
			p.LastLapsedDate,
			b.Name [Brokerage],
			-- ic.Name [IndustryClass],
			rp.DisplayName,
			rp.DisplayName,
			'',
			pr.Name,
			po.Name,
			cr.Name,
			m.Underwritten,
			m.PolicyHolder,
			m.Partnership,
			count(distinct m.RolePlayerId)
		from @policyMembers m
			inner join policy.Policy p with (nolock) on p.PolicyId = m.ParentPolicyId
			inner join broker.Brokerage b with (nolock) on b.Id = p.BrokerageId
			inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
			--inner join client.FinPayee fp with (nolock) on fp.RolePlayerId = p.PolicyOwnerId
			--inner join [common].[Industry] i with (nolock) ON i.Id = fp.IndustryId
			--inner join [common].[IndustryClass] ic with (nolock) ON ic.Id = i.IndustryClassId
			inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			inner join product.ProductOption po with (nolock) on po.Id = p.ProductOptionId
			inner join product.Product pr with (nolock) on pr.Id = po.ProductId
			left join [common].CancellationReason cr with (nolock) on p.[PolicyCancelReasonId] = cr.[Id]
		where m.ParentPolicyId > 0
		  and p.BrokerageId = case @brokerageId when 0 then p.BrokerageId else @brokerageId end
		  and rp.RolePlayerId = case @policyPayeeId when 0 then rp.RolePlayerId else @policyPayeeId end
		group by p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			p.CreatedDate,
			p.CancellationDate,
			p.LastLapsedDate,
			b.Name,
			-- ic.Name,
			rp.DisplayName,
			rp.DisplayName,
			pr.Name,
			po.Name,
			cr.Name,
			m.Underwritten,
			m.PolicyHolder,
			m.Partnership

	insert into @policySummary
		select p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			p.CreatedDate,
			p.CancellationDate,
			p.LastLapsedDate,
			b.Name,
			-- ic.Name,
			'',
			rp.DisplayName,
			per.IdNumber,
			pr.Name,
			po.Name,
			cr.Name,
			m.Underwritten,
			m.PolicyHolder,
			m.Partnership,
			count(distinct m.RolePlayerId)
		from @policyMembers m
			inner join policy.Policy p with (nolock) on p.PolicyId = m.PolicyId
			inner join broker.Brokerage b with (nolock) on b.Id = p.BrokerageId
			inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
			--inner join client.FinPayee fp with (nolock) on fp.RolePlayerId = p.PolicyOwnerId
			--inner join [common].[Industry] i with (nolock) ON i.Id = fp.IndustryId
			--inner join [common].[IndustryClass] ic with (nolock) ON ic.Id = i.IndustryClassId
			inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			inner join product.ProductOption po with (nolock) on po.Id = p.ProductOptionId
			inner join product.Product pr with (nolock) on pr.Id = po.ProductId
			left join @policySummary t on t.PolicyId = m.PolicyId
			left join client.Person per with (nolock) on per.RolePlayerId = rp.RolePlayerId
			left join [common].CancellationReason cr ON p.[PolicyCancelReasonId] = cr.[Id]
		where m.ParentPolicyId < 0
		  and t.PolicyId is null
		group by p.PolicyId,
			m.FuneralType,
			p.PolicyNumber,
			ps.[Name],
			p.PolicyInceptionDate,
			p.InstallmentPremium,
			p.CreatedDate,
			p.CancellationDate,
			p.LastLapsedDate,
			b.Name,
			--ic.Name,
			rp.DisplayName,
			rp.DisplayName,
			per.IdNumber,
			pr.Name,
			po.Name,
			cr.Name,
			m.Underwritten,
			m.PolicyHolder,
			m.Partnership

	select s.FuneralType,
		isnull(m.IndustryClass, 'Unknown') [IndustryClass],
		isnull(m.Industry, 'Unknown') [Industry],
		isnull(m.ClientType, 'Unknown') [ClientType],
		s.ProductOptionName [ProductOption],
		s.PolicyHolderName,
		m.MemberName,
		m.FirstName [Name],
		m.Surname,
		m.IdNumber,
		m.PassportNumber,
		m.PolicyNumber,
		m.ClientReference [AdsolPolicyNumber],
		m.PolicyInceptionDate [CommenceDate],
		case when m.PolicyInceptionDate >= @firstOfTheYear then 'Yes' else 'No' end [NewBusiness],
		m.CreationDate,
		m.InstallmentPremium [CurrentPremium],
		m.BrokerName [BrokerName],
		s.SchemeName [Schemename],
		m.RepresentativeName [AgentName],
		m.ChildStatus [Status],
		s.[CancellationDate],
		s.[LastLapsedDate],
		null [CancelReason],
		m.DeathDate [DeathDate],
		s.CreationDate [ApplicatioDate],
		concat(m.BrokerName, s.SchemeName) [BrokerScheme],
		m.ParentPolicyId [ParentPolicyId],
		m.IdTypeId [IdTypeId],
		c.CollectionDate [DebitDate],
		concat(year(s.CreationDate), right(concat('00', month(s.CreationDate)), 2)) [CreatedDateYearMonth],
		m.TelNumber [TelNumber],
		m.CelNumber [CellNumber],
		m.Email [EmailAddress],
		m.JuristicRepresentative [JuristicRep],
		l.InsuredLives [Lives],
		m.Underwritten,
		m.PolicyHolder,
		m.Partnership
	from @policySummary s
		inner join @policyMembers m on s.PolicyId = iif(m.ParentPolicyId < 0, m.PolicyId, m.ParentPolicyId)
		inner join @policyLives l on m.PolicyId = l.PolicyId
		left join @policyCollection c on c.PolicyId = m.PolicyId
		left join @SchemeDetails sd on m.RolePlayerId = sd.RolePlayerId
	where m.RolePlayerTypeId = 10
	order by m.PolicyNumber
END
