CREATE PROCEDURE [claim].[ScheduleNextScheduleTask]
	@ScheduledTaskTypeId INT
AS
BEGIN
  
  UPDATE scheduledTask.ScheduledTaskType Set IsEnabled = 1 WHERE [ScheduledTaskTypeId] = @ScheduledTaskTypeId
  UPDATE [scheduledTask].[ScheduledTask] SET ScheduledDate = GetDate() WHERE [ScheduledTaskTypeId] = @ScheduledTaskTypeId

END