CREATE PROCEDURE [policy].[GetCfpPolicyWelcomeLetterDetails]
    @policyId int = null, 
    @wizardId int = null
AS BEGIN

    if (isnull(@wizardId, 0) > 0) begin

		declare @json varchar(max)
		select @json = [Data] from bpm.Wizard (nolock) where Id = @wizardId 

        select top 1 PolicyNumber,
            MemberName,
            AddressLine1,
            AddressLine2,
            City,
            Province,
            PostalCode
        from openjson(@json, '$[0].mainMember')
        with (
            PolicyNumber varchar(32) '$.policies[0].policyNumber',
            MemberName varchar(128) '$.displayName'
        ) x
        outer apply openjson(@json, '$[0].mainMember.rolePlayerAddresses')
        with (
            addressLine1 varchar(100),
            addressLine2 varchar(100),
            city varchar(50),
            province varchar(100),
            postalCode varchar(20),
            addressType int,
            createdDate datetime
        ) a
        order by case when a.AddressType = 2 then 0 else 1 end, -- Residential addresses first
            a.CreatedDate desc

    end else begin
        select top 1 p.[PolicyNumber],
          rp.[DisplayName] [MemberName],
          a.[AddressLine1],
          a.[AddressLine2],
          a.[City],
          a.[Province],
          a.[PostalCode]
        from policy.Policy p (nolock)
            inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
            inner join client.RolePlayerAddress a (nolock) on a.RolePlayerId = rp.RolePlayerId
        where p.PolicyId = @policyId
          and a.AddressTypeId in (1, 2)
          and a.IsDeleted = 0
        order by case when a.AddressTypeId = 2 then 0 else 1 end, -- Residential addresses first
            a.CreatedDate desc
    end
END
