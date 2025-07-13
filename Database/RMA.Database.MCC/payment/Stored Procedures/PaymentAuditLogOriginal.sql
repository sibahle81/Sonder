CREATE PROCEDURE [payment].[PaymentAuditLogOriginal]
	@StartDate As Date,
	@EndDate AS Date

AS
BEGIN
/*
exec [payment].[PaymentAuditLogOriginal] @StartDate = '2020-01-01', @EndDate = '2022-12-31'
*/
select distinct json_value(al.NewItem,'$.Id') as 'ID', 
			al.username,
			json_value(al.NewItem,'$.PaymentStatus') as 'PaymentStatusId',
			ps.name,
			pt.name as 'PaymentTypeId',
			json_value(al.NewItem,'$.Amount') as 'Amount' ,
			json_value(al.NewItem,'$.ClaimType') as 'ClaimTypeId',
			ISNULL(json_value(al.NewItem,'$.Reference'),pay.reference) as 'Reference' ,
			json_value(al.NewItem,'$.ClaimReference')as 'ClaimNumber' ,
			ISNULL(json_value(al.NewItem,'$.Product'),pay.product) as 'Product' ,
			ISNULL(json_value(al.NewItem,'$.Payee'),pay.payee) as 'Payee' ,
			json_value(al.NewItem,'$.AccountNo') as 'AccountNo' ,

			reconcilliation.date as 'ReconciliationDate',
			reconcilliation.username as 'ReconcilledBy',
			rejection.date as 'RejectionDate',
			rejection.username as 'RejectedBy',
			paid.date as 'paymentDate',
			paid.username as 'paidBy',
			authorised.date as 'DateAuthorised',
			authorised.username as 'Authorised_By',
			approved.date as 'Date_Approved',
			approved.username as 'Approved_By',
			submission.date as 'SubmissionDate',
			submission.username as 'Submittedby',
			letter.CreatedDate as 'letterDate',
			letter.reciepients as 'SentTo',
			pending.date as PendingDate

	from [audit].[AuditLog] (NOLOCK) al
	inner join [Payment].[Payment] (NOLOCK) pay ON pay.PaymentId = json_value(NewItem,'$.Id')
	inner join [Common].[Paymenttype] (NOLOCK) pt ON pt.id = json_value(NewItem,'$.PaymentType') 
	inner join [common].[paymentstatus](NOLOCK) ps ON ps.id = json_value(al.NewItem,'$.PaymentStatus') 

	
	outer apply( select top 1 [Date] , username
				from [audit].[AuditLog](NOLOCK)
					where itemtype = 'payment_payment' 
					and  newitem like'%"PaymentStatus":1%'
				and ItemId= al.itemid
			order by [Date] asc)as Pending

	outer apply( select top 1 [Date] , username
				from [audit].[AuditLog](NOLOCK)
					where itemtype = 'payment_payment' 
					and  newitem like'%"PaymentStatus":2%'
				and ItemId= al.itemid
			order by [Date] asc)as submission
	
	outer apply(select top 1 [Date],username 
				from [audit].[AuditLog](NOLOCK)
					where itemtype = 'payment_payment' 
					and  newitem like'%"PaymentStatus":5%'
				and ItemId= al.itemid
			order by [Date] asc)as reconcilliation

	outer apply (select top 1 [Date] ,username
				from [audit].[AuditLog](NOLOCK)
					where itemtype = 'payment_payment' 
					and  newitem like'%"PaymentStatus":4%'
				and ItemId= al.itemid
			order by [Date] asc)as rejection

	outer apply (select top 1 [Date], username 
				from [audit].[AuditLog](NOLOCK)
					where itemtype = 'payment_payment' 
					and  newitem like'%"PaymentStatus":3%'
				and ItemId= al.itemid
			order by [Date] asc)as paid

	outer apply (select top 1 CreatedDate,Reciepients from [campaign].[EmailAudit](NOLOCK) ea
				where al.itemtype = 'payment_payment'
					and ea.subject like '%payment confirmation%'
				and ea.itemId = al.itemid
			and ea.issuccess = 1) 
			as letter
	
	outer apply (select top 1 [date], username
			from [audit].[AuditLog] (NOLOCK) 
				where --json_value(newitem,'$.PolicyId') = @policyId
					ItemId != 0 and itemtype='claim_Claim'
					and json_value(newitem,'$.ClaimStatus') = 14
					and json_value(NewItem,'$.PolicyId') = pay.policyId
			order by [date] desc ) as authorised

	outer apply (select top 1 [date], username,itemid
			from [audit].[AuditLog] (NOLOCK) 
				where --json_value(newitem,'$.PolicyId') = @policyId
					ItemId != 0 and itemtype='claim_Claim'
					and json_value(newitem,'$.ClaimStatus') = 13
				and json_value(NewItem,'$.PolicyId') = pay.policyId
			order by [date] desc ) as approved
		
	where al.itemtype = 'payment_payment' 
	and CONVERT(DATE, al.date)>=@StartDate and CONVERT(DATE, al.date)<=@EndDate
	and json_value(al.NewItem,'$.PaymentType') = 1
	and json_value(al.NewItem,'$.Id') != 0 
	and json_value(al.NewItem, '$.PaymentSubmissonBatchid') is not null
	order by claimnumber,PaymentStatusId

END
