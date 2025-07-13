
-- =============================================
-- Author:		Michael ngongoma
-- Create date: 16 Nov 2022
-- Description:	RolePlayerBatchInfoUpdate
-- =============================================
CREATE PROCEDURE [onboarding].[RolePlayerBatchInfoUpdate]
	 @batchId int
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	--select * from [AZD-MCC_BrokerPortal].[onboarding].[client_update]
	update [AZD-MCC_BrokerPortal].[onboarding].[client_update]
	set update_date = GETDATE(), numberofpoliciesfound = 76
	where batch_id = @batchId;

	PRINT 'WORK WILL START HERE';
	 
END