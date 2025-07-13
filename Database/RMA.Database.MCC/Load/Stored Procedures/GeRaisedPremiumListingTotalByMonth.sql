-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2022/03/30
-- =============================================

CREATE   PROCEDURE [Load].[GeRaisedPremiumListingTotalByMonth] 
	@parentPolicyNumber nvarchar(50),
	@invoiceDate datetime
as begin

	declare @parentPolicyId int = (select policyid from policy.policy where PolicyNumber = @parentPolicyNumber)
			if @parentPolicyId > 0
			begin
				select cast(sum(InvoiceAmount) as decimal(18,2)) from  billing.PremiumListingTransaction pl with (nolock)
				inner join policy.policy p   on pl.PolicyId = p.PolicyOwnerId				
				and p.ParentPolicyId =@parentPolicyId
				and p.PolicyStatusId in (1, 8, 15)
				and pl.InvoiceDate = @invoiceDate
			end
			else
				begin
				declare @amount decimal = 0
				select @amount
			end	
end