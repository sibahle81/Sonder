CREATE   PROCEDURE [billing].[ExceptionAllocationFile] 
  @bulkAllocationFileId int     
AS BEGIN  
        declare  @importedAllocations table(
       [Id] [int],
       [BankAccountNumber] [nvarchar](500) NULL,
       [UserReference] [nvarchar](500) NULL,
       [StatementReference] [nvarchar](500) NULL,
       [TransactionDate] [nvarchar](50) NULL,
       [Amount] [nvarchar](500) NULL,
       [Status] [nvarchar](500) NULL,
       [UserReference2] [nvarchar](500) NULL,
       [ReferenceType] [nvarchar](500) NULL,
       [Allocatable] [nvarchar](500) NULL,
       [AllocateTo] [nvarchar](500) NULL

	  ,[BulkAllocationFileId] INT
      ,[Error] [nvarchar](500)
      ,[IsDeleted] BIT
      ,[LineProcessingStatusId] INT)

    
	   declare @manualallocationId int = (select Max(BulkAllocationFileId) from [Load].[BulkAllocationFile])
	   
	   --insert into  [Load].[BulkManualAllocation] (bankAccountNumber ,userReference,statementReference,transactionDate,amount,userReference2,referenceType,allocatable,allocateTo,bulkAllocationFileId,error,isDeleted,lineProcessingStatusId)
    --   select bankAccountNumber ,userReference,statementReference,transactionDate,amount,userReference2,referenceType,allocatable,allocateTo,bulkAllocationFileId,error,isDeleted,lineProcessingStatusId 
	   --from [Load].[BulkManualAllocation] where [BulkAllocationFileId] =@bulkAllocationFileId

	     insert into @importedAllocations
          select  * from [Load].[BulkManualAllocation] where [BulkAllocationFileId] =@bulkAllocationFileId

	   declare @fileTotal decimal(18,2)


       declare @bankstatementEntry table(bankstatementEntryId int, statementDate datetime,nettamount nvarchar(200), statementnumber nvarchar(200), statementlineNumber nvarchar(200), userreference2   nvarchar(500) )
       declare @policyDetails table (roleplayerId int)
      
       
       declare @current int = (select top 1 id from @importedAllocations)
       while (select count(id) from @importedAllocations) > 0
       begin--while
       BEGIN TRY  
              DECLARE @oldItem varchar(max), @newItem varchar(max)
              declare @reftype nvarchar(200) = (select ReferenceType from @importedAllocations where id= @current)
              declare @allocateTo nvarchar(200) = (select AllocateTo from @importedAllocations where id= @current)
              declare @userRef2 nvarchar(200) = (select UserReference2 from @importedAllocations where id= @current)
              declare @amount nvarchar(200) = (select Replace(Amount,' ','') from @importedAllocations where id= @current)
              declare @rmaRef nvarchar(200) = (select StatementReference from @importedAllocations where id= @current)
              declare @bankAccount nvarchar(200) = (select BankAccountNumber from @importedAllocations where id= @current)
              declare @transactionDate nvarchar(200) = (select transactiondate from @importedAllocations where id= @current)
              declare @userRef1 nvarchar(200) = (select UserReference from @importedAllocations where id= @current)

              declare @UnallocatedPaymentId int;

              insert into @policyDetails
                           select pp.PolicyPayeeId from policy.Policy pp
                           where (ClientReference= @userRef2
                           or PolicyNumber = @userRef2 )                          
                            union 
                            select  pp.PolicyPayeeId from policy.Policy pp
                           where (ClientReference= @allocateTo
                           or PolicyNumber = @allocateTo )                        
                           union
                           select cf.RolePlayerId
                           from  client.FinPayee cf 
                           where  cf.FinPayeNumber= @allocateTo and cf.isdeleted =0


          
                     
                     declare @roleplayerId int = (select top 1 roleplayerId from @policyDetails) 
                     declare @splitRef table(id int identity, value nvarchar(10)) 
                     declare @splitRef1 table(value nvarchar(10)) 
                     

                     insert into  @splitRef1 (value)
                     Select VALUE FROM STRING_SPLIT(@rmaRef, ' ')

                     insert into  @splitRef (value)
                     Select VALUE FROM STRING_SPLIT((select top 1 * from @splitRef1 ), '/')                  
              
              declare @statementNumber nvarchar(10) 
              declare @statementLineNumber nvarchar(10)
              select top 1 @statementNumber =[value] from @splitRef order by id asc
              select top 1 @statementLineNumber =[value] from @splitRef order by id desc

              declare @amount2 decimal(18,2) = CAST(Replace( @amount,',','.') AS decimal(18,2)) 
              declare @nettamount bigint = case when  @amount2 > 0 then  (@amount2 *100) else (@amount2 *-1 * 100) end 
                           
--for bankstatment entry use column B ---userReference
              insert into @bankstatementEntry(bankstatementEntryId,statementDate,nettamount,statementnumber,statementlineNumber, userreference2)
              select  bankstatementEntryId,StatementDate, NettAmount, StatementNumber,StatementLineNumber,userreference2 from finance.BankStatementEntry
              where StatementNumber = @statementNumber and StatementLineNumber = @statementLineNumber
              and StatementDate = @transactionDate 
			   and UserReference = @userRef1
			   --and BankAccountNumber=concat('00000',@bankAccount)
                                  
         
              if (select count(bankstatementEntryId) from @bankstatementEntry ) = 1
              begin
              declare @entryid int 
              declare @entryNettAmount bigint 

              select top 1  @entryid =  bankstatementEntryId from @bankstatementEntry            
              select top 1  @entryNettAmount =  nettamount from @bankstatementEntry              
             

              ---single entry found
       
                     DECLARE @insertTrans INT
                     DECLARE @transactions table (transactionId int, bankstatemententryid int, roleplayerid int, amount decimal(18,2),transactiondate datetime
                           ,formateddate nvarchar(20), refundref nvarchar(20), rmaref nvarchar(20), ownerdetails nvarchar(200)
                           )
                     DECLARE @transType nvarchar(20)

					 	                     insert into [billing].[Transactions] (
                     [RolePlayerId], bankstatemententryid
                     ,[TransactionTypeLinkId]
                     ,[Amount]
                     ,[TransactionDate]
                     ,[TransactionTypeId]
                     ,[CreatedDate]
                     ,[ModifiedDate]
                     ,[CreatedBy]
                     ,[ModifiedBy], RmaReference, IsLogged)
                values (@roleplayerId, @entryid ,'1',(@amount2*-1),getdate(),'1',       GETDATE(),       GETDATE(),    'bulkmanualallocation',    'bulkmanualallocation', @rmaRef,1)
              
                     SELECT @insertTrans = SCOPE_IDENTITY()
              
                     select TOP 1 @UnallocatedPaymentId = UnallocatedPaymentId FROM billing.UnallocatedPayment
                     where BankStatementEntryId = @entryid
                     ORDER BY UnallocatedPaymentId DESC
                     
                     --1. Get old Item, e.g
                     select @oldItem = (SELECT * FROM billing.UnallocatedPayment 
                     where UnallocatedPaymentId = @UnallocatedPaymentId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)

                     update  billing.UnallocatedPayment set  modifiedby = 'bulkmanualallocation', modifieddate =GETDATE(), UnallocatedAmount = UnallocatedAmount +( @amount2 *-1 )
                     where UnallocatedPaymentId = @UnallocatedPaymentId     

                     select @newItem = (SELECT * FROM billing.UnallocatedPayment 
                     where UnallocatedPaymentId = @UnallocatedPaymentId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
					 	 
						 update [Load].[BulkManualAllocation] set LineProcessingStatusId =1
                           where id= @current

                     insert [audit].[AuditLog]
                     (ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
                     select @UnallocatedPaymentId, 'billing_UnallocatedPayment', 'Modified',@oldItem,@newItem,GETDATE(),'bulkmanualallocation',''
                 

   --           if @reftype not like '%Refund%' or @reftype is NULL
   --           begin--indiv

   --                  if @amount2 > 0 
   --                  begin
   --                  set @transType ='Receipts'

			--		  IF NOT EXISTS (SELECT * FROM [billing].[Transactions]
   --                WHERE RolePlayerId =@roleplayerId
				
			--	   and amount =@amount2
			--	   )
   --BEGIN
   --        insert into [billing].[Transactions] (
   --                  [RolePlayerId], bankstatemententryid
   --                  ,[TransactionTypeLinkId]
   --                  ,[Amount]
   --                  ,[TransactionDate]
   --                  ,[TransactionTypeId]
   --                  ,[CreatedDate]
   --                  ,[ModifiedDate]
   --                  ,[CreatedBy]
   --                  ,[ModifiedBy], RmaReference)
   --                  values (@roleplayerId, @entryid ,'2',@amount2,getdate(),'3',  GETDATE(),       GETDATE(),    'bulkmanualallocation',    'bulkmanualallocation', @rmaRef)
   --                  SELECT @insertTrans = SCOPE_IDENTITY()
   --END 
   --else
   --begin
   --                       declare @MinDate nvarchar(200) =  (select Min(TransactionDate)  FROM [AZP-MCC_Prod_Copy].[billing].[Transactions] where RolePlayerId =  @roleplayerId  and Amount = @amount2 and modifiedby = 'bulkmanualallocation')
   --                        update [billing].[Transactions]
			--			   set  [IsDeleted] = 1,
   --                               [DeletedReasonId] = 1
			--			   where TransactionDate =@MinDate   and modifiedby = 'bulkmanualallocation'
						   
			    
              
   --                        delete  from @importedAllocations where id =@current          
   --                  delete from  @policyDetails
   --                  delete from  @splitRef1
   --                  delete from  @splitRef
   --                  delete from @bankstatementEntry
   --                  set    @current  = (select top 1 id from @importedAllocations)
   --                  continue;
   --       end 
                   
                    


   --                        end   
                    
   --                  begin
   --                  set @transType ='Receipt'

			--		   IF NOT EXISTS (SELECT * FROM [billing].[Transactions]
   --                WHERE RolePlayerId =@roleplayerId
   --                AND BankStatementEntryId = @entryid 
			--	   and amount =@amount2
			--	   )
   --BEGIN
         
   --                  insert into [billing].[Transactions] (
   --                  [RolePlayerId], bankstatemententryid
   --                  ,[TransactionTypeLinkId]
   --                  ,[Amount]
   --                  ,[TransactionDate]
   --                  ,[TransactionTypeId]
   --                  ,[CreatedDate]
   --                  ,[ModifiedDate]
   --                  ,[CreatedBy]
   --                  ,[ModifiedBy], RmaReference, IsLogged)
   --             values (@roleplayerId, @entryid ,'1',(@amount2*-1),getdate(),'1',       GETDATE(),       GETDATE(),    'bulkmanualallocation',    'bulkmanualallocation', @rmaRef,1)
              
   --                  SELECT @insertTrans = SCOPE_IDENTITY()
   --END 
   --else
   --begin
   --                      declare @MaxDate nvarchar(200) =  (select Min(TransactionDate)  FROM [AZP-MCC_Prod_Copy].[billing].[Transactions] where RolePlayerId =  @roleplayerId and BankStatementEntryId = @entryid and Amount = @amount2 and modifiedby = 'bulkmanualallocation')
   --                        update [billing].[Transactions]
			--			   set  [IsDeleted] = 1,
   --                               [DeletedReasonId] = 1
			--			   where TransactionDate =@MaxDate  and modifiedby = 'bulkmanualallocation'
						   
			
              
   --                       delete  from @importedAllocations where id =@current          
   --                  delete from  @policyDetails
   --                  delete from  @splitRef1
   --                  delete from  @splitRef
   --                  delete from @bankstatementEntry
   --                  set    @current  = (select top 1 id from @importedAllocations)
   --                  continue;
   -- end 

   --                  end                        
   --           end--indiv
              
              end                  
                      
                 set  @fileTotal  = (select sum(cast(Replace( @amount,',','.')  as decimal)) from @importedAllocations)

              END TRY  
              BEGIN CATCH 

                           declare @error nvarchar(max) = (SELECT ERROR_MESSAGE() AS ErrorMessage)  

                           update [Load].[BulkManualAllocation] set Error =@error
						   ,LineProcessingStatusId =2
                           where id= @current
              
                     --      delete  from @importedAllocations where id =@current          
                           delete from  @policyDetails
                           delete from  @splitRef1
                           delete from  @splitRef
                           delete from @bankstatementEntry
                           delete from @transactions
                           set    @current  = (select top 1 id from @importedAllocations)
						   continue;
              END CATCH  


              -----no error-----
              update [Load].[BulkManualAllocation] set Error =@error
              where id= @current
              
          --    delete  from @importedAllocations where id =@current          
              delete from  @policyDetails
              delete from  @splitRef1
              delete from  @splitRef
              delete from @bankstatementEntry
              delete from @transactions
              set    @current  = (select top 1 id from @importedAllocations)
                     -----no error-----
       end--while    

    --   delete from [Load].[BulkManualAllocation] where [BulkAllocationFileId] = @bulkAllocationFileId
    --   and error is null

	   --update [Load].BulkAllocationFile set FileProcessingStatusId =2, total =@fileTotal
	   -- where [BulkAllocationFileId] = @bulkAllocationFileId

		select * from @importedAllocations

END