﻿namespace WavloApp.Models
{
    public class Chat
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
