CREATE   PROCEDURE [Load].[GetPremiumListingUnpaidPremiumErrors] @GroupPolicyNumber varchar(25)=NULL,@startDate date,@endDate date 
AS BEGIN
	declare @BrokerName varchar(500) = (
		select top 1 [Name] as BrokerName from [broker].Brokerage bb
		where Id in (select BrokerageId from policy.Policy where policyNumber in 
		(@GroupPolicyNumber))
	)
	if @GroupPolicyNumber is null
	begin
		set @GroupPolicyNumber=''
	end

	select pe.[Company],
		pe.[GroupPolicyNumber],
		pe.[MemberPolicyNumber],
		concat(' ',pe.[MemberIdNumber]) [MemberIdNumber],
		per.FirstName, per.Surname,
		pe.PaymentDate,
		cast(pe.PaymentAmount as money) [PaymentAmount],
		pe.ErrorMessage,
		brokerage.[Name] BrokerName
	from [Load].[PremiumListingPaymentError] pe with (nolock)
		left join [client].[Person] per with (nolock) on per.IdNumber = pe.MemberIdNumber
		 outer apply (select top 1 [Name] from [broker].Brokerage bb
		where Id in (select BrokerageId from policy.Policy where policyNumber in 
		(pe.[GroupPolicyNumber])))  brokerage
	where
	1 = CASE 
			WHEN @GroupPolicyNumber <>'' THEN CASE WHEN pe.[GroupPolicyNumber] =@GroupPolicyNumber THEN 1 ELSE 0 END					                                                   
                     ELSE 1
				 END
		and	
	 (pe.PaymentDate between @startDate and @endDate)  
	 and pe.ErrorMessage = 'Policy member was not included in the premium payment file'
	order by [ErrorMessage], [MemberIdNumber]
END