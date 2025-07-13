-- =============================================
-- Author:		Bongani Makelane
-- Create date: 10/06/2022
-- Description:	Adjust debtors account after declaring budgeted earnings
-- =============================================
CREATE PROCEDURE [billing].[AdjustDebtorInterestBasedOnBudgetedDeclarations] --2022
	 @declarationYear int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	declare @declarations table (declarationId int, premium decimal(18,2), roleplayerId int)
	
	--declare	 @declarationYear int =2022
	insert into @declarations
	select declarationId,premium,roleplayerId from client.declaration
	where declarationid not in(
	Select declarationId from billing.DeclarationsProccessed)
	and declarationtypeid =1--budgeted 
	and declarationYear = @declarationYear
	and declarationstatusid =2--current
	and premium is not null

	declare @currentId int = (select top 1 declarationId from @declarations)

	while (Select Count(*) From @declarations) > 0
		begin
		declare @newItem varchar(max)
		declare @roleplayerId int
		declare @premium decimal(18,2)
		declare @insertedTransaction int

		 select @roleplayerId=roleplayerid, @premium=premium from @declarations
		 where declarationId = @currentId

		 declare @interestTransactionId int
		 declare @interestTransactionAmount decimal(18,2)
		 declare @invoiceTransactionId int
		 declare @interestRaisedDate datetime
		select @interestTransactionId=transactionid, @interestTransactionAmount = amount, @invoiceTransactionId = LinkedTransactionId, @interestRaisedDate=CreatedDate  from billing.transactions where roleplayerid = @roleplayerid
		and transactiontypeid = 7
		declare @interestYear int=	(SELECT Year(@interestRaisedDate))
		declare @interestMonth int=	(SELECT Month(@interestRaisedDate))
				
		if @interestTransactionId > 0
		declare @interestThatShouldHaveBeenCharged decimal(18,2)
			begin
				declare @balance decimal(18,2)= (select dbo.GetTransactionBalanceForInterest(@interestTransactionId))
				if @balance =@interestTransactionAmount
				begin --we have not done any adjustments before
					--get invoice amount from which interest was calculated based on
					declare @invoiceAmount decimal(18,2) =(select amount from billing.transactions where transactionId = @invoiceTransactionId)
						declare @difference decimal(18,2)
					if @invoiceAmount > @premium
						begin
						--- get how much interest should have been charged
						--using the @premium
						set @interestThatShouldHaveBeenCharged =(select [billing].GetInterestBasedOnDeclaration(@premium,@interestYear,@interestMonth))

						set	@difference = (select @interestTransactionAmount - @interestThatShouldHaveBeenCharged)
												
					  insert into [billing].[Transactions] (
					  [RolePlayerId]
					  ,[TransactionTypeLinkId]
					  ,[Amount]
					  ,[TransactionDate]
					  ,[BankReference]
					  ,[TransactionTypeId]
					  ,[CreatedDate]
					  ,[ModifiedDate]
					  ,[CreatedBy]
					  ,[ModifiedBy], reason, isLogged)
					  values (@roleplayerId,2,@difference,getdate(),CONCAT('CN',FORMAT (getdate(), 'yyyyMMdd')),4,	getdate(),	getdate(),	'system@randmutual.co.za',	'system@randmutual.co.za','Interest Ajustment',0) 
		    
						
						 set @insertedTransaction = (select scope_identity())
						select @newItem = (SELECT * FROM [billing].[Transactions] 
						where transactionId =@insertedTransaction FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)

						insert [audit].[AuditLog]
						(ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
						select @insertedTransaction, 'billing_Transaction', 'Added','',@newItem,GETDATE(),'system@randmutual.co.za',''
					
							--allocate credit
						  insert into [billing].[DebitTransactionAllocation]
						  values (@interestTransactionId, @insertedTransaction,	getdate(),	'system@randmutual.co.za',	'system@randmutual.co.za',	getdate(),@difference)
						  declare @insertedAllocation int= (select scope_identity())
							select @newItem = (SELECT * FROM [billing].[Transactions] 
							where transactionId =@insertedAllocation FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)

						insert [audit].[AuditLog]
						 (ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
						 select @insertedAllocation, 'billing_DebitTransactionAllocation', 'Added','',@newItem,GETDATE(),'system@randmutual.co.za',''
					
						end
					if @invoiceAmount < @premium
						begin

						set @interestThatShouldHaveBeenCharged =(select [billing].GetInterestBasedOnDeclaration(@premium,@interestYear,@interestMonth))

						set	@difference = (select @interestThatShouldHaveBeenCharged- @interestTransactionAmount)

							--generate debit note
							insert into [billing].[Transactions] (
						  [RolePlayerId]
						  ,[TransactionTypeLinkId]
						  ,[Amount]
						  ,[TransactionDate]
						  ,[BankReference]
						  ,[TransactionTypeId]
						  ,[CreatedDate]
						  ,[ModifiedDate]
						  ,[CreatedBy]
						  ,[ModifiedBy], reason, isLogged)
						  values (@roleplayerId,1,@difference,getdate(),CONCAT('DN',FORMAT (getdate(), 'yyyyMMdd')),2,	getdate(),	getdate(),	'system@randmutual.co.za',	'system@randmutual.co.za','Interest Ajustment',0) 		    
												
							set @insertedTransaction = (select scope_identity())
							select @newItem = (SELECT * FROM [billing].[Transactions] 
							where transactionId =@insertedTransaction FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)

							insert [audit].[AuditLog]
							(ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
							select @insertedTransaction, 'billing_Transaction', 'Added','',@newItem,GETDATE(),'system@randmutual.co.za',''
					
						end
				end--@balance =@transactionAmount
			
			end ---@transactionId > 0
		set @currentId = (select top 1 declarationId from @declarations)
		delete from @declarations where declarationId = @currentId
		end--while
END