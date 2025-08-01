CREATE PROCEDURE [policy].[GetPolicyIncreaseDueQlinkRequestTransactions] 
	@policyIncreaseStatusId int
WITH RECOMPILE
AS BEGIN

	-- Replace double spaces with single spaces, otherwise havoc is wreaked with Qlink transactions
	while exists(select RolePlayerId from client.Person where FirstName like '%  %') begin
		update client.Person set FirstName = trim(replace(FirstName, '  ', ' ')) where  FirstName like '%  %'
	end
	while exists(select RolePlayerId from client.Person where Surname like '%  %') begin
		update client.Person set Surname = trim(replace(Surname, '  ', ' ')) where  Surname like '%  %'
	end

	declare @cutoffDate date
	declare @startDate varchar(16)

	select top 1 @cutoffDate = SalaryMonth from client.PersalCutOffDate where CutoffDate >= getdate() order by CutOffDate
	set @startDate = replace(cast(@cutoffDate as varchar(16)), '-', '')

	select ItemType,
		ItemId [ItemId],
		TransactionType [TransactionType],
		isnull(EmployeeNumber, '') [EmployeeNumber],
		Surname,
		Initials,
		IDNumber,
		ReferenceNumber,
		Amount,
		SalaryMonth,
		StartDate,
		EndDate,
		DeductionType,
		'' ReservationNumber,
		'' CorrectedReferenceNumber,
		'' NewDeductionType,
		'' OldEmployeeNumber,
		FspNumber,
		0 QlinkTransactionId,
		cast(isnull(PayrollCode, 1) as int) [PayrollId],
		isnull(PayrollCode, '1') [Payroll],
		[IntermediaryID]
	from (
		select distinct b.FspNumber,
			r.IdNumber [IntermediaryID],
			'Policy' [ItemType],
			p.PolicyId [ItemId],
			ai.PremiumAfter [Amount],
			per.IdNumber,
			'0056' [DeductionType],
			pd.PersalNumber [EmployeeNumber],
			format(ai.EffectiveDate, 'yyyyMMdd') [StartDate],
			client.GetInitials(per.FirstName) [Initials],
			replace(p.PolicyNumber, '-', 'X') [ReferenceNumber],
			upper(per.Surname) [Surname],
			2 [TransactionType],
			format(ai.EffectiveDate, 'yyyyMM') [SalaryMonth],
			null [EndDate],
			pd.PayRollCode,
			RANK() over (partition by pd.RolePlayerId order by pd.CreatedDate desc) [Rank]
		from policy.Policy p (nolock)
			inner join broker.Brokerage b (nolock) on b.Id = p.BrokerageId
			inner join broker.Representative r (nolock) on r.Id = p.RepresentativeId
			inner join policy.AnnualIncrease ai (nolock) on ai.PolicyId = p.PolicyId
			inner join client.Person per (nolock) on per.RolePlayerId = p.PolicyOwnerId
			left join client.RolePlayerPersalDetail pd (nolock) on pd.RolePlayerId = per.RolePlayerId and pd.IsDeleted = 0
		where ai.PolicyIncreaseStatusId = @policyIncreaseStatusId
		) t
	where [Rank] = 1
	order by [ReferenceNumber]

END
