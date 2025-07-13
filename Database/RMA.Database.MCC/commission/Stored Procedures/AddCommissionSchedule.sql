create PROCEDURE [commission].[AddCommissionSchedule]
	   @ConfigID int,
	   @RunSchedule datetime,
	   @CommBatch  int,
       @Result varchar(255),
	   @PolicyCount  int
AS
BEGIN
Insert into  [commission].[CommSchedule]
values( 
	@ConfigID ,
	@RunSchedule,
	@CommBatch,
	@Result,
	@PolicyCount)

END