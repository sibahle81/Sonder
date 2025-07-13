CREATE   PROCEDURE [billing].[BulkAllocateStagedAllocations]  --141
       @fileId int
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
      ,[LineProcessingStatusId] INT
	  ,[PeriodId] INT )

       insert into @importedAllocations
       select  * from [Load].[BulkManualAllocation] where [BulkAllocationFileId] =@fileId

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
			  declare @periodId int = (select top 1 Id from [common].[Period] where Status = 'Current')

			  

              declare @UnallocatedPaymentId int;

              insert into @policyDetails
			   select  pp.PolicyPayeeId from policy.Policy pp
			   where (ClientReference= @allocateTo
			   or PolicyNumber = @allocateTo )                        
			   union
			   select cf.RolePlayerId
			   from  client.FinPayee cf 
			   where  cf.FinPayeNumber= @allocateTo  and cf.isdeleted =0
				union
			   select  c.RolePlayerId   from client.Company c where c.Name = @allocateTo and c.isdeleted=0
			   union
			   select p.PolicyPayeeId from billing.Invoice i 
			   inner join policy.policy p on i.PolicyId = p.PolicyId
			   where i.InvoiceNumber = @allocateTo and i.isdeleted=0
				union					   
			   select pp.PolicyPayeeId from policy.Policy pp
			   where (ClientReference= @userRef2 
			   or PolicyNumber = @userRef2 ) and pp.isdeleted=0  


                           -----no  roleplayers found---
                           if (select count(*) from @policyDetails) = 0
                           begin
							   update [Load].[BulkManualAllocation] set Error = 'No Debtors Found Matching AllocateTo/UserRef2'
							  ,LineProcessingStatusId =5
							   where id= @current         
              
							   delete  from @importedAllocations where id =@current   
							   delete from @policyDetails
       
								set    @current  = (select top 1 id from @importedAllocations)

								Continue;
                           end 
                           -----end no  roleplayers found---

                           -----many roleplayers found---
                           if (select  count(distinct roleplayerId) from @policyDetails) > 1
                           begin
							   update [Load].[BulkManualAllocation] set Error = 'Multiple Debtors Found Matching AllocateTo/UserRef2'
							  ,LineProcessingStatusId =5
							   where id= @current         
				  
							   delete  from @importedAllocations where id =@current
							   delete from @policyDetails        
		   
							   set    @current  = (select top 1 id from @importedAllocations)

							   Continue;
                           end 

                           -----end many roleplayers found---
                     
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
                                  
              if (select count(bankstatementEntryId) from @bankstatementEntry ) = 0
              begin

				  update [Load].[BulkManualAllocation] set Error ='No Matching Bank Statement Entry Found'
				 ,LineProcessingStatusId =5
				  where id= @current
				 delete  from @importedAllocations where id =@current          
						 delete from  @policyDetails
						 delete from  @splitRef1
						 delete from  @splitRef
						 delete from @bankstatementEntry
						 set    @current  = (select top 1 id from @importedAllocations)
						 continue;
			 
			  end

              if (select count(bankstatementEntryId) from @bankstatementEntry ) > 1
                     begin
                     --attempt to do clean up                               
                     delete from @bankstatementEntry where UserReference2   <> @userRef2
                     end    
              

              if (select count(bankstatementEntryId) from @bankstatementEntry ) = 1
              begin
				  declare @entryid int 
				  declare @entryNettAmount bigint 
				  declare @UnallocatedAmount decimal(18,2)

				  select top 1  @entryid =  bankstatementEntryId from @bankstatementEntry            
				  select top 1  @entryNettAmount =  nettamount from @bankstatementEntry              
				  ----amount allocated > then bank amount-----
				  if (@entryNettAmount < @nettamount)
				  begin
				  update [Load].[BulkManualAllocation] set Error = 'Allocation Amount Greater Than Bankstatement Amount'
						 ,LineProcessingStatusId =5
						 where id= @current
						 delete  from @importedAllocations where id =@current          
						 delete from  @policyDetails
						 delete from  @splitRef1
						 delete from  @splitRef
						 delete from @bankstatementEntry
						 set    @current  = (select top 1 id from @importedAllocations)
						 continue;
				  end
              ----end amount allocated > then bank amount-----


			  --amount more than unallocated

			    select TOP 1 @UnallocatedAmount = UnallocatedAmount  FROM billing.UnallocatedPayment
                where BankStatementEntryId = @entryid
                ORDER BY UnallocatedPaymentId DESC

			    if ((@UnallocatedAmount < @amount2)  )
				begin
					  update [Load].[BulkManualAllocation] set Error = 'Allocation Amount Greater Than Payment UnAllocated Amount'
                     ,LineProcessingStatusId =5
					 where id= @current
                     delete  from @importedAllocations where id =@current          
                     delete from  @policyDetails
                     delete from  @splitRef1
                     delete from  @splitRef
                     delete from @bankstatementEntry
                     set    @current  = (select top 1 id from @importedAllocations)
                     continue;
				end

			  --amount more than unallocated


              ---single entry found
       
                     DECLARE @insertTrans INT
                     DECLARE @transactions table (transactionId int, bankstatemententryid int, roleplayerid int, amount decimal(18,2),transactiondate datetime
                           ,formateddate nvarchar(20), refundref nvarchar(20), rmaref nvarchar(20), ownerdetails nvarchar(200)
                           )
                     DECLARE @transType nvarchar(20)

              if @reftype not like '%Refund%' or @reftype is NULL
              begin--indiv

                     if @amount2 > 0 
                     begin
                     set @transType ='Receipts'

				IF NOT EXISTS (SELECT * FROM [billing].[Transactions]
                   WHERE RolePlayerId =@roleplayerId
                   AND BankStatementEntryId = @entryid 
                   AND [TransactionTypeLinkId] = 2
				   and [TransactionTypeId]=3
				   and amount =@amount2
				   )
				BEGIN
					insert into [billing].[Transactions] (
                     [RolePlayerId], bankstatemententryid
                     ,[TransactionTypeLinkId]
                     ,[Amount]
                     ,[TransactionDate]
                     ,[TransactionTypeId]
                     ,[CreatedDate]
                     ,[ModifiedDate]
                     ,[CreatedBy]
                     ,[ModifiedBy], RmaReference, PeriodId)
                     values (@roleplayerId, @entryid ,'2',@amount2,getdate(),'3',  GETDATE(),       GETDATE(),    'bulkmanualallocation',    'bulkmanualallocation', @rmaRef, @periodId)
                     SELECT @insertTrans = SCOPE_IDENTITY()
					 
					--Update BankStatementEntry
					update [finance].[BankStatementEntry] set Proccessed = 1, ModifiedBy = 'bulkmanualallocation', ModifiedDate = getdate() where BankStatementEntryId = @entryid
				END 
			else
			begin
                           update [Load].[BulkManualAllocation] set Error = 'Duplicate Allocation'
                           ,LineProcessingStatusId =5
						   where id= @current         
              
                           delete  from @importedAllocations where id =@current          
						 delete from  @policyDetails
						 delete from  @splitRef1
						 delete from  @splitRef
						 delete from @bankstatementEntry
						 set    @current  = (select top 1 id from @importedAllocations)
						 continue;
             end 
                   
                     if @insertTrans > 0
                     begin

						 select TOP 1 @UnallocatedPaymentId = UnallocatedPaymentId, @UnallocatedAmount =UnallocatedAmount FROM billing.UnallocatedPayment
						 where BankStatementEntryId = @entryid
						 ORDER BY UnallocatedPaymentId DESC
						 
						 --1. Get old Item, e.g
						 select @oldItem = (SELECT * FROM billing.UnallocatedPayment 
						 where UnallocatedPaymentId = @UnallocatedPaymentId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)

						 update  billing.UnallocatedPayment set  modifiedby = 'bulkmanualallocation', modifieddate =GETDATE(), UnallocatedAmount = UnallocatedAmount +( @amount2 *-1 )
						 where UnallocatedPaymentId = @UnallocatedPaymentId     

						 if( @UnallocatedAmount +( @amount2 *-1 ) = 0 )
						 begin
							update  billing.UnallocatedPayment set  AllocationProgressStatusId = 3 where UnallocatedPaymentId = @UnallocatedPaymentId   
						 end


                     select @newItem = (SELECT * FROM billing.UnallocatedPayment 
                     where UnallocatedPaymentId = @UnallocatedPaymentId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
					 	 
						 update [Load].[BulkManualAllocation] set LineProcessingStatusId =6
                           where id= @current

				    --TO BE ENABLED IN PROD ENV
                    -- insert [audit].[AuditLog]
                    -- (ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
                    -- select @UnallocatedPaymentId, 'billing_UnallocatedPayment', 'Modified',@oldItem,@newItem,GETDATE(),'bulkmanualallocation',''

                           end   
                     end
                     else
                     begin
                     set @transType ='Receipt Reversal'

					   IF NOT EXISTS (SELECT * FROM [billing].[Transactions]
                   WHERE RolePlayerId =@roleplayerId
                   AND BankStatementEntryId = @entryid 
                   AND [TransactionTypeLinkId] = 1
				   and [TransactionTypeId]=1
				   and amount =@amount2
				   )
					BEGIN
         
                     insert into [billing].[Transactions] (
                     [RolePlayerId], bankstatemententryid
                     ,[TransactionTypeLinkId]
                     ,[Amount]
                     ,[TransactionDate]
                     ,[TransactionTypeId]
                     ,[CreatedDate]
                     ,[ModifiedDate]
                     ,[CreatedBy]
                     ,[ModifiedBy], RmaReference, IsLogged,
					  [PeriodId])
                values (@roleplayerId, @entryid ,'1',(@amount2*-1),getdate(),'1',       GETDATE(),       GETDATE(),    'bulkmanualallocation',    'bulkmanualallocation', @rmaRef,1,@periodId)
              
                     SELECT @insertTrans = SCOPE_IDENTITY()
					 
						--Update BankStatementEntry
						update [finance].[BankStatementEntry] set Proccessed = 1, ModifiedBy = 'bulkmanualallocation', ModifiedDate = getdate() where BankStatementEntryId = @entryid
					   END 
					   else
					   begin
                            update [Load].[BulkManualAllocation] set Error = 'Duplicate Allocation'
                           ,LineProcessingStatusId =5
						   where id= @current         
              
                          delete  from @importedAllocations where id =@current          
                     delete from  @policyDetails
                     delete from  @splitRef1
                     delete from  @splitRef
                     delete from @bankstatementEntry
                     set    @current  = (select top 1 id from @importedAllocations)
                     continue;
                           end 

              
                     if @insertTrans > 0
                     begin
                     --reverse sign of amount to cause a reduction int unallocted
                     
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

					 	 update [Load].[BulkManualAllocation] set LineProcessingStatusId =6
                           where id= @current

					--TO BE ENABLED IN PROD ENV
                   ---  insert [audit].[AuditLog]
                   ---  (ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
                   --  select @UnallocatedPaymentId, 'billing_UnallocatedPayment', 'Modified',@oldItem,@newItem,GETDATE(),'bulkmanualallocation',''

                           end   
                     end                        
              end--indiv

              if @reftype like '%Refund%'  
                     begin--refund

                     set @transType ='Refund'                          

						    IF NOT EXISTS (SELECT * FROM [billing].[Transactions]
                   WHERE RolePlayerId =@roleplayerId
                   AND BankStatementEntryId = @entryid 
                   AND [TransactionTypeLinkId] = 1
				   and [TransactionTypeId]=8
				   and amount =@amount2
				   )
				BEGIN
         
                     insert into [billing].[Transactions] (
                                  [RolePlayerId], bankstatemententryid
                                  ,[TransactionTypeLinkId]
                                  ,[Amount]
                                  ,[TransactionDate]
                                  ,[TransactionTypeId]
                                  ,[CreatedDate]
                                  ,[ModifiedDate]
                                  ,[CreatedBy]
                                  ,[ModifiedBy], RmaReference, IsLogged, PeriodId)
                           values (@roleplayerId, @entryid ,'1',(@amount2*-1),getdate(),'8',  GETDATE(),       GETDATE(),    'bulkmanualallocation',    'bulkmanualallocation', @rmaRef,1, @periodId)
                            
                           SELECT @insertTrans = SCOPE_IDENTITY()
						   
							--Update BankStatementEntry
							update [finance].[BankStatementEntry] set Proccessed = 1, ModifiedBy = 'bulkmanualallocation', ModifiedDate = getdate() where BankStatementEntryId = @entryid
					   END 
					   else
					   begin
                           update [Load].[BulkManualAllocation] set Error = 'Duplicate Allocation'
						   ,LineProcessingStatusId =5                
						   where id= @current         
              
                         delete  from @importedAllocations where id =@current          
                     delete from  @policyDetails
                     delete from  @splitRef1
                     delete from  @splitRef
                     delete from @bankstatementEntry
                     set    @current  = (select top 1 id from @importedAllocations)
                     continue;
                           end 

                     
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

					 update [Load].[BulkManualAllocation] set LineProcessingStatusId =6
                           where id= @current
 
				   --TO BE ENABLED IN PROD ENV
                   -- insert [audit].[AuditLog]
                   --  (ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
                   --  select @UnallocatedPaymentId, 'billing_UnallocatedPayment', 'Modified',@oldItem,@newItem,GETDATE(),'bulkmanualallocation',''
					                                                   
                     end--refund                
              end                  
              
              
              ---bankentries still > 1   
              if (select count(bankstatementEntryId) from @bankstatementEntry ) > 1
              begin         
              declare @multipleIds nvarchar(200)= (select   STRING_AGG(bankstatementEntryId, ', ') from @bankstatementEntry)
              update [Load].[BulkManualAllocation] set Error ='Multiple Bank Statement Entries Found'
			  ,LineProcessingStatusId =5
              where id= @current
			  delete  from @importedAllocations where id =@current          
                     delete from  @policyDetails
                     delete from  @splitRef1
                     delete from  @splitRef
                     delete from @bankstatementEntry
                     set    @current  = (select top 1 id from @importedAllocations)
                     continue;

              end
              ---end bankentries still > 1

              ---bankentries =0 after clean up
              --eg we found many entries but then we couldnt match to the correct userref2
              if (select count(bankstatementEntryId) from @bankstatementEntry ) = 0
              begin
              update [Load].[BulkManualAllocation] set Error ='No Matching Bank Statemententry Found',LineProcessingStatusId =5
              where id= @current
			  delete  from @importedAllocations where id =@current          
                     delete from  @policyDetails
                     delete from  @splitRef1
                     delete from  @splitRef
                     delete from @bankstatementEntry
                     set    @current  = (select top 1 id from @importedAllocations)
                     continue;
              end
              ---bankentries =0          
                 set  @fileTotal  = (select sum(cast(Replace( @amount,',','.')  as decimal)) from @importedAllocations)

              END TRY  
              BEGIN CATCH 

                           declare @error nvarchar(max) = (SELECT ERROR_MESSAGE() AS ErrorMessage)  

                           update [Load].[BulkManualAllocation] set Error =@error
						   ,LineProcessingStatusId =5
                           where id= @current
              
                           delete  from @importedAllocations where id =@current          
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
              
              delete  from @importedAllocations where id =@current          
              delete from  @policyDetails
              delete from  @splitRef1
              delete from  @splitRef
              delete from @bankstatementEntry
              delete from @transactions
              set    @current  = (select top 1 id from @importedAllocations)
                     -----no error-----
       end--while    

       --delete from [Load].[BulkManualAllocation] where [BulkAllocationFileId] = @fileId
       --and error is null

	   update [Load].BulkAllocationFile set FileProcessingStatusId =2, total =@fileTotal
	    where [BulkAllocationFileId] = @fileId

END