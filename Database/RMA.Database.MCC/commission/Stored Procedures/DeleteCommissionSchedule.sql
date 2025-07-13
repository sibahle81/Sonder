create PROCEDURE [commission].[DeleteCommissionSchedule]
	   @ID int
AS
BEGIN
delete from  [commission].[CommSchedule]
where ID = @ID

END