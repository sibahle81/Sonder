-- =============================================
-- Author:		Phumlane Maseko
-- Description:	Insert GPA Policy Members
-- =============================================
CREATE PROCEDURE [Load].[InsertGPAMembers]
	-- Add the parameters for the stored procedure here
	@fileIdentifier uniqueidentifier,
	@productOptionId int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    -- Insert statements for procedure here
-- INSERT RECORDS INTO TABLE
INSERT INTO [Load].[GPAMembers]
            ([FileIdentifier]
           ,[ClientReference]
           ,[JoinDate]
           ,[IdTypeId]
           ,[IdNumber]
           ,[FirstName]
           ,[LastName]
           ,[DateOfBirth]
           ,[Gender]
           ,[Age]
           ,[JoinAge]
           ,[PolicyId]
           ,[PolicyNumber]
           ,[PolicyPremium]
           ,[PolicyCover]
           ,[RolePlayerId]
           ,[ProductOptionId]
           ,[BenefitId]
           ,[PolicyExists]
           ,[CelNo]
           ,[Email])
         SELECT DISTINCT 
		 gpa.[FileIdentifier]
		,trim(isnull(gpa.[ClientReference], '')) [ClientReference]
		,null [JoinDate]
        ,iif(isnull(gpa.[IdNumber], '') = '', 2, 1) [IdTypeId]
		,iif(isnull(gpa.[IdNumber], '') = '', gpa.[IdNumber], left(gpa.[IdNumber], 13)) [IdNumber]
           ,gpa.FirstName
           ,gpa.LastName
           ,gpa.DateOfBirth
           ,gpa.Gender
           ,-1 [Age]
           ,-1 [JoinAge]
			,0 [PolicyId]
           ,'' [PolicyNumber]
		,'0.00' [PolicyPremium]
		,'0.00' [PolicyCover]
		,0 [RolePlayerId]
		,@productOptionId
		,0 [BenefitId]
        ,0 [PolicyExists]
        ,gpa.[Cell] [Cell]
        ,gpa.[Email] [Email]
		FROM [Load].[GPA] gpa
		WHERE gpa.FileIdentifier = @fileIdentifier
END