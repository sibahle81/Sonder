-- =============================================
-- Author:Edgar Blount
-- Create date: 2025/05/28
-- EXEC [billing].[ChildPolicyAllocationConsolidationReport] 1,'2020-08-01', '2020-08-31'
-- =============================================
	CREATE PROCEDURE [billing].[ChildPolicyAllocationConsolidationReport] 
	@ChildAllocationStatus int,
	@StartDate date,
	@EndDate date
	as
	begin
	
		 select distinct			
			pvc.GroupPolicyNumber as GroupPolicyNumber,
			parentScheme.DisplayName as SchemeName,
			pvc.MemberNumber as [MemberPolicyNumber],
			pvc.MemberIdNumber as MemberIdNumber,
			pvc.PaymentDate as PaymentDate,			
			pvc.[PaymentAmount] [PaymentAmount],
		ISNULL(allocated.Amount,0)  as AllocatedAmount,
		ISNULL(listingError.PaymentAmount,0)  as ExceptionAmount,
		ISNULL(listingError.ErrorMessage,'')  as ErrorMessage
		from
		[Load].PremiumPaymentFileValidationContent (nolock) pvc 		
		outer apply (select ppf.Amount from [billing].[PremiumTransactionPaymentFile] (nolock) ppf
						inner join  [billing].[PremiumListingTransaction] (nolock) ppt on ppt.id = ppf.[PremiumListingTransactionId]						
						inner join policy.policy pp on pp.policyid = ppt.policyid and pp.policynumber = pvc.membernumber
						where pvc.PaymentAmount = ppf.Amount
						and ppf.CreatedDate between @StartDate and @EndDate ) allocated
		outer apply (select ppe.ErrorMessage,ppe.PaymentAmount from   [load].[PremiumListingPaymentError] ppe		
						where pvc.fileidentifier = ppe.fileidentifier 
						and ppe.memberpolicynumber = pvc.membernumber 
						and pvc.PaymentAmount = ppe.PaymentAmount) listingError
		outer apply (SELECT  distinct DisplayName  
						FROM   client.roleplayer
						WHERE  roleplayerid in (select policypayeeid from policy.policy  where PolicyNumber = pvc.GroupPolicyNumber)) parentScheme
		where (@ChildAllocationStatus = 0)
		or (@ChildAllocationStatus = 1 and listingError.ErrorMessage is null)
		or (@ChildAllocationStatus = 2 and len(listingError.ErrorMessage) > 0)



	end