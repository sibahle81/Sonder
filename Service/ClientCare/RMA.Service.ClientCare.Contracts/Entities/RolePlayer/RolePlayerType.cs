using RMA.Service.ClientCare.Contracts.Entities.Policy;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerType
    {
        public int RolePlayerTypeId { get; set; }
        public string Name { get; set; }
        public bool IsPolicy { get; set; }
        public bool IsClaim { get; set; }
        public bool IsRelation { get; set; }
        public System.Collections.Generic.ICollection<ChildCover> ChildCovers { get; set; }
    }
}
