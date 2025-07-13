


--EXEC  POPI.USP_OnceoffFinalrunProcs
-- =============================================
-- Author:		RAM
-- Create date: 2021-09-20
-- Description:	POPI Automation Process
-- Process: (MaskingAllComputed) with Restoring the FK Constraints to all tables relate to Computed Tables

-- =============================================

CREATE PROCEDURE [POPI].[USP_OnceoffFinalrunProcs]
	-- Add the parameters for the stored procedure here
AS
BEGIN


SET NOCOUNT ON;

--EXEC  POPI.USP_OnceOffRecreateFKComputedTables
-- =============================================
-- Author:		RAM
-- Create date: 2021-09-20
-- Description:	POPI Automation Process
-- Process: (MaskingAllComputed) with Restoring the FK Constraints to all tables relate to Computed Tables

----------------------------------------Logins Creation--------------------------------------------------------

--USE [master]
--GO

--if not exists (select * from sys.syslogins where name='RMASensitive')
--CREATE LOGIN [RMASensitive] WITH PASSWORD=N'Password1', DEFAULT_DATABASE=[master], DEFAULT_LANGUAGE=[us_english], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF

--if not exists (select * from sys.syslogins where name='RMAPublic') 
--CREATE LOGIN [RMAPublic] WITH PASSWORD=N'Password1', DEFAULT_DATABASE=[master], DEFAULT_LANGUAGE=[us_english], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF

--if not exists (select * from sys.syslogins where name='RMAInternal') 
--CREATE LOGIN [RMAInternal] WITH PASSWORD=N'Password1', DEFAULT_DATABASE=[master], DEFAULT_LANGUAGE=[us_english], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF

--if not exists (select * from sys.syslogins where name='RMAConfidential') 
--CREATE LOGIN [RMAConfidential] WITH PASSWORD=N'Password1', DEFAULT_DATABASE=[master], DEFAULT_LANGUAGE=[us_english], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF

--------------------------------------------------- use the rele

--Declare @DbName varchar(50);

--if exists(select * from sys.databases where name = 'RMATest')
--	select @DbName=Name from sys.databases where name = 'RMATest'


--if exists(select * from sys.databases where name = 'RMAProd')
--	select @DbName=Name from sys.databases where name = 'RMAProd'

----Below is for new environment like CATE-------------------------------------
----if exists(select * from sys.databases where name = 'RMAProd')

--PRINT @DbName
--EXEC ('USE  [' + @DbName + ']')
--GO
---------------------------------------------POPI Schema creation----------------------------------

--IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'POPI')
--BEGIN
--EXEC('CREATE SCHEMA POPI')
--END

--GO

-------------------------------------------Create Logins---------------------------------------------------

-- Check SQL Server Login
--IF SUSER_ID('RMASensitive') IS NULL
--    CREATE LOGIN RMASensitive WITH PASSWORD = 'SomePassword';

-- Check database user
----IF USER_ID('RMASensitive') IS NULL
----    CREATE USER RMASensitive FOR LOGIN RMASensitive;

----IF USER_ID('RMAPublic') IS NULL
----    CREATE USER RMAPublic FOR LOGIN RMAPublic;

----IF USER_ID('RMAInternal') IS NULL
----    CREATE USER RMAInternal FOR LOGIN RMAInternal;

----IF USER_ID('RMAConfidential') IS NULL
----    CREATE USER RMAConfidential FOR LOGIN RMAConfidential;



----GRANT UNMASK TO [RMAConfidential];  -- Revoke (Remove) automatic access to unmask masked data for group\user
----GRANT UNMASK TO [RMASensitive];
----GRANT UNMASK TO [RMAPublic];
----GRANT UNMASK TO [RMAInternal];


----GRANT SELECT  TO [RMAPublic]; 
----GRANT SELECT  TO [RMAInternal];  
----GRANT SELECT  TO [RMAConfidential];  
----GRANT SELECT  TO [RMASensitive]; 

----GRANT EXECUTE  TO [RMAPublic]; 
----GRANT EXECUTE  TO [RMAInternal];  
----GRANT EXECUTE  TO [RMAConfidential];  
----GRANT EXECUTE  TO [RMASensitive]; 


----GRANT UNMASK TO [RMAConfidential];  -- Revoke (Remove) automatic access to unmask masked data for group\user
----GRANT UNMASK TO [RMASensitive];

----DENY UNMASK TO [RMAPublic];
----DENY UNMASK TO [RMAInternal];

---- Execute all SP's--------------------------------------------------------------------------

EXEC POPI.USP_AddDataclassificationEP;
EXEC POPI.USP_AddDataInformationTypeEP;
EXEC POPI.USP_AddRMAIsPOPIEP
EXEC POPI.USP_AddRMADataOwnerEP
EXEC POPI.USP_AddRMADataOwnerDepartmentEP
EXEC POPI.USP_AddRMADataSourceEP
EXEC POPI.USP_AddMaskingAllNonComputedTables
EXEC POPI.USP_OnceOffComputedTablesBackup
EXEC POPI.USP_OnceOffDropFkforComputedTables
EXEC POPI.USP_OnceOffDropCreateComputedTables
EXEC POPI.USP_OnceOffRestoringComputedTables
EXEC POPI.USP_OnceOffRecreateFKComputedTables

End