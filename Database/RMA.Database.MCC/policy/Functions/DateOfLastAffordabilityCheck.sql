CREATE  FUNCTION [policy].[DateOfLastAffordabilityCheck](@policyId int)
    RETURNS datetime AS
    BEGIN
        RETURN (select top 1
ql.CreatedDate
from [client].[QlinkTransaction] ql
inner join [common].[QLinkTransactionType] qlt on ql.QlinkTransactionTypeId = qlt.Id 
inner join common.TransactionType t on t.Id = ql.QlinkTransactionId
inner join policy.Policy pp on pp.PolicyId = ql.ItemId
inner join policy.PolicyLifeExtension ple on ple.PolicyId = pp.PolicyId
where qlt.Id in (1,11) and ql.StatusCode = 200 order by ql.CreatedDate desc)
    END
