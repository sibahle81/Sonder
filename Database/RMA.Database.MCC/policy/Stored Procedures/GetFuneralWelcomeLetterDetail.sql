CREATE PROCEDURE [policy].[GetFuneralWelcomeLetterDetail] @wizardId int = null, @policyId int = null
AS BEGIN

	if isnull(@policyId, 0) > 0 begin
		select top 1 p.PolicyNumber,
			rp.DisplayName [MainMemberName],
			a.AddressLine1,
			a.AddressLine2,
			a.City,
			a.Province,
			a.PostalCode
		from policy.Policy p (nolock) 
			inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			left join client.RolePlayerAddress a (nolock) on a.RolePlayerId = rp.RolePlayerId and a.AddressTypeId = 1 and a.IsDeleted = 1
		where p.PolicyId = @policyId
		order by isnull(a.CreatedDate, p.PolicyId) desc

	end else if isnull(@wizardId, 0) > 0 begin

		DECLARE @jsonData NVARCHAR(MAX);
			  DECLARE @addresses NVARCHAR(MAX);
			  DECLARE @addressId int;

			  select @jsonData = [Data] from bpm.Wizard where Id = @wizardId

			  --PolicyData
			  BEGIN TRY

			  select @addresses = [Addresses]
			  from openjson(substring(@jsonData, 2, len(@jsonData) - 2))
			  with ([Addresses] nvarchar(max) '$.mainMember.rolePlayerAddresses' as json)

			  declare @address table (
			  [Id] int identity not null,
			  AddressLine1 varchar(218),
			  AddressLine2 varchar(218),
			  City varchar(128),
			  Province varchar(128),
			  PostalCode varchar(16),
			  AddressTypeId int
			  )

			  insert into @address (AddressLine1,AddressLine2,City,Province,PostalCode,AddressTypeId) select addressLine1,addressLine2,city,province,postalCode,addressTypeId
			  from openjson(@addresses) with (
			  addressLine1 varchar(218)	'$.addressLine1',
			  addressLine2 varchar(218)	'$.addressLine2',
			  city varchar(128)			'$.city',
			  province varchar(128)		'$.province',
			  postalCode varchar(16)	'$.postalCode',
			  addressTypeId int			'$.addressType'
			  )
			  where addressTypeId = 1

			  select @addressId = max(Id) from @address
			  delete from @address where [Id] != @addressId

			  SELECT
			  PolicyNumber = isnull(polData.PolicyNumber, polData.PolicyNumber2)
			  ,MainMemberName = isnull(NewMemberName, MemberName)
			  ,a.AddressLine1
			  ,a.AddressLine2
			  ,a.City
			  ,a.Province
			  ,a.PostalCode
			  from OpenJson(SUBSTRING(@jsonData, 2, LEN(@jsonData)-2))
			  WITH(
			  MemberName nvarchar(64)    '$.mainMember.displayName',
			  NewMemberName nvarchar(64) '$.newMainMember.displayName',
			  PolicyNumber NVARCHAR(50)  '$.mainMember.policies[0].policyNumber',
			  PolicyNumber2 NVARCHAR(50) '$.mainMember.policyOwners[0].policyNumber'
			  ) as polData
			  left join @address a on a.Id = a.Id
			  END TRY
			  BEGIN CATCH
			  --TO DO: LOG ERROR
			  END CATCH
	end

END
