--=============================================
 --Author:		bongani makelane
 --Create date: 05/07/2020
 --=============================================
create PROCEDURE [billing].[GetPaidClaimAmountsForPolicy]
	@policyId INT
AS
BEGIN
Select amount   from  [payment].[Payment] where paymenttypeid = 1
and policyId = @policyId AND PaymentStatusId not in(4) 
END