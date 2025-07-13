CREATE PROCEDURE [policy].[GetCompanyStopOrderPaymentFile] @employerCode varchar(8), @salaryDate date
AS BEGIN

	declare @startDate date = dateadd(month, -1, @salaryDate)

	-- Add a space to the employer code, because that is what we will be searching for in the persal details table
	set @employerCode = concat(trim(@employerCode), ' ')

	declare @policy table (
		PolicyId int primary key,
		PolicyNumber varchar(32),
		InceptionDate date,
		CancellationDate date,
		PolicyStatusId int,
		Premium money,
		CreatedDate date,
		ModifiedDate date,
		PolicyStatus varchar(16),
		RolePlayerId int,
		EmployerName varchar(128),
		EmployeeNumber varchar(32)
	)

	insert into @policy ([PolicyId], [PolicyNumber], [InceptionDate], [CancellationDate], [PolicyStatusId], [Premium], [CreatedDate], [ModifiedDate], [RolePlayerId], [EmployerName], [EmployeeNumber])
		select p.[PolicyId], 
			p.[PolicyNumber], 
			p.[PolicyInceptionDate] [InceptionDate], 
			p.[CancellationDate],
			p.[PolicyStatusId],		
			p.[InstallmentPremium] [Premium],
			p.[CreatedDate], 
			p.[ModifiedDate],
			p.[PolicyOwnerId] [RolePlayerId],
			pd.[Employer] [EmployerName],
			pd.[PersalNumber] [EmployeeNumber]
		from policy.Policy p (nolock)
			inner join client.RolePlayerPersalDetail pd (nolock) on pd.RolePlayerId = p.PolicyOwnerId
		where p.PaymentMethodId = 19
		  and p.IsDeleted = 0
		  and pd.IsDeleted = 0
		  and left(pd.Employer, len(@employerCode)) = @employerCode

	-- Do not send policies that aren't active yet
	delete from @policy where InceptionDate > @salaryDate

	-- Update statuses of policies that have to be included in the file
	update @policy set PolicyStatus = 'New' where PolicyStatusId in (1, 3, 14, 15, 18, 20, 22, 23) and InceptionDate >= @salaryDate
	update @policy set PolicyStatus = 'Cancel' where PolicyStatusId in (2, 10) and CancellationDate >= @startDate and CancellationDate <= @salaryDate
	update @policy set PolicyStatus = 'Update' where PolicyStatusId in (1, 3, 14, 15, 18, 20, 22, 23) and ModifiedDate > @startDate and PolicyStatus is null

	-- Remove records that should not be sent
	delete from @policy where PolicyStatus is null

	if exists(select top 1 * from @policy where PolicyId > 1) begin
		select concat(@employerCode, ' - Rand Mutual Assurance') [CompanyName],
			@salaryDate [Month],
			x.EmployerName [Company],
			x.EmployeeNumber [PersalNumber],
			per.IdNumber,
			upper(concat(per.Surname, ' ', client.GetInitials(per.FirstName))) [MemberName],
			replace(x.PolicyNumber, '-', 'X') [PolicyNumber],
			x.PolicyStatus,
			x.Premium,
			'' [Term],
			'' [Note]
		from @policy x
			inner join client.Person per (nolock) on per.RolePlayerId = x.RolePlayerId
	end else begin
		select concat(@employerCode, ' - Rand Mutual Assurance') [CompanyName],
			@salaryDate [Month],
			null [Company],
			null [PersalNumber],
			null [IdNumber],
			null [MemberName],
			null [PolicyNumber],
			null [PolicyStatus],
			null [Premium],
			'' [Term],
			'' [Note]
	end

END
