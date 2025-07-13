
CREATE  PROCEDURE [policy].[PolicyEFTReport]-- '2021/10/01','2022/02/28' ,'All','-1' 
           @StartDate AS DATE = NULL,
           @EndDate AS DATE = NULL,    
           @Brokerage AS VARCHAR(255),
           @Group AS Varchar (255)

AS
BEGIN

              IF @Brokerage = 'All'
                     BEGIN
                        SELECT @Brokerage = NULL;
                     END

			 IF @Group = '-1'
                     BEGIN
                        SELECT @Group = NULL;
                     END

    SELECT 
            DISTINCT
            p.[PolicyNumber],
            p.[PolicyInceptionDate],
            parp.DisplayName AS [Schemename],
            br.[Name] [BrokerName],
            cpn.[FirstName] [Name],
            cpn.[SurName],
            cpn.[IdNumber],
            pm.[Name] [PaymentMethod],
            cpfr.[Name] [PremiumFrequency],
            cps.[Name] [Status],
            CASE WHEN p.[PolicyStatusId] in (12,5,13,10,7,2) THEN 0
                ELSE  p.[InstallmentPremium]  END AS [CurrentPremium],
            p.[CancellationDate] [DateCancelled],
            cpcr.[Name] [CancelReason],
            cpn.[DateOfDeath] [DeathDate],
            CASE WHEN ppo.Name LIKE '%Family%' THEN 'Individual'
                 WHEN ppo.Name LIKE '%Group%' THEN 'Group'
              WHEN ppo.Name LIKE '%Corporate%' THEN 'Corporate'
              WHEN ppo.Name = 'RMA Staff' THEN 'Staff'
              WHEN ppo.Name LIKE '%Gold%' THEN 'GoldWage'
              END AS [ClientType]

    from [policy].[Policy] p
    inner join [client].[RolePlayer] r (nolock) on r.[RolePlayerId] = p.[PolicyOwnerId]
    inner join [broker].[Brokerage] br (nolock) on br.[Id] = p.[BrokerageId]
    inner join [broker].[Representative] brt (nolock) on p.[RepresentativeId] = brt.[Id]
    inner join [common].[PaymentMethod] pm (nolock) on pm.[Id] = p.[PaymentMethodId]
    inner join [common].[PolicyStatus] cps (nolock) ON p.[PolicyStatusId] = cps.[Id]
    inner join [Client].[Person] cpn (nolock) ON  r.[RolePlayerId] = cpn.[RolePlayerId]
    inner join [common].[PaymentFrequency] cpfr (nolock) ON p.[PaymentFrequencyId] = cpfr.[Id]
    left join [common].[PolicyCancelReason] cpcr (nolock) ON p.[PolicyCancelReasonId] = cpcr.[Id] 
    left join [policy].[Policy] paPol (nolock) on paPol.PolicyId = p.ParentPolicyId
    left join [client].[roleplayer] parp (nolock) on parp.RolePlayerId = paPol.policyOwnerId
       left join  Product.ProductOption ppo (NOLOCK) ON p.ProductOptionId = ppo.Id
       where (parp.DisplayName = @Group OR  @Group IS NULL)
       and p.[PolicyInceptionDate] between @StartDate and @EndDate
       and ([br].[Name] = @Brokerage OR  @Brokerage IS NULL)
       and pm.Id =7


END