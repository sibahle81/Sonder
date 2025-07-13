namespace RMA.Common.Database.Contracts.Repository
{
    public interface IHashedEntity
    {
        string HashValue { get; set; }
        void SetHashValue();
    }
}