using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;

namespace WavloApp.Models
{
    public class Chat
    {
        public int Id { get; set; }
       
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        [ValidateNever]
        public User User { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
