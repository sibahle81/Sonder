
ALTER ROLE [db_owner] ADD MEMBER [RMA\RMADevServerAccess];
GO

ALTER ROLE [db_datawriter] ADD MEMBER [RMA\RMATestingTeamSQLServerAccess];

GO
 
ALTER ROLE [db_datareader] ADD MEMBER [RMA\RMATestServerAccess];


GO
ALTER ROLE [db_datareader] ADD MEMBER [RMA\RMATestingTeamSQLServerAccess];




