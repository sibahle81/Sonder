CREATE   PROCEDURE [billing].[BulkAllocateSmallFile] 
  @bulkAllocationFileId int     
AS BEGIN  
       declare  @importedAllocations table(
       [Id] [int],
       [BankAccountNumber] [nvarchar](50) NULL,
       [UserReference] [nvarchar](200) NULL,
       [StatementReference] [nvarchar](200) NULL,
       [TransactionDate] [nvarchar](50) NULL,
       [Amount] [nvarchar](50) NULL,
       [Status] [nvarchar](50) NULL,
       [UserReference2] [nvarchar](200) NULL,
       [ReferenceType] [nvarchar](100) NULL,
       [Allocatable] [nvarchar](10) NULL,
       [AllocateTo] [nvarchar](200) NULL,
	    BulkAllocationFileId int,
      error [nvarchar](500) NULL, [IsDeleted] bit NULL, LineProcessingStatusId int NULL)

       insert into @importedAllocations
       select  * from [Load].[BulkManualAllocation]
	    where Error is null and BulkAllocationFileId = @bulkAllocationFileId

		declare @errorsCount int =0
       declare @bankstatementEntry table(bankstatementEntryId int, statementDate datetime,nettamount nvarchar(200), statementnumber nvarchar(200), statementlineNumber nvarchar(200), userreference2   nvarchar(500) )
       declare @policyDetails table (roleplayerId int)
       declare @postedGl table (transactionId int)
       
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
                           where  cf.FinPayeNumber= @allocateTo


                           -----no  roleplayers found---
                           if (select count(*) from @policyDetails) = 0
                           begin
                           update [Load].[BulkManualAllocation] set Error = 'NO roleplayers found matching allocateto/userref2',LineProcessingStatusId =2
                           where id= @current 
						   select @errorsCount =@errorsCount +1;        
              
                           delete  from @importedAllocations where id =@current   
                           delete from @policyDetails
       
                           set    @current  = (select top 1 id from @importedAllocations)

                           Continue;
                           end 
                           -----end no  roleplayers found---

                           -----many roleplayers found---
                           if (select  count(distinct roleplayerId) from @policyDetails) > 1
                           begin
                           update [Load].[BulkManualAllocation] set Error = 'Multiple roleplayers found matching allocateto/userref2',LineProcessingStatusId =2
                           where id= @current   
						   select @errorsCount =@errorsCount +1;      
              
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
                           

              insert into @bankstatementEntry(bankstatementEntryId,statementDate,nettamount,statementnumber,statementlineNumber, userreference2)
              select  bankstatementEntryId,StatementDate, NettAmount, StatementNumber,StatementLineNumber,userreference2 from finance.BankStatementEntry
              where StatementNumber = @statementNumber and StatementLineNumber = @statementLineNumber
              and StatementDate = @transactionDate 
                                  
              if (select count(bankstatementEntryId) from @bankstatementEntry ) = 0
              begin

              update [Load].[BulkManualAllocation] set Error ='NO Matching bank statemententry id founds',LineProcessingStatusId =2
              where id= @current
			  select @errorsCount =@errorsCount +1;
			    Continue;
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

              select top 1  @entryid =  bankstatementEntryId from @bankstatementEntry            
              select top 1  @entryNettAmount =  nettamount from @bankstatementEntry              
              ----amount allocated > then bank amount-----
              if (@entryNettAmount < @nettamount)
              begin
              update [Load].[BulkManualAllocation] set Error = concat('Allocation Amount Greater than bankstatement amount: BankEntryid = ',@entryid),LineProcessingStatusId =2
                     where id= @current
					 select @errorsCount =@errorsCount +1;

                     delete  from @importedAllocations where id =@current          
                     delete from  @policyDetails
                     delete from  @splitRef1
                     delete from  @splitRef
                     delete from @bankstatementEntry
                     set    @current  = (select top 1 id from @importedAllocations)
                     continue;
              end
              ----end amount allocated > then bank amount-----

              ---single entry found
       
                     DECLARE @insertTrans INT
                     DECLARE @transactions table (transactionId int, bankstatemententryid int, roleplayerid int, amount decimal(18,2),transactiondate datetime
                           ,formateddate nvarchar(20), refundref nvarchar(20), rmaref nvarchar(20), ownerdetails nvarchar(200)
                           )
                     DECLARE @transType nvarchar(20)

              if @reftype not like '%Refund%'
              begin--indiv

                     if @amount2 > 0 
                     begin
                     set @transType ='Receipts'

                     insert into [billing].[Transactions] (
                     [RolePlayerId], bankstatemententryid
                     ,[TransactionTypeLinkId]
                     ,[Amount]
                     ,[TransactionDate]
                     ,[TransactionTypeId]
                     ,[CreatedDate]
                     ,[ModifiedDate]
                     ,[CreatedBy]
                     ,[ModifiedBy], RmaReference)
                     values (@roleplayerId, @entryid ,'2',@amount2,getdate(),'3',  GETDATE(),       GETDATE(),    'bulkmanualallocation',    'bulkmanualallocation', @rmaRef)
                     SELECT @insertTrans = SCOPE_IDENTITY()

                     ---audit log and update unallocated
                     if @insertTrans > 0
                     begin

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

                     insert [audit].[AuditLog]
                     (ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
                     select @UnallocatedPaymentId, 'billing_UnallocatedPayment', 'Modified',@oldItem,@newItem,GETDATE(),'bulkmanualallocation',''
					                      
                           end    ---end audit log and update unallocated
                     end
                     else
                     begin
                     set @transType ='Receipt Reversal'

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
                values (@roleplayerId, @entryid ,'1',@amount2,getdate(),'1',       GETDATE(),       GETDATE(),    'bulkmanualallocation',    'bulkmanualallocation', @rmaRef,1)
              
                     SELECT @insertTrans = SCOPE_IDENTITY()
              ---audit log and update unallocated
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

                     insert [audit].[AuditLog]
                     (ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
                     select @UnallocatedPaymentId, 'billing_UnallocatedPayment', 'Modified',@oldItem,@newItem,GETDATE(),'bulkmanualallocation',''
					                      
                           end    ---end audit log and update unallocated
                     end                        
              end--indiv

              if @reftype like '%Refund%'
                     begin--refund

                     set @transType ='Refund'

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
                           values (@roleplayerId, @entryid ,'1',@amount2,getdate(),'8',  GETDATE(),       GETDATE(),    'bulkmanualallocation',    'bulkmanualallocation', @rmaRef,1)
                            
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

                     insert [audit].[AuditLog]
                     (ItemId, ItemType, [Action], OldItem, NewItem, [Date], Username, CorrelationToken)
                     select @UnallocatedPaymentId, 'billing_UnallocatedPayment', 'Modified',@oldItem,@newItem,GETDATE(),'bulkmanualallocation',''

                                                       
                           insert into @transactions
                           select t.transactionId, t.bankstatemententryid, t.roleplayerid, t.amount,t.transactiondate, 
                            (SELECT FORMAT (t.transactiondate, 'dd/MM/yyyy')) AS formateddate,
                           case when  cr.RolePlayerIdentificationTypeId = 2 then concat( 'RFGRP-', (SELECT FORMAT (t.transactiondate, 'ddMMyyyy'))) else concat( 'RFIND-', (SELECT FORMAT (t.transactiondate, 'ddMMyyyy'))) end as refundref,
                           t.RmaReference,
                           cr.DisplayName

                           from billing.Transactions t
                                  inner join client.RolePlayer cr on cr.RolePlayerId = t.RolePlayerId
                                  where TransactionId = @insertTrans

                                  insert into billing.AbilityTransactionsAudit (Reference,TransactionId,Item,IsActive,IsDeleted,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate, OnwerDetails, amount, ItemReference,IsProcessed)
                                  select refundref, transactionId, @transType,'1','0','bulkmanualallocation',GETDATE(),'bulkmanualallocation',GETDATE(), ownerdetails , amount, rmaref,0
                                  from @transactions                                  
                                                         
                     end--refund                
              end                  
              
              
              ---bankentries still > 1   
              if (select count(bankstatementEntryId) from @bankstatementEntry ) > 1
              begin         
              declare @multipleIds nvarchar(200)= (select   STRING_AGG(bankstatementEntryId, ', ') from @bankstatementEntry)
              update [Load].[BulkManualAllocation] set Error =CONCAT( 'multiple bank statemententry ids found:',@multipleIds),LineProcessingStatusId =2
              where id= @current
			  select @errorsCount =@errorsCount +1;
			    Continue;
              end
              ---end bankentries still > 1

              ---bankentries =0 after clean up
              --eg we found many entries but then we couldnt match to the correct userref2
              if (select count(bankstatementEntryId) from @bankstatementEntry ) = 0
              begin
              update [Load].[BulkManualAllocation] set Error ='NO Matching bank statemententry id founds',LineProcessingStatusId =2
              where id= @current
			  select @errorsCount =@errorsCount +1;
			    Continue;
              end
              ---bankentries =0          
                     
              END TRY  
              BEGIN CATCH
                           declare @error nvarchar(max) = (SELECT ERROR_MESSAGE() AS ErrorMessage)  

                           update [Load].[BulkManualAllocation] set Error =@error
                           where id= @current
              
                           delete  from @importedAllocations where id =@current          
                           delete from  @policyDetails
                           delete from  @splitRef1
                           delete from  @splitRef
                           delete from @bankstatementEntry
                           delete from @transactions
                           set    @current  = (select top 1 id from @importedAllocations)
						     Continue;
              END CATCH  


              -----no error-----
              update [Load].[BulkManualAllocation] set LineProcessingStatusId =1, error=NULL
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
	  
      if(select @errorsCount) = 0
	   begin
	   update [Load].[BulkAllocationFile] set FileProcessingStatusId =2
	   where [BulkAllocationFileId] = @BulkAllocationFileId
	   end
	    if(select @errorsCount) > 0
	   begin
	     update [Load].[BulkAllocationFile] set FileProcessingStatusId =3
	   where [BulkAllocationFileId] = @BulkAllocationFileId
	   end	   
END