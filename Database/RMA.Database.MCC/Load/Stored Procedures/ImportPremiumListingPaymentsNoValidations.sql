
 

CREATE  PROCEDURE [Load].[ImportPremiumListingPaymentsNoValidations] (@fileIdentifier uniqueidentifier,  @userId varchar(64))
as begin
	--JPK: Note the paymentdate field from the excel file is used as allocate to date and the paymentdate 
	--is picked up from the payment.
	--This was needed as we need to allocate to multiple months but the database is already locked down for 
	--golive.

	declare @result int = 0
	declare @fileId int = (select id from Load.PremiumListingPaymentFile where FileIdentifier = @fileIdentifier)

 

	declare @paymentDate varchar(20)

	Select @paymentDate = SUBSTRING(rmareference, charindex(' ', rmareference)+1,20) from billing.Transactions where transactionid =  (
	SELECT top 1 LinkedTransactionId
	  FROM [Load].[PremiumListingPaymentFile]
	  where FileIdentifier = @fileIdentifier)

 

	SET @paymentDate = convert(datetime, @paymentDate, 103);

 

	set nocount on

 

	begin try
		begin tran trxPayments

 

		declare @count int

 

		declare @company table (
			RolePlayerId int,
			PolicyId int not null index idx_company_policy,
			primary key (RolePlayerId, PolicyId)
		)

 

		insert into @company
			select p.[PolicyOwnerId], p.[PolicyId]
			from [Load].[PremiumListingPayment] pp with (nolock)
				inner join [policy].[Policy] p with (nolock) on p.[PolicyNumber] = pp.[GroupPolicyNumber]
			where pp.[FileIdentifier] = @fileIdentifier
			group by p.[PolicyId], p.[PolicyOwnerId]

 

		declare @parentPolicyId int
		declare @policyNumber varchar(64)
		declare @companyName varchar(256)
		declare @childPolicyCount int

		select top 1 @parentPolicyId = PolicyId from @company
		select @childPolicyCount = count(*) 
			from [policy].[Policy] with (nolock)
			where ParentPolicyId = @parentPolicyId

		select top 1 @companyName = Company, @policyNumber = GroupPolicyNumber
			from [Load].[PremiumListingPayment] with (nolock)
			where FileIdentifier = @fileIdentifier

 

		declare @member table (
			RolePlayerId int index tmp_member_roleplayerId,
			PolicyId int index tmp_member_policyId,
			PolicyNumber varchar(64),
			IdNumber varchar(64),
			PaymentId int null index idx_member_paymentid,
			PaymentDate date index idx_member_paymentdate,
			InvoiceAmount float,
			PaymentAmount float,
			AlreadyPaid bit,
			MemberNumber varchar(64)
		)

 

		insert into @member
			select isnull(pn.[RolePlayerId], 0),
				isnull(p.[PolicyId], 0),
				pp.[MemberPolicyNumber],
				pp.[MemberIdNumber],
				null [PaymentId],
				pp.[PaymentDate],
				0.0 [InvoiceAmount],
				replace(pp.[PaymentAmount],',','.'),
				0 [AlreadyPaid],
				pp.MemberIdNumber
		from [Load].[PremiumListingPayment] pp with (nolock)
				left join [client].[Person] pn with (nolock) on pn.[IdNumber] = pp.[MemberIdNumber]
				left join [policy].[Policy] p with (nolock) on p.[PolicyNumber] = pp.[MemberPolicyNumber]
			where pp.[FileIdentifier] = @fileIdentifier

 

 

		-- Update payments that have already been made  - leave
		update m set m.[AlreadyPaid] = 1
		from @member m
			inner join [billing].[PremiumListingTransaction] pt on
				pt.[RolePlayerId] = m.[RolePlayerId] and
				pt.[PolicyId] = m.[PolicyId] and
				pt.[PaymentDate] = m.[PaymentDate]

 

		-- Update new payments - leave
		update m set
			InvoiceAmount = pt.invoiceamount,
			m.PaymentId  = pt.Id
		from @member m
			inner join [billing].[PremiumListingTransaction] pt on pt.[PolicyId] = m.[PolicyId] 
			and pt.InvoiceDate = m.PaymentDate

 

			--partially			
				update pt set
					pt.[PaymentDate] = @paymentDate,
					pt.[PaymentAmount] = pt.[PaymentAmount] + m.[PaymentAmount],
					pt.InvoiceStatusId = 4,
					pt.[ModifiedBy] = @userId,
					pt.[ModifiedDate] = getdate(),
					pt.PaymentFileId = @fileId
				from @member m
					inner join [billing].[PremiumListingTransaction] pt on pt.[Id] = m.[PaymentId]
					where m.PaymentAmount < pt.InvoiceAmount								

 

			--end partially
			--full
				update pt set
					pt.[PaymentDate] = @paymentDate,
					pt.[PaymentAmount] = pt.[PaymentAmount] + m.[PaymentAmount],
					pt.InvoiceStatusId = 1,
					pt.[ModifiedBy] = @userId,
					pt.[ModifiedDate] = getdate(),
					pt.PaymentFileId = @fileId
				from @member m
					inner join [billing].[PremiumListingTransaction] pt on pt.[Id] = m.[PaymentId]
					where m.PaymentAmount >= pt.InvoiceAmount

 

				commit tran trxPayments
				--select @@rowcount [Count]
				update [Load].PremiumListingPaymentFile set FileProcessingStatusId= 2
				where FileIdentifier = @fileIdentifier
				select @result
				--print 'no error'
			--end full
	end 
	try
	begin catch
		rollback tran trxPayments
		update [Load].PremiumListingPaymentFile set FileProcessingStatusId= 3
				where FileIdentifier = @fileIdentifier
				print 'error'
		 --SELECT   
   --     ERROR_NUMBER() AS ErrorNumber  
   --    ,ERROR_MESSAGE() AS ErrorMessage;  
	end catch

 

end