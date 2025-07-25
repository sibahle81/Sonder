CREATE PROCEDURE [Load].[InsertConsolidatedFuneralBank] @fileIdentifier uniqueidentifier
AS BEGIN

	-- declare @fileIdentifier uniqueidentifier = '6BEF3CEA-6B12-4B56-8D2A-9CCF42E99933'
	
	set nocount on 

	-- do not continue if the wizard has already been processed
	if Load.ConsolidatedFuneralPolicyCreated(@fileIdentifier) = 0 begin

		-- insert bank account details
		delete from [Load].[ConsolidatedFuneralBank] where [FileIdentifier] = @fileIdentifier
		insert into [Load].[ConsolidatedFuneralBank] ([FileIdentifier], [IdNumber], [Bank], [BranchCode], [AccountNo], [AccountType])
			select distinct @fileIdentifier,
				iif(isnull([IdNumber], '') = '', [PassportNumber], [IdNumber]) [IdNumber],
				[Bank],
				[BranchCode],
				[AccountNo],
				[AccountType]
			from [Load].[ConsolidatedFuneral] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and [ClientType] = 'Main Member'
			  and isnull([Bank], '') <> ''

		-- apply manual corrections to some common errors in bank account types manually entered by users
		update [Load].[ConsolidatedFuneralBank] set [AccountType] = 'Current Account' where [FileIdentifier] = @fileIdentifier and [AccountType] like '%current%'
		update [Load].[ConsolidatedFuneralBank] set [AccountType] = 'Current Account' where [FileIdentifier] = @fileIdentifier and [AccountType] like '%curent%'
		update [Load].[ConsolidatedFuneralBank] set [AccountType] = 'Current Account' where [FileIdentifier] = @fileIdentifier and [AccountType] like '%cuurent%'
		update [Load].[ConsolidatedFuneralBank] set [AccountType] = 'Transmission Account' where [FileIdentifier] = @fileIdentifier and [AccountType] like '%transmission%'
		update [Load].[ConsolidatedFuneralBank] set [AccountType] = 'Credit Card Account' where [FileIdentifier] = @fileIdentifier and [AccountType] like '%credit%'
		update [Load].[ConsolidatedFuneralBank] set [AccountType] = 'Savings Account' where [FileIdentifier] = @fileIdentifier and [AccountType] like '%savin%'
		update [Load].[ConsolidatedFuneralBank] set [AccountType] = 'Cheque Account' where [FileIdentifier] = @fileIdentifier and [AccountType] like '%cheque%'

		-- insert salary deduction details
		delete from [Load].[ConsolidatedFuneralDeduction] where [FileIdentifier] = @fileIdentifier
		insert into [Load].[ConsolidatedFuneralDeduction] ([FileIdentifier], [IdNumber], [Employer], [Department], [PersalNumber], [PayrollCode])
			select distinct @fileIdentifier,
				iif(isnull([IdNumber], '') = '', [PassportNumber], [IdNumber]) [IdNumber],
				case [PaymentMethod]
					when 'Corporate Stop Order' then trim(concat([PayrollCode], ' ', [Employer]))
					else [Employer]
				end [Employer],
				[Department],
				[PersalNumber],
				[PayrollCode]
			from [Load].[ConsolidatedFuneral] (nolock)
			where [FileIdentifier] = @fileIdentifier
			  and [ClientType] = 'Main Member'
			  and isnull([PersalNumber], '') <> ''
	end

END
