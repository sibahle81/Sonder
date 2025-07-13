CREATE TABLE [legal].[MeetingAttendies] (
    [Id]           INT           IDENTITY (1, 1) NOT NULL,
    [MeetingId]    INT           NOT NULL,
    [UserId]       INT           NULL,
    [EmailId]      VARCHAR (150) NOT NULL,
    [IsAttended]   BIT           NULL,
    [ClaimForm]    VARCHAR (500) NULL,
    [IsActive]     BIT           DEFAULT ((1)) NOT NULL,
    [IsDeleted]    BIT           NOT NULL,
    [CreatedBy]    VARCHAR (100) NOT NULL,
    [CreatedDate]  DATETIME      NOT NULL,
    [ModifiedBy]   VARCHAR (100) NOT NULL,
    [ModifiedDate] DATETIME      NOT NULL,
    CONSTRAINT [PK_MeetingAttendies] PRIMARY KEY CLUSTERED ([Id] ASC)
);

