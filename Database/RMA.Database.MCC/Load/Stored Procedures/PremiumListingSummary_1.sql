CREATE PROCEDURE [Load].[PremiumListingSummary] @fileIdentifier uniqueidentifier
as begin

	-- declare @fileIdentifier uniqueidentifier = '5C8958F8-79FD-43CA-A10D-460D24DBB2BF'

	-- Get the totals for imported policies as well as policies already in the system not included in the file
	declare @policies table (
		FileIdentifier uniqueidentifier primary key,
		NewUsers int,
		TotalNew float,
		UpdatedUsers int,
		TotalUpdate float,
		DeletedUsers int,
		TotalDelete float,
		TotalUsers int,
		Total float
	)
	insert into @policies values (@fileIdentifier, 0, 0, 0, 0, 0, 0, 0, 0)
	-- Add new policies
	update p set p.[NewUsers] = isnull(t.[Policies], 0),
		         p.[TotalNew] = isnull(t.[Premium], 0)
	from @policies p
		inner join (
			select m.[FileIdentifier], 
				count(*) [Policies], 
				sum([PolicyPremium] * [Multiplier]) [Premium]
			from @policies p inner join [Load].[PremiumListingMember] m on m.[FileIdentifier] = p.[FileIdentifier]
			where m.[CoverMemberTypeId] < 10 and m.[PolicyExists] = 0
			group by m.[FileIdentifier]
		) t on t.[FileIdentifier] = p.[FileIdentifier]


	-- Add existing policies included in the file
	update p set p.[UpdatedUsers] = isnull(t.[Policies], 0),
		         p.[TotalUpdate] = isnull(t.[Premium], 0)
	from @policies p
		inner join (
			select m.[FileIdentifier], 
				count(*) [Policies], 
				sum([PolicyPremium] * [Multiplier]) [Premium]
			from @policies p inner join [Load].[PremiumListingMember] m on m.[FileIdentifier] = p.[FileIdentifier]
			where m.[CoverMemberTypeId] < 10 and m.[PolicyExists] = 1
			group by m.[FileIdentifier]
		) t on t.[FileIdentifier] = p.[FileIdentifier]

	update @policies set
		TotalUsers = NewUsers + UpdatedUsers,
		Total = TotalNew + TotalUpdate

	select [NewUsers], [TotalNew], [UpdatedUsers], [TotalUpdate], [DeletedUsers], [TotalDelete], [TotalUsers], [Total]
	from @policies

end
