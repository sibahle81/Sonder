 

Create PROCEDURE [policy].[GetCfpFICADeclaration] @wizardId int
as
select top 1

p.[PolicyNumber],
          c.[DisplayName] [MemberName],
          a.[AddressLine1],
          a.[AddressLine2],
          a.[City],
          a.[Province],
          a.[PostalCode]
          from [policy].[Policy] p (nolock)
          inner join [client].[RolePlayer] c (nolock) on c.[RolePlayerId] = p.[PolicyOwnerId]
          left join [client].[RolePlayerAddress] a (nolock) on a.[RolePlayerId] = c.[RolePlayerId]
          where p.[PolicyId] = @wizardId
          and a.[AddressTypeId] = 2