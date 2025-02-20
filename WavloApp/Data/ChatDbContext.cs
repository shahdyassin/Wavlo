using Microsoft.EntityFrameworkCore;
using System;
using WavloApp.Models;

namespace WavloApp.Data
{
    public class ChatDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options)
        {

        }
    }
}
