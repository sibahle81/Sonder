
CREATE   PROCEDURE [Load].[InsertConsolidatedFuneralInsurance] @fileIdentifier uniqueidentifier
AS BEGIN

	--declare @fileIdentifier uniqueidentifier = '500AF3DA-CCE8-44DD-A3BE-BCEB51F10CE5'

	set nocount on

	delete from [Load].[ConsolidatedFuneralInsurance] where [FileIdentifier] = @fileIdentifier

	update [Load].[ConsolidatedFuneral] set [PreviousInsurerCoverAmount] = replace([PreviousInsurerCoverAmount], '.00', '') where [FileIdentifier] = @fileIdentifier and right([PreviousInsurerCoverAmount], 3) = '.00'

	insert into [Load].[ConsolidatedFuneralInsurance] ([FileIdentifier], [IdNumber], [PreviousInsurer], [PreviousInsurerPolicyNumber], [PreviousInsurerStartDate], [PreviousInsurerEndDate], [SumAssured])
	select @fileIdentifier [FileIdentifier], 
		iif(isnull([IdNumber], '') = '', 
			iif(isnull([IdNumber2], '') = '', 
				iif(isnull([IdNumber3], '') = '', 
					iif(isnull([IdNumber4], '') = '', 
						iif(isnull([IdNumber5], '') = '', 
							iif(isnull([IdNumber6], '') = '', 
								iif(isnull([IdNumber7], '') = '', 
									iif(isnull([IdNumber8], '') = '', 
										iif(isnull([IdNumber9], '') = '', 
											'', 
											[IdNumber9]
										), 
										[IdNumber8]
									), 
									[IdNumber7]
								), 
								[IdNumber6]
							), 
							[IdNumber5]
						), 
						[IdNumber4]
					), 
					[IdNumber3]
				), 
				[IdNumber2]
			), 
			[IdNumber]
		) [IdNumber],
		[PreviousInsurer],
		[PreviousInsurerPolicyNumber],
		[PreviousInsurerStartDate],
		iif(isnull([PreviousInsurerEndDate], '') = '', 
		dbo.ConvertToDate([JoinDate]), 
		dbo.ConvertToDate([PreviousInsurerEndDate])) [PreviousInsurerEndDate],
		floor([PreviousInsurerCoverAmount]) [PreviousInsurerCoverAmount]
	from (
		select iif(isnull(cf1.[IdNumber], '') = '', cf1.[PassportNumber], cf1.[IdNumber]) [IdNumber],
			cf1.[PreviousInsurer],
			cf1.[PreviousInsurerPolicyNumber],
			case isnumeric(cf1.[PreviousInsurerStartDate])
				when 1 then convert(datetime, cast(cf1.[PreviousInsurerStartDate] as int))
				else case isdate(cf1.[PreviousInsurerStartDate])
					when 1 then convert(datetime, cf1.[PreviousInsurerStartDate])
					else iif(charindex('/', cf1.[PreviousInsurerStartDate]) in (2, 3), 
						convert(datetime, cf1.[PreviousInsurerStartDate], 103), 
						null)
				end
			end [PreviousInsurerStartDate],
			case isnumeric(cf1.[PreviousInsurerEndDate])
				when 1 then convert(datetime, cast(cf1.[PreviousInsurerEndDate] as int))
				else case isdate(cf1.[PreviousInsurerEndDate])
					when 1 then convert(datetime, cf1.[PreviousInsurerEndDate])
					else iif(charindex('/', cf1.[PreviousInsurerEndDate]) in (2, 3), 
						convert(datetime, cf1.[PreviousInsurerEndDate], 103), 
						null)
				end
			end [PreviousInsurerEndDate],
			cf1.[PreviousInsurerCoverAmount],
			cf1.[JoinDate],
			iif(isnull(cf2.[IdNumber], '') = '', cf2.[PassportNumber], cf2.[IdNumber]) [IdNumber2],
			iif(isnull(cf3.[IdNumber], '') = '', cf3.[PassportNumber], cf3.[IdNumber]) [IdNumber3],
			iif(isnull(cf4.[IdNumber], '') = '', cf4.[PassportNumber], cf4.[IdNumber]) [IdNumber4],
			iif(isnull(cf5.[IdNumber], '') = '', cf5.[PassportNumber], cf5.[IdNumber]) [IdNumber5],
			iif(isnull(cf6.[IdNumber], '') = '', cf6.[PassportNumber], cf6.[IdNumber]) [IdNumber6],
			iif(isnull(cf7.[IdNumber], '') = '', cf7.[PassportNumber], cf7.[IdNumber]) [IdNumber7],
			iif(isnull(cf8.[IdNumber], '') = '', cf8.[PassportNumber], cf8.[IdNumber]) [IdNumber8],
			iif(isnull(cf9.[IdNumber], '') = '', cf9.[PassportNumber], cf9.[IdNumber]) [IdNumber9]
		from [Load].[ConsolidatedFuneral] cf1   
			left join [Load].[ConsolidatedFuneral] cf2   on cf2.Id = cf1.Id - 1
			left join [Load].[ConsolidatedFuneral] cf3   on cf3.Id = cf1.Id - 2
			left join [Load].[ConsolidatedFuneral] cf4   on cf4.Id = cf1.Id - 3
			left join [Load].[ConsolidatedFuneral] cf5   on cf5.Id = cf1.Id - 4
			left join [Load].[ConsolidatedFuneral] cf6   on cf6.Id = cf1.Id - 5
			left join [Load].[ConsolidatedFuneral] cf7   on cf7.Id = cf1.Id - 6
			left join [Load].[ConsolidatedFuneral] cf8   on cf8.Id = cf1.Id - 7
			left join [Load].[ConsolidatedFuneral] cf9   on cf9.Id = cf1.Id - 8
		where cf1.[FileIdentifier] = @fileIdentifier
		  and isnull(cf1.[PreviousInsurer], '') <> ''
	) t
	where [PreviousInsurerCoverAmount] > 0

	insert into [common].[PreviousInsurer] ([Id], [Name])
		select max(pin.Id) + t.[Rank] [Id],
			t.[PreviousInsurer] [Name]
		from [common].[PreviousInsurer] pin,
		(
			select distinct cfi.[PreviousInsurer],
				rank() over (order by cfi.[PreviousInsurer]) [Rank]
			from [Load].[ConsolidatedFuneralInsurance] cfi 
				left join [common].[PreviousInsurer] pin on pin.[Name] = cfi.[PreviousInsurer]
			where cfi.[FileIdentifier] = @fileIdentifier
			  and pin.[Id] is null
		) t
		group by t.[Rank],
			t.[PreviousInsurer]

	set nocount off
END