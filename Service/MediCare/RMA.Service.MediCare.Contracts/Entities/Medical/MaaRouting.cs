namespace RMA.Service.MediCare.Contracts.Entities.Medical
{
    public class MaaRouting
    {
        public int ItemId { get; set; }
        public int AssignToUserId { get; set; }
        public int AssignToRoleId { get; set; }
        public PreAuthorisation PreAuthorisation { get; set; }
    }
}
