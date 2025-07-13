CREATE procedure [policy].[GetPoliciesForBrokerTask]
@UserId int
as begin
/*
	exec  [policy].[GetPoliciesForBrokerTask] @UserId = 3466
*/
	SELECT 
	       POL.PolicyId, POL.PolicyNumber,POL.[BrokerageId],
           POL.[RepresentativeId],POL.[ProductOptionId],POL.[PaymentFrequencyId],POL.[PaymentMethodId],
           POL.[PolicyStatusId],POL.[PolicyInceptionDate],POL.[ExpiryDate],POL.[CancellationDate],
		   POL.[InstallmentPremium],
		  [ClientName] = P.DisplayName,
		  (SELECT  AffordabilityCheckPassed FROM policy.PolicyLifeExtension WHERE PolicyId = POL.PolicyId) AffordabilityCheckPassed
    FROM security.UserBrokerageMap (NOLOCK) UBM
	INNER JOIN policy.Policy (NOLOCK) POL ON POL.BrokerageId = UBM.BrokerageId AND UBM.UserId = @UserId
	INNER JOIN client.RolePlayer (NOLOCK) P on P.RolePlayerId = POL.PolicyOwnerId
	GROUP BY POL.PolicyId, POL.PolicyNumber,POL.[BrokerageId],
           POL.[RepresentativeId],POL.[ProductOptionId],POL.[PaymentFrequencyId],POL.[PaymentMethodId],
           POL.[PolicyStatusId],POL.[PolicyInceptionDate],POL.[ExpiryDate],POL.[CancellationDate],
		   POL.[InstallmentPremium],
		  P.DisplayName
end