


--EXEC  POPI.USP_AddNewColsPopiMaster
-- =============================================
-- Author:		RAM
-- Create date: 2022-01-07
-- Description:	POPI Automation Process
-- Process: Add New columns if the new tables added in compcare

-- =============================================

CREATE PROCEDURE [POPI].[USP_AddNewColsPopiMaster]
	@Table_schema varchar(20)
           ,@Table_Name varchar(50)
           ,@Column_Name varchar(50)
           ,@RMADataClassification varchar(20)
           ,@RMADataInformationType varchar(15)
           ,@RMAIsPOPI varchar(3)
           ,@DataSource varchar(20)
           ,@DataOwner varchar(50)
           ,@DataOwnerDepartment varchar(50)
AS
BEGIN


SET NOCOUNT ON;
INSERT INTO [dbo].[PopiMaster]
           ([Table_schema]
           ,[Table_Name]
           ,[Column_Name]
           ,[RMADataClassification]
           ,[RMADataInformationType]
           ,[RMAIsPOPI]
           ,[DataSource]
           ,[DataOwner]
           ,[DataOwnerDepartment])
     VALUES
           (@Table_schema 
           ,@Table_Name 
           ,@Column_Name 
           ,@RMADataClassification 
           ,@RMADataInformationType 
           ,@RMAIsPOPI 
           ,@DataSource 
           ,@DataOwner 
           ,@DataOwnerDepartment )

END