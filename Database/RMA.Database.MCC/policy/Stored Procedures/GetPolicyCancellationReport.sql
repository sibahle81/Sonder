
CREATE   PROCEDURE [policy].[GetPolicyCancellationReport]
	@ClientTypeId INT = NULL,
	@StartDate DATE = NULL,
	@EndDate DATE = NULL,
	@PeriodType INT = NULL
AS
BEGIN

	--declare @StartDate DATE = '2023-06-22';
	--declare @EndDate DATE = '2023-06-22';
	--declare @ClientTypeId INT = 3
	--declare @PeriodType INT = 3

	set nocount on

	if (@PeriodType is null) set @PeriodType = 5

	if (@PeriodType = 1) begin -- Daily
		set @EndDate = cast(getdate() as date)
		set @StartDate = @EndDate
	end else if (@PeriodType = 2) begin  -- Weekly
		set @EndDate = cast(getdate() as date)
		set @StartDate = dateadd(week, -1, @EndDate)
	end else if (@PeriodType = 3) begin -- Monthly
		set @EndDate = cast(getdate() as date)
		set @StartDate = dateadd(month, -1, @EndDate)
	end else if (@PeriodType = 4) begin -- Yearly
		set @EndDate = cast(getdate() as date)
		set @StartDate = dateadd(year, -1, @EndDate)
	end

	declare @policy table (
		PolicyId int primary key,
		ParentPolicyId int INDEX idxParentPolicyId NONCLUSTERED,
		IsGroupScheme bit INDEX idxGroupScheme NONCLUSTERED,
		PolicyNumber varchar(32),
		PolicyInceptionDate date,
		PolicyStatus varchar(32),
		BrokerageId int,
		BrokerName varchar(128),
		SchemeName varchar(128),
		ProductOptionId int INDEX idxProductId NONCLUSTERED,
		ProductOptionName varchar(128),
		LastLapsedDate date,
		PolicyCancellationDate date,
		CancellationInitiatedDate date,
		CancellationInitiatedBy varchar(128),
		CancellationReason varchar(128),
		PremiumCancelled money,
		InstallmentPremium money,
		CoverAmount money,
		MemberNo varchar(32),
		MemberFirstName varchar(128),
		MemberSurname varchar(128),
		IndustryClass varchar(128),
		WizardId int INDEX idxWizardId NONCLUSTERED,
		CreatedBy varchar(128),
		ApprovedBy varchar(128),
		ApprovedDate date,
		NoOfLives int default(0)
	)

	insert into @policy ([PolicyId], [ParentPolicyId], [IsGroupScheme], [PolicyNumber], [PolicyInceptionDate], [PolicyStatus], [BrokerageId], [BrokerName], [SchemeName], [ProductOptionId], [ProductOptionName], [LastLapsedDate], [PolicyCancellationDate], [CancellationInitiatedDate], [CancellationInitiatedBy], [CancellationReason], [PremiumCancelled], [InstallmentPremium], [MemberNo], [MemberFirstName], [MemberSurname], [IndustryClass], [WizardId])
		select p.PolicyId,
			isnull(p.ParentPolicyId, p.PolicyId) [ParentPolicyId],
			case rp.RolePlayerIdentificationTypeId when 1 then 0 else 1 end [IsGroupScheme],
			p.PolicyNumber,
			p.[PolicyInceptionDate],
			ps.[Name] [PolicyStatus],
			p.[BrokerageId],
			b.[Name] [BrokerName],
			isnull(co.[Name], 'Individual') [SchemeName],
			po.Id [ProductOptionId],
			po.[Name] [ProductOptionName],
			p.[LastLapsedDate],
			p.[CancellationDate],
			p.[CancellationInitiatedDate],
			p.[CancellationInitiatedBy],
			cr.[Name] [CancellationReason],
			p.[InstallmentPremium] [PremiumCancelled],
			p.[InstallmentPremium],
			fp.[FinPayeNumber] [MemberNo],
			case rp.RolePlayerIdentificationTypeId when 1 then per.[FirstName] else rp.[DisplayName] end [MemberFirstName],
			case rp.RolePlayerIdentificationTypeId when 1 then per.[Surname] else '' end [MemberSurname],
			ic.[Name] [IndustryClass],
			isnull(isnull(max(w1.Id), max(w2.Id)), 0) [WizardId]
		from [policy].[Policy] p (nolock)
			inner join [common].[PolicyStatus] ps (nolock) on ps.Id = p.PolicyStatusId
			inner join [product].[ProductOption] po (nolock) on po.Id = p.ProductOptionId
			inner join [broker].[Brokerage] b (nolock) on b.Id = p.[BrokerageId]
			left join [common].[PolicyCancelReason] cr (nolock) on cr.Id = p.[PolicyCancelReasonId]
			left join [client].[RolePlayer] rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			left join [client].[Person] per (nolock) on per.RolePlayerId = rp.RolePlayerId
			left join [client].[FinPayee] fp (nolock) on fp.RolePlayerId = p.PolicyPayeeId
			left join [client].[Company] co (nolock) on co.RolePlayerId = p.PolicyPayeeId
			left join [common].[Industry] i (nolock) on i.Id = fp.IndustryId
			left join [common].[IndustryClass] ic (nolock) on ic.Id = i.IndustryClassId
			left join [bpm].[Wizard] w1 on w1.[WizardConfigurationId] in (26, 53) and w1.[LinkedItemId] = p.[PolicyId] and w1.[WizardStatusId] = 2
			left join [bpm].[Wizard] w2 on w2.[WizardConfigurationId] in (26, 53) and w2.[LinkedItemId] = p.[ParentPolicyId] and w2.[WizardStatusId] = 2
		where p.PolicyStatusId in (2, 10)		  
		  and (p.[CancellationDate] between @StartDate and dateadd(day, 1, @EndDate)
			or p.[CancellationInitiatedDate] between @StartDate and dateadd(day, 1, @EndDate))		  
		group by p.PolicyId,
			p.ParentPolicyId,
			p.PolicyNumber,
			p.[PolicyInceptionDate],
			ps.[Name],
			p.[BrokerageId],
			b.[Name],
			co.[Name],
			rp.RolePlayerIdentificationTypeId,
			rp.[DisplayName],
			po.Id,
			po.[Name],
			p.[CancellationDate],
			p.[LastLapsedDate],
			p.[CancellationInitiatedDate],
			p.[CancellationInitiatedBy],
			cr.[Name],
			p.[InstallmentPremium],
			per.[FirstName],
			per.[Surname],
			fp.[FinPayeNumber],
			ic.[Name]

	if (@ClientTypeId = 1) begin  -- Individual policies
		delete from @policy where [SchemeName] <> 'Individual'
	end else if (@ClientTypeId = 3) begin  -- Corporate policies & schemes
		delete from @policy where [SchemeName] = 'Individual'
	end

	-- Update the user details in the temp table
	update t set
		t.[CreatedBy] = isnull(w.CreatedBy, t.CancellationInitiatedBy),
		t.[ApprovedBy] = isnull(w.ModifiedBy, t.CancellationInitiatedBy),
		t.[ApprovedDate] = isnull(w.EndDateAndTime, t.CancellationInitiatedDate)
	from @policy t
		left join bpm.Wizard w (nolock) on w.Id = t.WizardId

	-- Update cover amounts and number of members for group schemes
	update p set
		CoverAmount = t.CoverAmount,
		NoOfLives = t.Members
	from @policy p
		inner join (
			select p.PolicyId,
				max(br.BenefitAmount) [CoverAmount],
				sum(case pil.InsuredLifeStatusId when 1 then 1 else 0 end) [Members]
			from @policy t
				inner join policy.Policy p (nolock) on p.PolicyId = t.PolicyId
				inner join policy.Policy c (nolock) on c.ParentPolicyId = p.PolicyId
				inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = c.PolicyId
				inner join product.CurrentBenefitRate br (nolock) on
					br.ProductOptionId = c.ProductOptionId and
					br.BenefitId = pil.StatedBenefitId
			where t.IsGroupScheme = 1
			group by p.PolicyId
		) t on t.PolicyId = p.PolicyId

	-- Update cover amounts and number of members for member policies
	update p set
		CoverAmount = t.CoverAmount,
		NoOfLives = t.Members
	from @policy p 
		inner join (
			select t.PolicyId,
				max(br.BenefitAmount) [CoverAmount],
				sum(case pil.InsuredLifeStatusId when 1 then 1 else 0 end) [Members]
			from @policy t
				inner join policy.Policy p (nolock) on p.PolicyId = t.PolicyId
				inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
				inner join product.CurrentBenefitRate br (nolock) on
					br.ProductOptionId = t.ProductOptionId and
					br.BenefitId = pil.StatedBenefitId
			where t.IsGroupScheme = 0
			group by t.PolicyId
		) t on t.PolicyId = p.PolicyId

	SELECT [ProductOptionName] [Product],
		[PolicyNumber],
		[PolicyStatus],
		[CancellationInitiatedDate],
		[ApprovedDate] [CancellationNotificationDate],
		[PolicyCancellationDate] [CancellationDate],
		[CreatedBy] [CancellationInitiatedBy],
		[PolicyInceptionDate],
		[PremiumCancelled],
		[CancellationReason],
		[MemberFirstName] [MemberName],
		[MemberSurname],
		[MemberNo],
		[IndustryClass] [IndsutryClass],
		[CreatedBy],
		[ApprovedBy],
		[BrokerName],
		[CoverAmount] [BenefitAmount],
		[InstallmentPremium],
		[Schemename],
		[Nooflives],
		[LastLapsedDate],
		[CreatedBy] [CancelledBy]
	from @policy
	order by ParentPolicyId, 
		PolicyId

END
GO
