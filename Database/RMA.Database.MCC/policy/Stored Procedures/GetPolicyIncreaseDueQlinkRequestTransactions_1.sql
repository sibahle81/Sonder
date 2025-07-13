CREATE   PROCEDURE [policy].[GetPolicyIncreaseDueQlinkRequestTransactions]
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

	select FspNumber,
		ItemType,
		ItemId,
		Amount,
		IdNumber,
		DeductionType,
		EmployeeNumber,
		StartDate,
		Initials,
		ReferenceNumber,
		Surname,
		TransactionType,
		SalaryMonth,
		EndDate
	from (
		select distinct b.FspNumber,
			'Policy' [ItemType],
			p.PolicyId [ItemId],
			ai.PremiumAfter [Amount],
			per.IdNumber,
			'0056' [DeductionType],
			pd.PersalNumber [EmployeeNumber],
			isnull(@startDate, replace(cast(p.PolicyInceptionDate as varchar(16)), '-', '')) [StartDate],
			client.GetInitials(per.FirstName) [Initials],
			replace(p.PolicyNumber, '-', 'X') [ReferenceNumber],
			upper(per.Surname) [Surname],
			2 [TransactionType],
			left(isnull(@startDate, replace(cast(p.PolicyInceptionDate as varchar(16)), '-', '')), 6)  [SalaryMonth],
			null [EndDate],
			RANK() over (partition by pd.RolePlayerId order by pd.CreatedDate desc) [Rank]
		from broker.Brokerage b
			inner join policy.Policy p on p.BrokerageId = b.Id
			inner join policy.AnnualIncrease ai on ai.PolicyId = p.PolicyId
			inner join client.Person per on per.RolePlayerId = p.PolicyOwnerId
			inner join client.RolePlayerPersalDetail pd on pd.RolePlayerId = per.RolePlayerId
		where ai.PolicyIncreaseStatusId = 2
		  and pd.IsDeleted = 0
		) t
	where [Rank] = 1
	order by [ReferenceNumber]

END