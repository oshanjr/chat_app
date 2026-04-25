package com.chatapp.entity;

import javax.persistence.*;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Chat")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int chatId;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "timestamp", nullable = false, updatable = false, insertable = false, columnDefinition="TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Date timestamp;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "ChatParticipants",
        joinColumns = @JoinColumn(name = "chatId"),
        inverseJoinColumns = @JoinColumn(name = "userId")
    )
    private Set<User> participants = new HashSet<>();

    public Chat() {}

    public int getChatId() { return chatId; }
    public void setChatId(int chatId) { this.chatId = chatId; }

    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }

    public Set<User> getParticipants() { return participants; }
    public void setParticipants(Set<User> participants) { this.participants = participants; }
}
