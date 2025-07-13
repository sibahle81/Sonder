CREATE   PROCEDURE [billing].[CashFlowProjectionSummaryReport] 

AS
BEGIN
Select distinct bt.termarrangementid,cfp.Finpayenumber as debtornumber,bt.TotalAmount,bt.Balance,btas.[Name] as ApplicationStatus,
ic.[Name] as [Industry], sum(CASE WHEN ttl.IsDebit = 1 THEN bts.Amount ELSE - bts.Amount END) AS DebtorBalance
from billing.TermArrangement bt
inner join [common].[TermArrangementStatus] btas on bt.TermArrangementStatusId = btas.Id
inner join policy.policy pp (NOLOCK) on  bt.RolePlayerId = pp.PolicyOwnerId
inner join [client].[RolePlayer] r (NOLOCK) on r.[RolePlayerId] = pp.[PolicyOwnerId]
inner join Client.FinPayee cfp (NOLOCK) on pp.[PolicyOwnerId] = cfp.RolePlayerID
inner join [product].ProductOption ppo (NOLOCK) on pp.ProductOptionId = ppo.Id
inner join [billing].[Transactions] bts on bts.[RolePlayerId] = r.[RolePlayerId]
inner join [billing].[TransactionTypeLink] ttl on ttl.[Id] = bts.[TransactionTypeLinkId]
inner join [client].[company] c (NOLOCK) on c.[RolePlayerId] = pp.[PolicyOwnerId]
left join product.product prod (NOLOCK) on ppo.ProductId = prod.Id
left join  common.Industry ind on ind.Id = cfp.IndustryId
left join  common.IndustryClass ic on ic.Id = ind.IndustryClassId
where bt.Isdeleted =0 and bt.IsActive =1
and prod.[Id] not in (1,2,3)
and bt.TotalAmount > 0

group by  bt.termarrangementid,cfp.Finpayenumber,bt.TotalAmount,bt.Balance,btas.[Name],ic.[Name]

END