CREATE   PROCEDURE [payment].[PaymentAuditLog] 
       @StartDate As Date,
       @EndDate AS Date

AS
BEGIN
/*
exec [payment].[PaymentAuditLog] @StartDate = '2020-01-01', @EndDate = '2022-01-31'
*/

Declare  @PaymentResults Table(
         Id int identity(1,1),
         ItemId int,
         PolicyId int,
         Username varchar(Max),
         PaymentStatus      varchar(250),
         PaymentType  varchar(250),
         Amount money,
         Reference varchar(250),
         ClaimNumber varchar(250),
         Product varchar(100),
         Payee varchar(100),
         AccountNo varchar(50),
         ApprovedDate datetime,
         AuthorisedDate datetime,
         PendingDate datetime,
         SubmissionDate datetime,
         paymentDate datetime,
         ReconciliationDate datetime,
         RejectionDate      datetime,  
         letterDate datetime,
         PaymentStatusId int,
         BatchReference varchar(250)
  )

  Declare @Results Table(
         Id int identity(1,1),
         ItemId int,
         PolicyId int,
         Username varchar(Max),
         PaymentStatus      varchar(250),
         PaymentType  varchar(250),
         Amount money,
         Reference varchar(250),
         ClaimNumber varchar(250),
         Product varchar(100),
         Payee varchar(100),
         AccountNo varchar(50),
         ApprovedDate datetime,
         AuthorisedDate datetime,
         PendingDate datetime,
         SubmissionDate datetime,
         paymentDate datetime,
         ReconciliationDate datetime,
         RejectionDate      datetime,  
         letterDate datetime,
         PaymentStatusId int,
         BatchReference varchar(250)
  )
    
  insert into  @PaymentResults
  select  json_value(al.NewItem,'$.Id') as itemId, 
                     json_value(al.NewItem,'$.PolicyId') as PolicyId ,
                     al.username,
                     ps.name as PaymentStatus,
                     pt.name as PaymentType,
                     CAST(json_value(al.NewItem,'$.Amount') AS DECIMAL(16,2)) as Amount,
                     ISNULL(json_value(al.NewItem,'$.Reference'),pay.reference) as Reference,
                     json_value(al.NewItem,'$.ClaimReference')as ClaimNumber,
                     ISNULL(json_value(al.NewItem,'$.Product'),pay.product) as Product ,
                     ISNULL(json_value(al.NewItem,'$.Payee'),pay.payee) as Payee ,
                     json_value(al.NewItem,'$.AccountNo') as AccountNo ,
                     null as ApprovedDate,
                     null as AuthorisedDate,
                     pending.date as PendingDate,
                     submission.date as SubmissionDate,
                     paid.date as paymentDate,
                     reconcilliation.date as ReconciliationDate,
                     rejection.date as RejectionDate,
                     null as letterDate,
                     json_value(al.NewItem,'$.PaymentStatus'),
                     pay.BatchReference
       from audit.AuditLog (NOLOCK) al
       inner join [Payment].[Payment] (NOLOCK) pay ON pay.PaymentId = json_value(NewItem,'$.Id')
       inner join [Common].[Paymenttype] (NOLOCK) pt ON pt.id = json_value(NewItem,'$.PaymentType') 
       inner join [common].[paymentstatus](NOLOCK) ps ON ps.id = json_value(al.NewItem,'$.PaymentStatus') 

       outer apply   (select top 1 [Date] ,username
                     from audit.AuditLog(NOLOCK)
                           where itemtype = 'payment_payment' 
                           and  json_value(newitem,'$.PaymentStatus') = 1
                     and ItemId= al.itemid
              order by [Date] asc) as pending   

       outer apply( select top 1 [Date] , username
                           from audit.AuditLog(NOLOCK)
                                  where itemtype = 'payment_payment' 
                                  and  json_value(newitem,'$.PaymentStatus') = 2
                           and ItemId= al.itemid
                     order by [Date] asc)as submission

       outer apply (select top 1 [Date], username 
              from audit.AuditLog(NOLOCK)
                     where itemtype = 'payment_payment' 
                     and  json_value(newitem,'$.PaymentStatus') = 3
              and ItemId= al.itemid
              order by [Date] asc)as paid

       outer apply (select top 1 [Date] ,username
                     from audit.AuditLog(NOLOCK)
                           where itemtype = 'payment_payment' 
                           and  json_value(newitem,'$.PaymentStatus') = 4
                     and ItemId= al.itemid
              order by [Date] asc)as rejection
       
       outer apply(select top 1 [Date],username 
                           from audit.AuditLog(NOLOCK)
                                  where itemtype = 'payment_payment' 
                                  and  json_value(newitem,'$.PaymentStatus') = 5
                           and ItemId= al.itemid
                     order by [Date] asc)as reconcilliation

       where al.itemtype = 'payment_payment' 
              and Cast(al.[date] as Date) >= @StartDate and  Cast(al.[date] as Date) <= @EndDate
              and json_value(al.NewItem,'$.PaymentType') = 1
              --and json_value(al.NewItem,'$.Id') != 0 
              and json_value(al.NewItem,'$.PaymentStatus') != 7 --Remove Queued from the results
              and json_value(al.NewItem, '$.PaymentSubmissonBatchid') is not null
       order by reference,claimnumber,PaymentStatus

       Declare @index as int
       Declare @total as int
                     
       select @total = count(*) from @PaymentResults 
       set @index=1
       
       while(@index <= @total)
              begin
                     Declare @policyId as int
                     Declare @itemId as int
                     Declare @claimNumber  as varchar(50)
                     Declare @reference  as varchar(50)
                     Declare @product as varchar(50)
                     Declare @accountNo as varchar(50)
                     Declare @Amount as nvarchar(50)
                     Declare @BatchReference varchar(250)
                     Declare @Payee varchar(80)
                     Declare @PendingDate datetime
                     Declare @SubmissionDate datetime
                     Declare @PaymentDate datetime
                     Declare @ReconciliationDate datetime
                     Declare @RejectionDate datetime
                     Declare @ApprovedDate datetime
                     Declare @AuthorisedDate datetime

                     select @policyId = policyId,  
                              @claimNumber = claimNumber,
                              @reference = reference,
                              @product = product,
                              @accountNo = AccountNo,
                              @Amount = Amount,
                              @BatchReference = BatchReference,
                              @Payee = Payee,
                              @PendingDate = PendingDate,
                              @SubmissionDate = SubmissionDate,
                              @PaymentDate = PaymentDate,
                              @ReconciliationDate = ReconciliationDate,
                              @RejectionDate = RejectionDate,
                              @itemId = ItemId
                     from @PaymentResults where id = @index
              
                     if exists(select policyId from @Results where policyId = @policyId)
                     begin
                           set @index= @index + 1
                           continue
                     end
       
                     insert into @Results
                     select top 1 itemId, @policyId, username,'Approved','Claim', @Amount, @reference, 
                                  @claimNumber, @product, @Payee, @AccountNo, [date]
                                  ,null,@PendingDate,@SubmissionDate,@PaymentDate,
                                  @ReconciliationDate,@RejectionDate,null, -1, @BatchReference
                     from audit.AuditLog (NOLOCK) 
                           where json_value(newitem,'$.PolicyId') = @policyId
                                  and ItemId != 0 and itemtype='claim_Claim'
                           and json_value(newitem,'$.ClaimStatus') = 13
                     order by [date] desc 

                     insert into @Results
                     select top 1 itemId, @policyId, username,'Authorised','Claim', @Amount, @reference, 
                                  @claimNumber, @product, @Payee, @AccountNo, 
                                  null,[date],@PendingDate,@SubmissionDate,@PaymentDate,
                                  @ReconciliationDate,@RejectionDate,null, 0, @BatchReference 
                     from audit.AuditLog (NOLOCK) 
                           where json_value(newitem,'$.PolicyId') = @policyId
                                  and ItemId != 0 and itemtype='claim_Claim'
                           and json_value(newitem,'$.ClaimStatus') = 14
                     order by [date] desc 
                     
                     select top 1 @ApprovedDate = approvedDate from @Results where policyId = @policyId
                     select top 1 @AuthorisedDate = authorisedDate from @Results where policyId = @policyId and authorisedDate is not null

                     insert into @Results
                           select top 1 itemId, @policyId, Reciepients,'LetterSent','Claim', @Amount, @reference, 
                                  @claimNumber, @product, @Payee, @AccountNo,
                                  @ApprovedDate,@AuthorisedDate,@PendingDate,
                                  @SubmissionDate,@PaymentDate,@ReconciliationDate,
                                  @RejectionDate, createddate, 8, @BatchReference
                           from [campaign].[EmailAudit](NOLOCK) ea
                           where itemtype = 'payment'
                                  and ea.subject = 'payment confirmation'
                                  and ea.issuccess = 1 
                                  and ItemId = @itemId
                     union all
                                  select top 1 itemId, @policyId, SmsNumbers,'SMS_sent','Claim', @Amount, @reference, 
                                  @claimNumber, @product, @Payee, @AccountNo,
                                  @ApprovedDate,@AuthorisedDate,@PendingDate,
                                  @SubmissionDate,@PaymentDate,@ReconciliationDate,
                                  @RejectionDate, createddate, 8, @BatchReference
                           from [campaign].[SmsAudit](NOLOCK) ea
                           where itemtype = 'payment'
                                  and ea.issuccess = 1 
                                  and ItemId = @itemId

                     update @PaymentResults
                     set approvedDate = @ApprovedDate
                     where policyId = @policyId and approvedDate is null

                     update @Results
                     set approvedDate = @ApprovedDate
                     where policyId = @policyId and approvedDate is null

                     update @PaymentResults
                     set authorisedDate = @AuthorisedDate
                     where policyId = @policyId and authorisedDate is null 

                     update @Results
                     set authorisedDate = @AuthorisedDate
                     where policyId = @policyId 
                     and authorisedDate is null
                     
                     set @index= @index + 1
              end

       select distinct * from @PaymentResults 
       union all
       select distinct * from @Results
       order by ClaimNumber,PaymentStatusId, Reference
END
