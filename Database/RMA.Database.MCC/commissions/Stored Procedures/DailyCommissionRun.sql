CREATE     PROCEDURE [commission].[DailyCommissionRun]
AS
/*

BEGIN TRAN RUN

EXEC [commission].[DailyCommissionRun] 

select * from commission.period order by 1 desc

select * from commission.header
select * from commission.detail
select * from commission.InvoicePaymentAllocation

ROLLBACK TRAN RUN

*/

BEGIN
	BEGIN TRY
	BEGIN TRANSACTION commRun


	DECLARE  @Broker33 float = 0.33, @Juristic67 float = 0.67;
	DECLARE @PeriodId int = 0 ;
	DECLARE @RunDate DATETIME  = GETDATE();
	
	DECLARE @StartDate datetime = DATEADD(s,0,cast(format(DATEADD(m,0,@RunDate), 'yyyy-MM-26') as Datetime));
	DECLARE @EndDate   datetime = DATEADD(s,-1,DATEADD(s,0,cast(format(DATEADD(m,1,@RunDate), 'yyyy-MM-26') as Datetime))); 

	SELECT TOP 1 @PeriodId = PeriodId from [commission].[Period] where @RunDate between [StartDate] and [EndDate] ORDER BY PeriodId desc

	IF (@PeriodId = 0 )
	BEGIN
		INSERT [commission].[Period] (YYYY, MM, StartDate, EndDate, IsDeleted,	CreatedBy,	CreatedDate,	ModifiedBy,	ModifiedDate) 
		Values (YEAR(@EndDate),MONTH(@EndDate) , @StartDate,@EndDate, 0, 'CommissionRunProcess', GETDATE(), 'CommissionRunProcess', GETDATE());	

		SELECT @PeriodId = SCOPE_IDENTITY();	
	END
	
	DECLARE @CommissionRun table
	(
		Id int identity (1,1),	
		RecepientTypeId smallint,
		CommissionReceipient varchar(250),
		RecepientId int,
		Code varchar(20),
		InvoicePaymentAllocationId int,
		InvoiceId int,
		InvoiceNumber varchar (50) NULL,
		PolicyNumber varchar (50) NULL,
		RepCode varchar (20) NULL,
		RepName varchar (200) NULL,
		AllocatedAmount decimal(18,2),
		CommissionPercentage float,
		AdminPercentage float,
		CommissionFormula varchar(500),
		CommissionAmount decimal(18,2),
		AdminServiceFeeFormula varchar(500),
		AdminServiceFeeAmount decimal(18,2),
		Total decimal(18,2)		
	) 
	   
	--2. Calculate and Assign Commission per Broker, per Juristic Rep

	insert into @CommissionRun
	-- SELECT cast(cast(3.399 as decimal(18,2) ) as varchar(30))
	select 
	DISTINCT
	1,
	br.Name,  
	pb.BrokerageId, 
	br.Code,
	ipa.InvoicePaymentAllocationId,
	inv.InvoiceId,
	inv.InvoiceNumber,
	pol.PolicyNumber,
	pb.RepCode,
	pb.RepName,
	ipa.Amount, 
	pol.CommissionPercentage, 
	pol.AdminPercentage, 
	CommissionFormula = 'CommissionAmount: '+ cast(cast(pb.AllocationPercentage * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.CommissionPercentage) as decimal(18,2)) as decimal(18,2)) as varchar(30)) +' = {AllocationPercentage['+ cast((pb.AllocationPercentage * 100) as varchar(4)) +'%] * (PremiumReceived['+ cast(ipa.Amount as varchar(100)) +']/(1 + AdminPercentage ['+ CAST(CONVERT(decimal(18,2), (pol.AdminPercentage * 100)) AS varchar(10)) +'%]) * CommissionPercentage['+ CAST(CONVERT(decimal(18,2), (pol.CommissionPercentage * 100)) AS varchar(10)) +'%])}', 
	CommissionAmount = pb.AllocationPercentage * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.CommissionPercentage) as decimal(18,2)),
	AdminServiceFeeFormula = 'AdminServiceFeeAmount: '+ cast(cast(pb.AllocationPercentage * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.AdminPercentage) as decimal(18,2)) as decimal(18,2)) as varchar(30)) +' = {AllocationPercentage['+ cast((pb.AllocationPercentage * 100) as varchar(4)) +'%] * (PremiumReceived['+ cast(ipa.Amount as varchar(100)) +']/(1 + AdminPercentage['+ CAST(CONVERT(decimal(18,2), (pol.AdminPercentage * 100)) AS varchar(10)) +'%]) * AdminPercentage['+ CAST(CONVERT(decimal(18,2), (pol.AdminPercentage * 100)) AS varchar(10)) +'%])}',
	AdminServiceFeeAmount = pb.AllocationPercentage * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.AdminPercentage) as decimal(18,2)),
	Total = pb.AllocationPercentage * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.CommissionPercentage) as decimal(18,2)) + pb.AllocationPercentage * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.AdminPercentage) as decimal(18,2))
	
	from policy.[Policy] pol 
		 inner join billing.Invoice (nolock) inv on inv.PolicyId = pol.PolicyId --and inv.InvoiceStatusId in (1,4) -- Paid, Partially Paid (TO Do: verify with Vusi if we paying commision on partially paid invoice)
		 inner join commission.InvoicePaymentAllocation (nolock) ipa on ipa.InvoiceId = inv.InvoiceId
																		and ipa.IsProcessed = 0
		 CROSS APPLY (
				SELECT TOP 1  BrokerageId, AllocationPercentage = case when pb.JuristicRepId is null then 1 else @Broker33 end, RepCode = r.Code ,RepName = r.FirstName + ' '+ r.SurnameOrCompanyName 
				FROM policy.PolicyBroker (nolock) pb
				inner join broker.Representative (nolock) r on r.Id = pb.RepId
				WHERE pb.PolicyId = pol.PolicyId 
					and pb.EffectiveDate < = ipa.TransactionDate
					and pb.IsDeleted = 0
				ORDER BY pb.PolicyBrokerId DESC
				) as pb
		 inner join broker.Brokerage br on br.Id = pb.BrokerageId
	--where   (pol.CommissionPercentage > 0 OR pol.AdminPercentage > 0) 
	--		and pol.PolicyStatusId in (1,3,14,15)

	-- 67% to Juristic
	UNION ALL 
	select
	DISTINCT
	 2,
	 rp.SurnameOrCompanyName, 
	 pb.JuristicRepId, 
	 rp.Code,
	 ipa.InvoicePaymentAllocationId,
	 inv.InvoiceId, 
	 inv.InvoiceNumber,
	 pol.PolicyNumber,
	 rp.Code,
	 rp.SurnameOrCompanyName,
	 ipa.Amount, 
	 pol.CommissionPercentage, 
	 pol.AdminPercentage,
	 CommissionFormula = 'CommissionAmount: '+ cast(cast(pb.AllocationPercentage * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.CommissionPercentage) as decimal(18,2)) as decimal(18,2)) as varchar(30)) +' = {AllocationPercentage['+ cast((pb.AllocationPercentage * 100) as varchar(4)) +'%] * (PremiumReceived['+ cast(ipa.Amount as varchar(100)) +']/(1 + AdminPercentage ['+ CAST(CONVERT(decimal(18,2), (pol.AdminPercentage * 100)) AS varchar(10)) +'%]) * CommissionPercentage['+ CAST(CONVERT(decimal(18,2), (pol.CommissionPercentage * 100)) AS varchar(10)) +'%])}', 
	 CommissionAmount =  pb.AllocationPercentage     * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.CommissionPercentage) as decimal(18,2)),
	 AdminServiceFeeFormula = 'AdminServiceFeeAmount: '+ cast(cast(pb.AllocationPercentage * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.AdminPercentage) as decimal(18,2)) as decimal(18,2)) as varchar(30)) +' = {AllocationPercentage['+ cast((pb.AllocationPercentage * 100) as varchar(4)) +'%]  * (PremiumReceived['+ cast(ipa.Amount as varchar(100)) +']/(1 + AdminPercentage['+ CAST(CONVERT(decimal(18,2), (pol.AdminPercentage * 100)) AS varchar(10)) +'%]) * AdminPercentage['+ CAST(CONVERT(decimal(18,2), (pol.AdminPercentage * 100)) AS varchar(10)) +'%])}',
	 AdminServiceFeeAmount =   pb.AllocationPercentage * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.AdminPercentage) as decimal(18,2)),
	 Total = pb.AllocationPercentage * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.CommissionPercentage) as decimal(18,2)) + pb.AllocationPercentage * cast((ipa.Amount/(1 + pol.AdminPercentage) * pol.AdminPercentage) as decimal(18,2))
	 
	 from policy.[Policy] pol 
		 inner join billing.Invoice (nolock) inv on inv.PolicyId = pol.PolicyId --and inv.InvoiceStatusId in (1,4) -- Paid, Partially Paid (TO Do: verify with Vusi if we paying commision on partially paid invoice)
		  inner join commission.InvoicePaymentAllocation (nolock) ipa on ipa.InvoiceId = inv.InvoiceId
																		and ipa.IsProcessed = 0 and ipa.IsDeleted = 0
		 CROSS APPLY (
				SELECT TOP 1  JuristicRepId, AllocationPercentage = case when pb.JuristicRepId is null then 1 else @Juristic67 end   
				FROM policy.PolicyBroker pb
				WHERE pb.PolicyId = pol.PolicyId 					
					and pb.EffectiveDate < =  ipa.TransactionDate
					and pb.IsDeleted = 0
				ORDER BY pb.PolicyBrokerId DESC
				) as pb
		  inner join broker.Representative rp on rp.Id = pb.JuristicRepId
	--where   (pol.CommissionPercentage > 0 OR pol.AdminPercentage > 0) 
	--		and pol.PolicyStatusId in (1,3,14,15) --and pol.PolicyId = 367

	If((select COUNT(*) from @CommissionRun) > 0) 
	begin
	 
		insert commission.Header (PeriodId, RecepientTypeId, RecepientId, RecepientCode, RecepientName, TotalHeaderAmount, HeaderStatusId, Comment, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
		select  @PeriodId, RecepientTypeId, RecepientId, Code, CommissionReceipient, SUM(Total), 1 , NULL, 0 , 'CommissionRunProcess', GETDATE(), 'CommissionRunProcess', GETDATE()
		FROM @CommissionRun b where not exists(select 1 from commission.header a (nolock)  where a.IsDeleted = 0 AND a.HeaderStatusId = 1 and a.RecepientTypeId = b.RecepientTypeId and a.RecepientId = b.RecepientId and a.PeriodId = @PeriodId) 
		GROUP BY RecepientTypeId,	RecepientId, Code, CommissionReceipient
		 
		insert commission.Detail 
			(HeaderId,InvoicePaymentAllocationId, InvoiceNumber, PolicyNumber, RepCode, RepName, AllocatedAmount, CommissionPercentage, AdminPercentage, CommissionFormula, CommissionAmount, 
			 AdminServiceFeeFormula, AdminServiceFeeAmount, TotalAmount, IsDeleted, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
		select 	
			b.HeaderId, a.InvoicePaymentAllocationId, a.InvoiceNumber, a.PolicyNumber, a.RepCode, a.RepName, AllocatedAmount, isnull(CommissionPercentage,0), isnull(AdminPercentage,0), isnull(CommissionFormula,''), isnull(CommissionAmount,0),
			isnull(AdminServiceFeeFormula,''), isnull(AdminServiceFeeAmount,0), isnull(Total,0), 0 , c.CreatedBy, GETDATE(), c.ModifiedBy, GETDATE() 
		from @CommissionRun a
		inner join commission.Header b on b.RecepientTypeId = a.RecepientTypeId and b.RecepientId = a.RecepientId and b.HeaderStatusId = 1 	and b.PeriodId = @PeriodId and b.IsDeleted = 0
		inner join commission.InvoicePaymentAllocation c on c.InvoicePaymentAllocationId = a.InvoicePaymentAllocationId and c.IsDeleted = 0
		
		;with cte as (
		SELECT b.HeaderId, SUM(a.TotalAmount) TotalAmount
		FROM commission.Detail a inner join commission.Header b on b.HeaderId = a.HeaderId and b.HeaderStatusId = 1	and b.PeriodId = @PeriodId and a.IsDeleted = 0 and b.IsDeleted = 0		
		GROUP BY b.HeaderId)
		UPDATE p SET p.TotalHeaderAmount=cte.TotalAmount
		FROM commission.Header p INNER JOIN cte ON p.HeaderId=cte.HeaderId
	
		update commission.InvoicePaymentAllocation set IsProcessed = 1 where InvoicePaymentAllocationId in    
		(select a.InvoicePaymentAllocationId from  @CommissionRun a inner join commission.Detail d on d.InvoicePaymentAllocationId = a.InvoicePaymentAllocationId)
	end

	INSERT [commission].[ClawBackAccount]
	SELECT 
	h.[RecepientTypeId], h.[RecepientId],h.[RecepientCode], h.RecepientName,0, 0 , 'CommissionRunProcess', GETDATE(), 'CommissionRunProcess', GETDATE()
	FROM [commission].[Header]  h
	LEFT JOIN [commission].[ClawBackAccount]  cba ON h.[RecepientTypeId] = cba.[RecepientTypeId] and h.[RecepientId] = cba.[RecepientId] 
	WHERE cba.[RecepientId] IS NULL
	GROUP BY h.[RecepientTypeId], h.[RecepientId],h.[RecepientCode], h.RecepientName

	COMMIT TRANSACTION commRun 
	END TRY
	BEGIN CATCH
	PRINT 'LOG TO DATABASE'
	SELECT ERROR_LINE() [ERROR_LINE],  ERROR_NUMBER() [Error_Number], ERROR_SEVERITY() [Error_Severity],  ERROR_STATE() [Error_State] , ERROR_MESSAGE()  [Error_Message]

	BEGIN
		ROLLBACK TRANSACTION commRun 
	END
	END CATCH
END
