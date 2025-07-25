CREATE PROCEDURE [policy].[SetupConsolidatedFuneralAnnualIncreases] 
	@userId varchar(128)
AS BEGIN

	set nocount on

	if isnull(@userId, '') = '' begin
		set @userId = 'BackendProcess'
	end

	declare @today date = getdate()

	-- The increase date is on the first of the month following next month.
	declare @effectiveDate date = dateadd(month, 2, datefromparts(year(@today), month(@today), 1))
	-- Get the cutoff date. It is two days after the PERSAL cutoff date for the month before the effective date
	declare @cutoff date
	select @cutoff = dateadd(day, 2, CutoffDate) from client.PersalCutOffDate (nolock) where SalaryMonth = dateadd(month, -1, @effectiveDate)
	if (@cutoff is null) set @cutoff = @effectiveDate

	if (@today >= @cutoff) begin

		-- Check if this month has already been done
		if not exists (select AnnualIncreaseId from policy.AnnualIncrease where EffectiveDate = @effectiveDate) begin

			declare @policy table (
				PolicyId int primary key,
				InceptionDate date,
				PolicyStatusId int,
				IncreaseMonth int,
				LastIncreaseId int,
				LastIncreaseDate date,
				LastIncreaseStatus int,
				RolePlayerId int,
				Age int
			)

			insert into @policy ([PolicyId], [InceptionDate], [PolicyStatusId], [IncreaseMonth], [LastIncreaseId], [RolePlayerId], [Age])
				select p.PolicyId,
					p.PolicyInceptionDate [InceptionDate],
					p.PolicyStatusId,
					le.AnnualIncreaseMonth [IncreaseMonth],
					isnull(max(ai.AnnualIncreaseId), 0) [LastIncreaseId],
					p.PolicyOwnerId [RolePlayerId],
					client.CalculateAge(per.DateOfBirth) [Age]
				from policy.Policy p (nolock)
					inner join policy.PolicyStatusActionsMatrix pam (nolock) on pam.PolicyStatus = p.PolicyStatusId
					inner join policy.PolicyLifeExtension le (nolock) on le.PolicyId = p.PolicyId
					inner join client.Person per (nolock) on per.RolePlayerId = p.PolicyOwnerId
					left join policy.AnnualIncrease ai (nolock) on ai.PolicyId = p.PolicyId
				where p.ProductOptionId in (132, 133)
					and iif(p.CreatedDate < p.PolicyInceptionDate, p.CreatedDate, p.PolicyInceptionDate) < dateadd(month, -9, @effectiveDate)
					and le.AnnualIncreaseTypeId in (2, 3)
					and isnull(le.AnnualIncreaseMonth, month(p.PolicyInceptionDate)) = month(@effectiveDate)
					and pam.DoRaiseInstallementPremiums = 1
				group by p.PolicyId,
					p.PolicyNumber,
					p.PolicyInceptionDate,
					p.PolicyStatusId,
					le.AnnualIncreaseMonth,
					p.PolicyOwnerId,
					per.DateOfBirth
				order by PolicyId

			-- Remove members older than 65
			delete from @policy where Age > 65

			-- Update last increase details
			update x set
				x.LastIncreaseDate = ai.EffectiveDate,
				x.LastIncreaseStatus = ai.PolicyIncreaseStatusId
			from @policy x
				inner join policy.AnnualIncrease ai (nolock) on ai.AnnualIncreaseId = x.LastIncreaseId

			-- Clear policies already in the queque for processing
			delete p
			from @policy p
				inner join policy.AnnualIncrease ai (nolock) on ai.PolicyId = p.PolicyId and ai.EffectiveDate = @effectiveDate
			where ai.IsDeleted = 0

			-- Insert the policies due for an increase
			insert into policy.AnnualIncrease (PolicyId, PolicyIncreaseStatusId, EffectiveDate, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
				select PolicyId, 
					1 [PolicyIncreaseStatusId],
					@effectiveDate [EffectiveDate],
					0 [IsDeleted], 
					@userId [CreatedBy], 
					getdate() [CreatedDate], 
					@userId [ModifiedBy], 
					getdate() [ModifiedDate]
				from @policy
		end else begin
			print concat('The increases for ', @effectiveDate, ' have already run')
		end
	end else begin
		print concat('Cannot execute for ', @effectiveDate, ' until ', @cutoff)
	end
END
