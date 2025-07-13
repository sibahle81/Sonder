
CREATE   PROCEDURE [policy].[SetupConsolidatedFuneralAnnualIncreases] (@userId varchar(128))
AS BEGIN

	set nocount on

	if isnull(@userId, '') = '' begin
		set @userId = 'BackendProcess'
	end

	declare @today date = getdate()
	declare @cutoff date = dateadd(week, 5, @today)
	declare @increaseMonth int = month(dateadd(month, 1, @today))

	declare @policy table (
		PolicyId int primary key,
		PolicyInceptionDate date not null,
		PolicyStatusId int,
		LastIncreaseId int,
		LastIncreaseDate date,
		LastIncreaseStatus int,
		IncreaseMonth int,
		NextIncreaseDate date,
		RolePlayerId int,
		MainMemberAge int
	)

	insert into @policy (PolicyId, PolicyInceptionDate, PolicyStatusId, LastIncreaseId, IncreaseMonth, RolePlayerId, MainMemberAge)
		select p.PolicyId,
			p.PolicyInceptionDate,
			p.PolicyStatusId,
			isnull(max(ai.AnnualIncreaseId), 0) [LastIncreaseId],
			month(p.PolicyInceptionDate) [IncreaseMonth],
			p.PolicyOwnerId [RolePlayerId],
			client.CalculateAge(per.DateOfBirth)
		from policy.Policy p
			inner join policy.PolicyStatusActionsMatrix pam on pam.PolicyStatus = p.PolicyStatusId
			inner join policy.PolicyLifeExtension le on le.PolicyId = p.PolicyId
			inner join client.Person per on per.RolePlayerId = p.PolicyOwnerId
			left join policy.AnnualIncrease ai on ai.PolicyId = p.PolicyId
		where p.ProductOptionId in (132, 133)
		  and le.AnnualIncreaseTypeId in (2, 3)
		  and month(p.PolicyInceptionDate) = @increaseMonth
		  and pam.DoRaiseInstallementPremiums = 1
		group by p.PolicyId,
			p.PolicyNumber,
			p.PolicyInceptionDate,
			p.PolicyStatusId,
			le.AnnualIncreaseMonth,
			p.PolicyOwnerId,
			per.DateOfBirth

	-- Update the last increase details
	update p set
		p.LastIncreaseDate = isnull(ai.EffectiveDate, p.PolicyInceptionDate),
		p.LastIncreaseStatus = isnull(ai.PolicyIncreaseStatusId, 0)
	from @policy p
		left join policy.AnnualIncrease ai on ai.PolicyId = p.PolicyId

	-- Update the annual increase month in the policy life extension table
	update le set
		le.AnnualIncreaseMonth = month(p.PolicyInceptionDate),
		le.ModifiedBy = @userId,
		le.ModifiedDate = getdate()
	from @policy p
		inner join policy.PolicyLifeExtension le on le.PolicyId = p.PolicyId 

	-- Update the next increase due date
	update @policy set
		NextIncreaseDate = concat(year(dateadd(year, 1, isnull(LastIncreaseDate, PolicyInceptionDate))), '-', right(concat('0', IncreaseMonth), 2), '-01')

	-- Clear policies not due for increase now
	delete from @policy where NextIncreaseDate > @cutoff

	-- Clear policies already in the queque for processing
	delete p
	from @policy p
		inner join policy.AnnualIncrease ai on ai.PolicyId = p.PolicyId and ai.EffectiveDate = p.NextIncreaseDate
	where ai.IsDeleted = 0

	-- Clear policies where the main member is 65 or older
	delete from @policy where MainMemberAge >= 65

	-- Insert the policies due for an increase
	insert into policy.AnnualIncrease (PolicyId, PolicyIncreaseStatusId, EffectiveDate, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
		select PolicyId, 
			1 [PolicyIncreaseStatusId],
			NextIncreaseDate [EffectiveDate],
			0 [IsDeleted], 
			@userId [CreatedBy], 
			getdate() [CreatedDate], 
			@userId [ModifiedBy], 
			getdate() [ModifiedDate]
		from @policy

	set nocount off

END