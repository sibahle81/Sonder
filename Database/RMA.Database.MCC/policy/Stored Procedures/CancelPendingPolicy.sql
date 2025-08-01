CREATE PROCEDURE [policy].[CancelPendingPolicy]
	@policyId int
AS BEGIN

	declare @user varchar(32) = 'BackendProcess'
	declare @date datetime = getdate()
	declare @monthEnd date
	declare @claims int

	set @date = dateadd(millisecond, -datepart(millisecond, @date), @date)
	set @monthEnd = dateadd(day, -1, dateadd(month, 1, datefromparts(year(@date), month(@date), 1)))

	declare @policy table (
		PolicyId int,
		ParentPolicyId int,
		InceptionDate date,
		PolicyStatusId int,
		PolicyOwnerTypeId int,
		FirstInstallmentDate date,
		CancellationInitiatedDate date,
		CancellationInitiatedBy varchar(128),
		CancellationDate date,
		PolicyCancelReasonId int,
		RegularInstallmentDayOfMonth int,
		DecemberInstallmentDayOfMonth int,
		AnnualBefore money,
		PremiumBefore money,
		AnnualAfter money,
		PremiumAfter money,
		InCoolingOffPeriod bit
	)

	-- Get the schemes to cancel
	insert into @policy (PolicyId, ParentPolicyId, InceptionDate, PolicyStatusId, PolicyOwnerTypeId, FirstInstallmentDate, CancellationInitiatedDate, CancellationInitiatedBy, CancellationDate, PolicyCancelReasonId, RegularInstallmentDayOfMonth, DecemberInstallmentDayOfMonth, AnnualBefore, PremiumBefore, InCoolingOffPeriod)
		select p.PolicyId,
			p.ParentPolicyId,
			p.PolicyInceptionDate,
			p.PolicyStatusId,
			rp.RolePlayerIdentificationTypeId,
			iif(p.FirstInstallmentDate = '0001-01-01', null, p.FirstInstallmentDate),
			isnull(p.CancellationInitiatedDate, @date), 
			isnull(p.CancellationInitiatedBy, @user),
			isnull(p.CancellationDate, @monthEnd),
			isnull(p.PolicyCancelReasonId, iif(@date < dateadd(month, 1, p.PolicyInceptionDate), 10, 12)),
			p.RegularInstallmentDayOfMonth,
			p.DecemberInstallmentDayOfMonth,
			p.AnnualPremium,
			p.InstallmentPremium,
			iif(@date < dateadd(month, 1, p.PolicyInceptionDate), 1, 0)
		from policy.Policy p (nolock)
			inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId and rp.IsDeleted = 0
		where p.PolicyId = @policyId

	declare @member table (
		PolicyId int primary key,
		ParentPolicyId int,
		InceptionDate date,
		PolicyStatusId int,
		FirstInstallmentDate date,
		CancellationInitiatedDate date,
		CancellationInitiatedBy varchar(128),
		CancellationDate date,
		PolicyCancelReasonId int,
		RegularInstallmentDayOfMonth int,
		DecemberInstallmentDayOfMonth int,
		AnnualBefore money,
		PremiumBefore money,
		AnnualAfter money,
		PremiumAfter money,
		InCoolingOffPeriod bit,
		Claims int
	)

	insert into @member ([PolicyId], [ParentPolicyId], [InceptionDate], [PolicyStatusId], [FirstInstallmentDate], [CancellationInitiatedDate], [CancellationInitiatedBy], [CancellationDate], [PolicyCancelReasonId], [RegularInstallmentDayOfMonth], [DecemberInstallmentDayOfMonth], [AnnualBefore], [PremiumBefore], [AnnualAfter], [PremiumAfter], [InCoolingOffPeriod], [Claims])
		select p.PolicyId,
			p.ParentPolicyId,
			p.PolicyInceptionDate,
			p.PolicyStatusId,
			iif(p.FirstInstallmentDate = '0001-01-01', null, p.FirstInstallmentDate),
			isnull(p.CancellationInitiatedDate, x.CancellationInitiatedDate), 
			isnull(p.CancellationInitiatedBy, x.CancellationInitiatedBy),
			isnull(p.CancellationDate, x.CancellationDate),
			isnull(p.PolicyCancelReasonId, x.PolicyCancelReasonId),
			p.RegularInstallmentDayOfMonth,
			p.DecemberInstallmentDayOfMonth,
			p.AnnualPremium,
			p.InstallmentPremium,
			0 [AnnualAfter],
			0 [PremiumAfter],
			x.InCoolingOffPeriod,
			count(c.ClaimId) [Claims]
		from @policy x
			inner join policy.Policy p (nolock) on p.ParentPolicyId = x.PolicyId
			left join claim.Claim c (nolock) on c.PolicyId = p.PolicyId and c.IsDeleted = 0
		where p.PolicyStatusId = iif(x.PolicyStatusId = 10, p.PolicyStatusId, 10)
		  and p.PolicyStatusId not in (2, 4, 5, 13) -- select * from common.PolicyStatus order by 1
		group by p.PolicyId,
			p.ParentPolicyId,
			p.PolicyInceptionDate,
			p.PolicyStatusId,
			p.FirstInstallmentDate,
			p.CancellationInitiatedDate, 
			p.CancellationInitiatedBy, 
			p.CancellationDate, 
			p.PolicyCancelReasonId,
			p.RegularInstallmentDayOfMonth,
			p.DecemberInstallmentDayOfMonth,
			p.AnnualPremium,
			p.InstallmentPremium,
			x.CancellationInitiatedDate, 
			x.CancellationInitiatedBy,
			x.CancellationDate,
			x.PolicyCancelReasonId,
			x.InCoolingOffPeriod
		order by p.ParentPolicyId,
			p.PolicyId

	select @claims = count(*) from @member where isnull(Claims, 0) > 0

	-- Cancel child policies
	update p set
		p.PolicyStatusId = 2,
		p.CancellationInitiatedDate = x.CancellationInitiatedDate, 
		p.CancellationInitiatedBy = x.CancellationInitiatedBy, 
		p.CancellationDate = x.CancellationDate, 
		p.PolicyCancelReasonId = x.PolicyCancelReasonId,
		p.ModifiedBy = @user,
		p.ModifiedDate = @date
	from @member x 
		inner join policy.Policy p on p.PolicyId = x.PolicyId

	-- Recalculate scheme policy premium, which also updates the child policies
	if exists (select * from @policy where PolicyOwnerTypeId = 2) begin
		exec policy.UpdateChildPolicyPremiums @policyId, @user
		-- Update the parent policy table variable
		update x set
			x.PremiumAfter = p.InstallmentPremium,
			x.AnnualAfter = p.AnnualPremium
		from @policy x 
			inner join policy.Policy p on p.PolicyId = x.PolicyId
		-- Save a policy note for the parent policy
		insert into policy.PolicyNote (PolicyId, [Text], IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
		select PolicyId [PolicyId], 
			concat('Updated premium from ',format(PremiumBefore, '#,##0.00'),' to ',format(PremiumAfter, '#,##0.00'),' through cancelling pending policies.') [Text],
			0 [IsDeleted], 
			@user [CreatedBy],
			@date [CreatedDate],
			@user [ModifiedBy],
			@date [ModifiedDate]
		from @policy
		where PremiumBefore <> PremiumAfter
	end else begin
		-- Update the policy table variable for individual policies
		update @policy set PremiumAfter = 0.00, AnnualAfter = 0.00
	end

	-- Update the parent policy
	update p set
		p.PolicyStatusId = 2,
		p.CancellationInitiatedDate = x.CancellationInitiatedDate, 
		p.CancellationInitiatedBy = x.CancellationInitiatedBy, 
		p.CancellationDate = x.CancellationDate, 
		p.PolicyCancelReasonId = x.PolicyCancelReasonId,
		p.ModifiedBy = @user,
		p.ModifiedDate = @date
	from @policy x 
		inner join policy.Policy p on p.PolicyId = x.PolicyId
	where x.PolicyStatusId = 10

	-- Billing Policy Change Message
	select 0 [Id],
		(select (PremiumBefore - PremiumAfter) [AdjustmentAmount],
			cast(iif(PolicyOwnerTypeId = 2, 1, 0) as bit) [IsGroupPolicy],
			CancellationInitiatedBy [RequestedByUsername],
			1 [SourceModule],
			'CancellationCreditNote' [TransactionReason],
			1 [policyChangeMessageType]
		FOR JSON PATH, INCLUDE_NULL_VALUES, WITHOUT_ARRAY_WRAPPER) [Name]
	from @policy
	union
	-- Old BillingPolicyChangeDetail
	select 1 [Id],
		(select 0 [BinderFeePercentage],
			0 [AdministrationPercentage],
			cast(iif(@claims > 0, 1, 0) as bit) [ClaimsAgainstPolicy], 
			0 [ClaimsToPolicy],
			0 [CommissionPercentage],
			null [CreditNoteReason],
			DecemberInstallmentDayOfMonth,
			null [EffectiveDate],
			FirstInstallmentDate,
			[PremiumBefore] [InstallmentPremium],
			InCoolingOffPeriod [IsStillWithinCoolingOffPeriod],
			null ParentPolicyId,
			null [PolicyCancelReason],
			PolicyId,
			InceptionDate [PolicyInceptionDate],
			PolicyStatusId [PolicyStatus],
			0 [PremiumAdjustmentPercentage]
		FOR JSON PATH, INCLUDE_NULL_VALUES, WITHOUT_ARRAY_WRAPPER) [Name]
	from @policy
	union
	-- New BillingPolicyChangeDetail
	select 2 [Id],
		(select 0 [BinderFeePercentage],
			0 [AdministrationPercentage],
			cast(iif(@claims > 0, 1, 0) as bit) [ClaimsAgainstPolicy], 
			0 [ClaimsToPolicy],
			0 [CommissionPercentage],
			1 [CreditNoteReason],
			DecemberInstallmentDayOfMonth,
			case PolicyStatusId when 10 then CancellationDate else null end [EffectiveDate],
			FirstInstallmentDate,
			[PremiumAfter] [InstallmentPremium],
			InCoolingOffPeriod [IsStillWithinCoolingOffPeriod],
			null ParentPolicyId,
			case PolicyStatusId when 10 then PolicyCancelReasonId else null end [PolicyCancelReasonId],
			PolicyId,
			InceptionDate [PolicyInceptionDate],
			case PolicyStatusId when 10 then 2 else PolicyStatusId end [PolicyStatus],
			0 [PremiumAdjustmentPercentage]
		FOR JSON PATH, INCLUDE_NULL_VALUES, WITHOUT_ARRAY_WRAPPER) [Name]
	from @policy
	union
	-- Old Child BillingPolicyChangeDetail
	select 3 [Id],
		coalesce(
			(
				select 0 [BinderFeePercentage],
					0 [AdministrationPercentage],
					cast(iif(Claims > 0, 1, 0) as bit) [ClaimsAgainstPolicy], 
					0 [ClaimsToPolicy],
					0 [CommissionPercentage],
					null [CreditNoteReason],
					DecemberInstallmentDayOfMonth,
					null [EffectiveDate],
					FirstInstallmentDate,
					[PremiumBefore] [InstallmentPremium],
					InCoolingOffPeriod [IsStillWithinCoolingOffPeriod],
					ParentPolicyId,
					null [PolicyCancelReason],
					PolicyId,
					InceptionDate [PolicyInceptionDate],
					PolicyStatusId [PolicyStatus],
					0 [PremiumAdjustmentPercentage]
				FROM @member
				FOR JSON PATH, INCLUDE_NULL_VALUES
			),
			'[]' -- Default empty array
		) [Name]
	union
	-- New Child BillingPolicyChangeDetail
	select 4 [Id],
		coalesce(
			(
				select 0 [BinderFeePercentage],
					0 [AdministrationPercentage],
					cast(iif(Claims > 0, 1, 0) as bit) [ClaimsAgainstPolicy], 
					0 [ClaimsToPolicy],
					0 [CommissionPercentage],
					1 [CreditNoteReason],
					DecemberInstallmentDayOfMonth,
					CancellationDate [EffectiveDate],
					FirstInstallmentDate,
					[PremiumAfter] [InstallmentPremium],
					InCoolingOffPeriod [IsStillWithinCoolingOffPeriod],
					ParentPolicyId,
					PolicyCancelReasonId [PolicyCancelReason],
					PolicyId,
					InceptionDate [PolicyInceptionDate],
					2 [PolicyStatus],
					0 [PremiumAdjustmentPercentage]
				FROM @member
				FOR JSON PATH, INCLUDE_NULL_VALUES
			),
			'[]' -- Default empty array
		) [Name]
	
END
GO
