---- =============================================
---- Author:Mbali Mkhize
---- Create date: 2020/12/02
---- EXEC [billing].[GroupPolicyScheduleReport] 52969
---- =============================================
CREATE   PROCEDURE [billing].[GroupPolicyScheduleReport]
    @policyId AS INT

AS
BEGIN
select distinct
	p.[PolicyNumber],
    [InceptionDate] = p.[PolicyInceptionDate],
    [WaitingPeriodEnd] = dateadd(month, 6, p.[PolicyInceptionDate]),
    [Premium] = p.[InstallmentPremium],
    [PolicyOwner] = r.[DisplayName],
	br.[Name] [Brokerage],
	br.[FSPNumber],
	bbc.[TelephoneNumber],
	bbc.[Email],
	brt.[FirstName] + ' ' + brt.[SurnameOrCompanyName] as Representative,
	brt.[PhysicalAddressLine1] + ' '+ brt.[PhysicalAddressLine2] + ' '+ brt.[PhysicalAddressCity] + ' '+ brt.[PhysicalAddressCode] AS [PhysicalAddress]
    from [policy].[Policy] p
    inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
	inner join [broker].[Brokerage] br on br.[Id] = p.[BrokerageId]
	inner join [broker].[BrokerageRepresentative] bbr on bbr.[BrokerageId] =br.[Id]
	inner join [broker].[Representative] brt on p.[RepresentativeId] = brt.[Id]
	inner join [broker].[BrokerageContact] bbc on bbc.[BrokerageId] =br.[Id] and bbc.ContactTypeId =6
    where p.[PolicyId] = @policyId

END
GO