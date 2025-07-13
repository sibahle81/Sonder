
CREATE   PROCEDURE [Load].[InsuredLivesUpdateIsExisting] 
@fileIdentifier uniqueidentifier,
@Company varchar(50)
as begin

--declare @fileIdentifier uniqueidentifier,
--		@Company varchar(50)
--Set @fileIdentifier = 'F5B14948-7FA1-4778-B876-298CFFA07D94'
--Set @Company = 'TE002158'

declare @existingCount Int
declare @existingData table (
		MemberNumber varchar(100),
		FirstName varchar(100),
		LastName varchar(100),
		Passport varchar(100),
		IDNumber varchar(100)
		)

INSERT INTO @existingData (MemberNumber,FirstName, LastName ,Passport ,IDNumber)
SELECT @Company, FirstName, Surname, Passport, IDNumber FROM [Load].[insuredLives] where MemberNumber = @Company And UploadVersion = 1

	Set @existingCount = (select count(Id) from [Load].[InsuredLives] where MemberNumber = @Company And UploadVersion Is Not Null)

	If @existingCount > 0
		Begin
			update p set p.UploadVersion = 1
			from [Load].[insuredLives] p
				inner join  @existingData IL On p.FirstName = IL.FirstName AND p.Surname = IL.LastName

			update [Load].[insuredLives]
			set UploadVersion = 2
			where FileIdentifier = @fileIdentifier
			And UploadVersion is null or UploadVersion <> 1
			--and Id = (SELECT MAX(id) from [Load].[insuredLives] where FileIdentifier = @fileIdentifier And MemberNumber = @Company and UploadVersion is null)
		End
	Else
		Begin
			update [Load].[insuredLives] set UploadVersion = 1 where FileIdentifier = @fileIdentifier
			update [Load].[insuredLives] set IsExisting = 1 where FileIdentifier = @fileIdentifier
		End

	--update [Load].[insuredLives] set IsExisting = 1
	--where Id in (
	--	SELECT t1.Id
	--	FROM [Load].[insuredLives] t1
	--	Inner join [Load].[insuredLives] t2 on t1.FirstName = t2.FirstName 
	--											And t1.Surname = t2.Surname 
	--	where t1.FileIdentifier = @fileIdentifier
	--	And t1.MemberNumber = @Company
	--	GROUP BY t1.Id
	--	HAVING COUNT(*) >1) 

end