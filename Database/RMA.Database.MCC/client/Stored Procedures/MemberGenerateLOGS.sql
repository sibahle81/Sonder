CREATE procedure [client].[MemberGenerateLOGS]
	@rolePlayerId int, 
	@UserId int
As begin

--Declare @rolePlayerId int, 
--	@UserId int

--Set @rolePlayerId = 21079
--Set @UserId = 2935


Declare @userName varchar(50),
		@year varchar(10),
		@day varchar(10),
		@randonNo varchar(20),
		@certificateNo varchar(50)

Select @userName = Email From [security].[User] where Id= @UserID
select @year = YEAR(GETDATE())
select @day = DAY(GETDATE())
select @randonNo = FLOOR(RAND()*9999) + 99999

Select @certificateNo = @year + @day + 'S' + @randonNo

Insert into [client].[LetterOfGoodStanding](RolePlayerId,IssueDate,CertificateNo,CreatedBy,CreatedDate,ModifiedBy,ModifiedDate)
											values (@rolePlayerId,GETDATE(),@certificateNo,@userName,GETDATE(),@userName,GETDATE())

--print @certificateNo


End