package com.example.ui.social

import android.app.Activity
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.VerifiedBadge
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.CinematicBorderSubtle
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

data class FriendItem(
  val id: String,
  val username: String,
  val name: String,
  val status: String,
  val isVerified: Boolean,
  val isOnline: Boolean,
  val lastMessage: String,
  val time: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FriendsChatScreen(
  onOpenGlobalChat: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  val auth = FirebaseAuth.getInstance()
  val currentUser = auth.currentUser
  val firestore = FirebaseFirestore.getInstance()
  val context = LocalContext.current

  var searchQuery by remember { mutableStateOf("") }
  var friendsList by remember { mutableStateOf<List<FriendItem>>(emptyList()) }
  var isLoadingFriends by remember { mutableStateOf(false) }

  var showAddFriendDialog by remember { mutableStateOf(false) }
  var friendIdInput by remember { mutableStateOf("") }

  LaunchedEffect(currentUser?.uid) {
    val uid = currentUser?.uid ?: return@LaunchedEffect
    isLoadingFriends = true
    try {
      firestore.collection("users").document(uid).collection("friends")
        .addSnapshotListener { snapshot, error ->
          isLoadingFriends = false
          if (snapshot != null) {
            val list = snapshot.documents.map { doc ->
              FriendItem(
                id = doc.id,
                username = doc.getString("username") ?: "user",
                name = doc.getString("name") ?: doc.getString("username") ?: "Unknown User",
                status = doc.getString("status") ?: "Offline",
                isVerified = doc.getBoolean("isVerified") ?: false,
                isOnline = doc.getBoolean("isOnline") ?: false,
                lastMessage = doc.getString("lastMessage") ?: "No messages yet",
                time = doc.getString("time") ?: ""
              )
            }
            friendsList = list
          }
        }
    } catch (_: Exception) {
      isLoadingFriends = false
    }
  }

  Scaffold(
    containerColor = MinimalBlack,
    topBar = {
      TopAppBar(
        colors = TopAppBarDefaults.topAppBarColors(
          containerColor = MinimalBlack,
          titleContentColor = CinemaWhite
        ),
        title = {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Default.People,
              contentDescription = null,
              tint = CinemaWhite,
              modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(text = "Friends & Chat", fontWeight = FontWeight.Bold, fontSize = 18.sp)
          }
        },
        actions = {
          IconButton(onClick = { showAddFriendDialog = true }) {
            Icon(imageVector = Icons.Default.Add, contentDescription = "Add Friend", tint = CinemaWhite)
          }
        }
      )
    },
    modifier = modifier.testTag("friends_chat_screen")
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .padding(horizontal = 20.dp)
    ) {
      // Search Input
      OutlinedTextField(
        value = searchQuery,
        onValueChange = { searchQuery = it },
        placeholder = { Text("Search friends...", color = Zinc500, fontSize = 13.sp) },
        leadingIcon = { Icon(imageVector = Icons.Default.Search, contentDescription = null, tint = Zinc400) },
        colors = OutlinedTextFieldDefaults.colors(
          focusedBorderColor = CinemaWhite,
          unfocusedBorderColor = CinematicBorderSubtle,
          focusedTextColor = CinemaWhite,
          unfocusedTextColor = CinemaWhite,
          focusedContainerColor = Zinc900,
          unfocusedContainerColor = Zinc900
        ),
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("search_friends_input")
      )

      Spacer(modifier = Modifier.height(16.dp))

      Text(
        text = "COMMUNITY & DIRECT MESSAGES",
        color = Zinc500,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.2.sp
      )

      Spacer(modifier = Modifier.height(10.dp))

      LazyColumn(
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxSize()
      ) {
        // Global Community Chat Card (Always shown)
        val filteredFriends = friendsList.filter {
          searchQuery.isEmpty() || it.name.contains(searchQuery, ignoreCase = true) || it.username.contains(searchQuery, ignoreCase = true)
        }

        if (isLoadingFriends) {
          item {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .padding(40.dp),
              contentAlignment = Alignment.Center
            ) {
              CircularProgressIndicator(color = CinemaWhite, strokeWidth = 2.dp)
            }
          }
        } else if (filteredFriends.isEmpty()) {
          item {
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 48.dp, horizontal = 16.dp),
              horizontalAlignment = Alignment.CenterHorizontally,
              verticalArrangement = Arrangement.Center
            ) {
              Icon(
                imageVector = Icons.Default.People,
                contentDescription = null,
                tint = Zinc500,
                modifier = Modifier.size(72.dp)
              )
              Spacer(modifier = Modifier.height(16.dp))
              Text(
                text = if (searchQuery.isNotEmpty()) "No matching friends found" else "No friends connected yet",
                color = CinemaWhite,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                textAlign = TextAlign.Center
              )
              Spacer(modifier = Modifier.height(6.dp))
              Text(
                text = if (searchQuery.isNotEmpty()) "Try searching for another username" else "Click the '+' button in the top-right corner to add your friends by their Unique ID.",
                color = Zinc400,
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 24.dp)
              )
            }
          }
        } else {
          items(filteredFriends) { friend ->
            Surface(
              color = Zinc900,
              shape = RoundedCornerShape(16.dp),
              border = BorderStroke(1.dp, CinematicBorderSubtle),
              modifier = Modifier
                .fillMaxWidth()
                .clickable { }
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                // Avatar with Online Dot
                Box {
                  Box(
                    modifier = Modifier
                      .size(46.dp)
                      .clip(CircleShape)
                      .background(Zinc800)
                      .border(1.dp, CinematicBorderSubtle, CircleShape),
                    contentAlignment = Alignment.Center
                  ) {
                    Text(
                      text = friend.name.take(1).uppercase(),
                      color = CinemaWhite,
                      fontWeight = FontWeight.Bold,
                      fontSize = 18.sp
                    )
                  }
                  if (friend.isOnline) {
                    Box(
                      modifier = Modifier
                        .size(12.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF4CAF50))
                        .border(2.dp, MinimalBlack, CircleShape)
                        .align(Alignment.BottomEnd)
                    )
                  }
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                  Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                      text = friend.name,
                      color = CinemaWhite,
                      fontWeight = FontWeight.Bold,
                      fontSize = 15.sp
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    VerifiedBadge(isVerified = friend.isVerified, size = 15.dp)
                  }
                  Text(
                    text = friend.lastMessage,
                    color = Zinc400,
                    fontSize = 12.sp,
                    maxLines = 1
                  )
                }

                if (friend.time.isNotBlank()) {
                  Spacer(modifier = Modifier.width(8.dp))
                  Text(
                    text = friend.time,
                    color = Zinc500,
                    fontSize = 10.sp
                  )
                }
              }
            }
          }
        }
      }
    }
  }

  // ADD FRIEND DIALOG
  if (showAddFriendDialog) {
    var isSearching by remember { mutableStateOf(false) }
    var searchError by remember { mutableStateOf<String?>(null) }

    AlertDialog(
      onDismissRequest = {
        showAddFriendDialog = false
        friendIdInput = ""
        searchError = null
      },
      containerColor = Zinc900,
      shape = RoundedCornerShape(20.dp),
      title = {
        Text(text = "Add Friend", color = CinemaWhite, fontWeight = FontWeight.Bold, fontSize = 18.sp)
      },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text(text = "Enter your friend's UNIQUE ID:", color = Zinc400, fontSize = 13.sp)
          OutlinedTextField(
            value = friendIdInput,
            onValueChange = { input ->
              friendIdInput = input.uppercase() // Automatically enforce uppercase typing
            },
            placeholder = { Text("E.G., USER_UID", color = Zinc500) },
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = CinemaWhite,
              unfocusedBorderColor = CinematicBorderSubtle,
              focusedTextColor = CinemaWhite,
              unfocusedTextColor = CinemaWhite,
              focusedContainerColor = MinimalBlack,
              unfocusedContainerColor = MinimalBlack
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
          )
          if (searchError != null) {
            Text(text = searchError!!, color = Color(0xFFD32F2F), fontSize = 12.sp)
          }
        }
      },
      confirmButton = {
        Button(
          onClick = {
            if (friendIdInput.isBlank()) {
              searchError = "ID cannot be empty"
              return@Button
            }
            val currentUid = currentUser?.uid
            if (currentUid == null) {
              searchError = "You must be logged in"
              return@Button
            }
            if (currentUid == friendIdInput.trim()) {
              searchError = "You cannot add yourself"
              return@Button
            }
            isSearching = true
            searchError = null
            firestore.collection("users").document(friendIdInput.trim()).get()
              .addOnSuccessListener { doc ->
                if (doc.exists()) {
                  val username = doc.getString("username") ?: "user"
                  val fName = doc.getString("firstName").orEmpty()
                  val lName = doc.getString("lastName").orEmpty()
                  val name = if (fName.isNotBlank() || lName.isNotBlank()) "$fName $lName".trim() else username
                  val isVerified = doc.getBoolean("isVerified") ?: false

                  val friendData = mapOf(
                    "username" to username,
                    "name" to name,
                    "isVerified" to isVerified,
                    "status" to "Offline",
                    "isOnline" to false,
                    "lastMessage" to "No messages yet",
                    "time" to ""
                  )

                  firestore.collection("users").document(currentUid)
                    .collection("friends").document(friendIdInput.trim()).set(friendData)
                    .addOnSuccessListener {
                      showAddFriendDialog = false
                      friendIdInput = ""
                      Toast.makeText(context, "Friend added successfully!", Toast.LENGTH_SHORT).show()
                    }
                    .addOnFailureListener { e ->
                      isSearching = false
                      searchError = "Failed to save: ${e.localizedMessage}"
                    }
                } else {
                  isSearching = false
                  searchError = "User ID not found in Veylora"
                }
              }
              .addOnFailureListener { e ->
                isSearching = false
                searchError = "Search failed: ${e.localizedMessage}"
              }
          },
          enabled = !isSearching,
          colors = ButtonDefaults.buttonColors(containerColor = CinemaWhite, contentColor = MinimalBlack),
          shape = RoundedCornerShape(10.dp)
        ) {
          if (isSearching) {
            CircularProgressIndicator(color = MinimalBlack, modifier = Modifier.size(18.dp))
          } else {
            Text(text = "Add Friend", fontWeight = FontWeight.Bold)
          }
        }
      },
      dismissButton = {
        TextButton(
          onClick = {
            showAddFriendDialog = false
            friendIdInput = ""
            searchError = null
          }
        ) {
          Text(text = "Cancel", color = Zinc400)
        }
      }
    )
  }
}
