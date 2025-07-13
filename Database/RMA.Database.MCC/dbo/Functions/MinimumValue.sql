CREATE FUNCTION [dbo].[MinimumValue](@a int, @b int, @c int)
RETURNS INT AS
BEGIN
  declare @min int
  set @min = @a
  if @b < @min set @min = @b
  if @c < @min set @min = @c
  return @min
END
GO