
--/****** Object:  StoredProcedure [policy].[GetGroupCompanyDetails]    Script Date: 2022/09/07 12:39:32 PM ******/
--SET ANSI_NULLS ON
--GO

--SET QUOTED_IDENTIFIER ON
--GO

CREATE   PROCEDURE [policy].[GetGroupCompanyDetails] (@policyId int)
AS BEGIN

select top 1 p.[PolicyNumber],
       [InceptionDate] = p.[PolicyInceptionDate],
       [WaitingPeriodEnd] = dateadd(month,CAST(ISNULL(json_value(ppor.[RuleConfiguration], '$[0].fieldValue'),0) AS INT), p.[PolicyInceptionDate]),
       [UpgradeDowngradeWaitingPeriodEnd] = dateadd(month,CAST(ISNULL(json_value(ppor.[RuleConfiguration], '$[0].fieldValue'),0) AS INT), ppcp.[EffectiveDate]),
	   [Premium] = p.[InstallmentPremium],
       [PolicyOwner] = r.[DisplayName],
       br.[Name] [Brokerage],
       br.[FSPNumber],
       ISNULL(bbc.[TelephoneNumber],'N/A') AS [TelephoneNumber],
       ISNULL(bbc.[Email],'N/A') AS [Email],
       brt.[FirstName] + ' ' + brt.[SurnameOrCompanyName] as Representative,
       brt.[PhysicalAddressLine1] + ' ' + brt.[PhysicalAddressLine2] + ' ' + brt.[PhysicalAddressCity] + ' ' + brt.[PhysicalAddressCode] AS [PhysicalAddress],
       [IsEuropAssist] =p.[IsEuropAssist],
	   ppcp.[EffectiveDate]

from [policy].[Policy] p with (nolock)
       inner join [broker].[Brokerage] br with (nolock) on br.[Id] = p.[BrokerageId]
       inner join [broker].[Representative] brt with (nolock) on  brt.[Id] = p.[RepresentativeId]
       inner join [client].[RolePlayer] r with (nolock) on r.[RolePlayerId] = p.[PolicyOwnerId]
       left join [broker].[BrokerageContact] bbc with (nolock) on bbc.[BrokerageId] = br.[Id] and bbc.ContactTypeId = 6
       inner join  product.ProductOption ppo on  p.[ProductOptionId] = ppo.Id
       left join product.ProductOptionRule ppor on ppo.id = ppor.ProductOptionId and ppor.RuleId = 5 and ppor.IsDeleted = 0
	   left join [policy].[PolicyChangeProduct] ppcp (nolock) on ppcp.policyid =p.[PolicyId] 

where p.[PolicyId] = @policyId
  --and bbc.[IsDeleted] = 0
  and brt.[IsDeleted] = 0

END
