
CREATE PROCEDURE [policy].[JuristicRepresentativesReport]

AS
BEGIN
	select  distinct
	 [agent1].FirstName + ' ' + [agent1].SurnameOrCompanyName AS 
	[JuristicRep] 
	from policy.Policy p
	LEFT JOIN [policy].[PolicyBroker] ppb (nolock) ON [p].JuristicRepresentativeId = [ppb].JuristicRepId and [p].PolicyId = ppb.PolicyId and ppb.IsDeleted =0
    LEFT JOIN [broker].[Representative] [agent1] (NOLOCK) ON ppb.JuristicRepId = [agent1].Id
END