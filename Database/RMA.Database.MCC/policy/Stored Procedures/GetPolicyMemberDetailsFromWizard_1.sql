CREATE   PROCEDURE [policy].[GetPolicyMemberDetailsFromWizard] (@wizardId int, @section varchar(32))
as begin

	set nocount on

	declare @members varchar(max)

	select @members = json_query([Data], concat('$[0].', @section))
	from [bpm].[Wizard]  where [Id] = @wizardId

	declare @member table (
		RolePlayerId int,
		DisplayName varchar(64),
		DateOfBirth date,
		IdTypeId int,
		IdNumber varchar(32),
		PassportNumber varchar(32),
		JoinDate date,
		Premium money,
		CoverAmount money,
		IsDeleted bit
	)

	update @member set
		IdNumber = iif(convert(date, left(IdNumber, 10)) = DateOfBirth, convert(date, left(IdNumber, 10)), IdNumber)
	where isdate(left(IdNumber, 10)) = 1

	insert into @member
	select *
	from openjson(@members) with (
		RolePlayerId int '$.rolePlayerId',
		DisplayName varchar(64) '$.displayName',
		DateOfBirth date '$.person.dateOfBirth',
		IdTypeId int '$.person.idType',
		IdNumber varchar(32) '$.person.idNumber',
		PassportNumber varchar(32) '$.person.passportNumber',
		JoinDate date '$.joinDate',
		Premium money '$.benefits[0].benefitBaseRateLatest',
		CoverAmount money '$.benefits[0].benefitRateLatest',
		IsDeleted bit '$.isDeleted'
	)

	if (@section = 'beneficiaries') begin
		select RolePlayerId, DisplayName, DateOfBirth, IdNumber, getdate() JoinDate, 0.0 Premium, 0.0 CoverAmount
		from @member
	end else begin
		select RolePlayerId, DisplayName, DateOfBirth, IdNumber, JoinDate, Premium, CoverAmount
		from @member
		where IsDeleted = 0
	end

	set nocount off
end