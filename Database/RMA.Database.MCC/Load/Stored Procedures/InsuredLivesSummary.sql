CREATE   PROCEDURE [Load].[InsuredLivesSummary] @fileIdentifier uniqueidentifier
as begin

--declare @fileIdentifier uniqueidentifier
--Set @fileIdentifier = '68A75066-A56A-4A5D-92D4-8B817D4B62B4'

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

	update p set p.[NewUsers] = t.UploadVersion,
		         p.[TotalNew] = isnull(t.[Premium], 0)
	from @policies p
		inner join (
			select IL.[FileIdentifier], 
				count(*) UploadVersion, 
				0 [Premium]
			from [Load].[InsuredLives] IL 
			where IL.UploadVersion = 1
			group by IL.[FileIdentifier]
		) t on t.[FileIdentifier] = p.[FileIdentifier] 


	update p set p.[UpdatedUsers] = t.UploadVersion,
		         p.[TotalUpdate] = isnull(t.[Premium], 0)
	from @policies p
		inner join (
			select IL.[FileIdentifier], 
				count(*) UploadVersion, 
				0 [Premium]
			from [Load].[InsuredLives] IL 
			where IL.UploadVersion <> 1
			group by IL.[FileIdentifier]
		) t on t.[FileIdentifier] = p.[FileIdentifier] 

	update @policies set [TotalUsers] = [NewUsers] + [UpdatedUsers] - [DeletedUsers] where [FileIdentifier] = @fileIdentifier

	select [NewUsers], [TotalNew], [UpdatedUsers], [TotalUpdate], [DeletedUsers], [TotalDelete], [TotalUsers], [Total]
	from @policies

end