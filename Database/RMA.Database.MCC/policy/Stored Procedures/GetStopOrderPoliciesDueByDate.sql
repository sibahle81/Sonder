CREATE PROCEDURE [policy].[GetStopOrderPoliciesDueByDate] @employerCode varchar(8), @date date 
AS BEGIN

	select p.PolicyId,
		p.PolicyNumber,
		pd.*
	from policy.Policy p (nolock)
		inner join client.RolePlayerPersalDetail pd (nolock) on left(pd.Employer, 3) = @employerCode
	where p.PaymentMethodId = 19

END
GO
