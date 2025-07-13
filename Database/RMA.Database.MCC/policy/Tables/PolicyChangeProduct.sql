CREATE TABLE [policy].[PolicyChangeProduct] (
    [PolicyChangeProductId] INT          IDENTITY (1, 1) NOT NULL,
    [PolicyId]              INT          NOT NULL,
    [EffectiveDate]         DATE         NOT NULL,
    [ProductOptionId]       INT          NOT NULL,
    [PolicyChangeStatusId]  INT          NOT NULL,
    [IsDeleted]             BIT          DEFAULT ((0)) NOT NULL,
    [CreatedBy]             VARCHAR (50) NOT NULL,
    [CreatedDate]           DATETIME     DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]            VARCHAR (50) NOT NULL,
    [ModifiedDate]          DATETIME     DEFAULT (getdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([PolicyChangeProductId] ASC),
    CONSTRAINT [FK_PolicyChangeProduct_Policy] FOREIGN KEY ([PolicyId]) REFERENCES [policy].[Policy] ([PolicyId]),
    CONSTRAINT [FK_PolicyChangeProduct_PolicyChangeStatus] FOREIGN KEY ([PolicyChangeStatusId]) REFERENCES [common].[PolicyChangeStatus] ([Id]),
    CONSTRAINT [FK_PolicyChangeProduct_ProductOption] FOREIGN KEY ([ProductOptionId]) REFERENCES [product].[ProductOption] ([Id])
);




GO


