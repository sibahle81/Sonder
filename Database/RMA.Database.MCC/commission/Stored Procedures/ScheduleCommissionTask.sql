CREATE PROCEDURE [commission].[ScheduleCommissionTask]
	   @ScheduledTaskId int,
	   @ScheduledTaskTypeId int,
	   @TaskScheduleFrequencyId int,
	   @ScheduledDate datetime,
	   @LastRun datetime,
	   @LastRunDurationSeconds  int,
       @LastStatus varchar(255),
       @HostName varchar(255),
       @LastReason varchar(255),
       @DateTimeLockedToHost datetime,
	   @NumberOfRetriesRemaining int,
	   @Priority  int
AS
BEGIN
UPDATE [scheduledTask].[ScheduledTask]
SET 
	ScheduledTaskTypeId = @ScheduledTaskTypeId ,
	TaskScheduleFrequencyId = @TaskScheduleFrequencyId ,
	ScheduledDate =  @ScheduledDate,
	LastRun = @LastRun,
	LastRunDurationSeconds = @LastRunDurationSeconds,
	LastStatus = @LastStatus,
	HostName = @HostName,
	LastReason = @LastReason,
	DateTimeLockedToHost = @DateTimeLockedToHost,
	NumberOfRetriesRemaining  = @NumberOfRetriesRemaining,
	[Priority] = @Priority
WHERE
       ScheduledTaskId = @ScheduledTaskId
END