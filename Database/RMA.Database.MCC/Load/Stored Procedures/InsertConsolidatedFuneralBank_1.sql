
CREATE   PROCEDURE [Load].[InsertConsolidatedFuneralBank] @fileIdentifier uniqueidentifier
AS BEGIN

	--declare @fileIdentifier uniqueidentifier = '8D5731D2-EC82-44EF-BFAE-B4EB026613F3'
	
	delete from [Load].[ConsolidatedFuneralBank] where [FileIdentifier] = @fileIdentifier
	insert into [Load].[ConsolidatedFuneralBank] ([FileIdentifier], [IdNumber], [Bank], [BranchCode], [AccountNo], [AccountType])
		select @fileIdentifier,
			iif(isnull([IdNumber], '') = '', [PassportNumber], [IdNumber]) [IdNumber],
			[Bank],
			[BranchCode],
			[AccountNo],
			[AccountType]
		from [Load].[ConsolidatedFuneral]   
		where [FileIdentifier] = @fileIdentifier
		  and [ClientType] = 'Main Member'
		  and isnull([Bank], '') <> ''

	delete from [Load].[ConsolidatedFuneralDeduction] where [FileIdentifier] = @fileIdentifier
	insert into [Load].[ConsolidatedFuneralDeduction] ([FileIdentifier], [IdNumber], [Employer], [Department], [PersalNumber])
		select @fileIdentifier,
			iif(isnull([IdNumber], '') = '', [PassportNumber], [IdNumber]) [IdNumber],
			 [Employer],
			 [Department],
			 [PersalNumber]
		from [Load].[ConsolidatedFuneral]   
		where [FileIdentifier] = @fileIdentifier
		  and [ClientType] = 'Main Member'
		  and isnull([PersalNumber], '') <> ''
END