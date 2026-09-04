package com.example.ui.social

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import java.util.UUID

data class ChatMessage(
    val id: String = "",
    val senderId: String = "",
    val senderName: String = "",
    val message: String = "",
    val timestamp: Long = System.currentTimeMillis()
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GlobalChatScreen(
    currentUserUid: String,
    currentUserName: String,
    onBack: () -> Unit
) {
    val firestore = FirebaseFirestore.getInstance()
    var messages by remember { mutableStateOf<List<ChatMessage>>(emptyList()) }
    var messageText by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        firestore.collection("global_chat")
            .orderBy("timestamp", Query.Direction.ASCENDING)
            .addSnapshotListener { snapshot, _ ->
                if (snapshot != null) {
                    messages = snapshot.documents.mapNotNull { it.toObject(ChatMessage::class.java) }
                }
            }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MinimalBlack)
            .statusBarsPadding()
            .testTag("global_chat_screen")
    ) {
        TopAppBar(
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MinimalBlack,
                titleContentColor = CinemaWhite
            ),
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = CinemaWhite)
                }
            },
            title = {
                Text(text = "Global Chat", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        )

        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            items(messages) { msg ->
                val isMe = msg.senderId == currentUserUid
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (isMe) Arrangement.End else Arrangement.Start
                ) {
                    Box(
                        modifier = Modifier
                            .background(
                                color = if (isMe) Color(0xFF1877F2) else Zinc800,
                                shape = RoundedCornerShape(12.dp)
                            )
                            .padding(10.dp)
                            .widthIn(max = 280.dp)
                    ) {
                        Column {
                            if (!isMe) {
                                Text(
                                    text = msg.senderName,
                                    color = Zinc400,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(bottom = 2.dp)
                                )
                            }
                            Text(
                                text = msg.message,
                                color = CinemaWhite,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
        }

        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            OutlinedTextField(
                value = messageText,
                onValueChange = { messageText = it },
                placeholder = { Text("Type a message...", color = Zinc500) },
                modifier = Modifier.weight(1f),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CinemaWhite,
                    unfocusedBorderColor = CinematicBorderSubtle,
                    focusedTextColor = CinemaWhite,
                    unfocusedTextColor = CinemaWhite,
                    focusedContainerColor = Zinc900,
                    unfocusedContainerColor = Zinc900
                ),
                shape = RoundedCornerShape(24.dp),
                maxLines = 3
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = {
                    if (messageText.isNotBlank()) {
                        val newMsg = ChatMessage(
                            id = UUID.randomUUID().toString(),
                            senderId = currentUserUid,
                            senderName = currentUserName.ifBlank { "Guest" },
                            message = messageText.trim(),
                            timestamp = System.currentTimeMillis()
                        )
                        firestore.collection("global_chat").document(newMsg.id).set(newMsg)
                        messageText = ""
                    }
                },
                modifier = Modifier
                    .size(48.dp)
                    .background(CinemaWhite, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.Send,
                    contentDescription = "Send",
                    tint = MinimalBlack
                )
            }
        }
    }
}
