package com.example.ui.social

import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ui.components.VerifiedBadge
import com.example.ui.settings.SOCIAL_PLATFORMS
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.CinematicBorderSubtle
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

data class SavedWatchlistItem(
  val id: String,
  val title: String,
  val posterUrl: String,
  val rating: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DigitalProfileCardScreen(
  modifier: Modifier = Modifier
) {
  val auth = FirebaseAuth.getInstance()
  val firestore = FirebaseFirestore.getInstance()
  val currentUser = auth.currentUser
  val context = LocalContext.current

  var username by remember { mutableStateOf("") }
  var fullName by remember { mutableStateOf("") }
  var isVerified by remember { mutableStateOf(false) }
  var country by remember { mutableStateOf("") }
  var veyloraId by remember { mutableStateOf("") }
  var socialLinks by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
  var watchlistItems by remember { mutableStateOf<List<SavedWatchlistItem>>(emptyList()) }
  var isLoading by remember { mutableStateOf(true) }

  // Gaming ratings progress stats
  var totalRatingsCount by remember { mutableStateOf(0) }
  var userGamingLevel by remember { mutableStateOf("Tier 1: Cinephile Rookie") }
  var ratingsProgress by remember { mutableStateOf(0.15f) }

  LaunchedEffect(currentUser?.uid) {
    val uid = currentUser?.uid
    if (uid != null) {
      isLoading = true
      try {
        val doc = firestore.collection("users").document(uid).get().await()
        if (doc.exists()) {
          val fName = doc.getString("firstName").orEmpty()
          val lName = doc.getString("lastName").orEmpty()
          fullName = if (fName.isNotBlank() || lName.isNotBlank()) "$fName $lName".trim() else (currentUser.displayName ?: "Veylora Member")
          username = doc.getString("username") ?: currentUser.email?.substringBefore("@").orEmpty()
          country = doc.getString("country") ?: "United States"
          isVerified = doc.getBoolean("isVerified") ?: currentUser.isEmailVerified
          
          var fetchedId = doc.getString("veyloraId")
          if (fetchedId.isNullOrBlank()) {
            fetchedId = java.util.UUID.randomUUID().toString().replace("-", "").take(7).uppercase()
            firestore.collection("users").document(uid).update("veyloraId", fetchedId).await()
          }
          veyloraId = fetchedId

          @Suppress("UNCHECKED_CAST")
          socialLinks = (doc.get("socialLinks") as? Map<String, String>) ?: emptyMap()
        } else {
          fullName = currentUser.displayName ?: "Veylora Member"
          username = currentUser.email?.substringBefore("@").orEmpty()
          country = "United States"
          isVerified = currentUser.isEmailVerified
          veyloraId = java.util.UUID.randomUUID().toString().replace("-", "").take(7).uppercase()
          firestore.collection("users").document(uid).set(mapOf("veyloraId" to veyloraId), com.google.firebase.firestore.SetOptions.merge()).await()
        }

        // Fetch total ratings count
        try {
          val ratingsDocs = firestore.collection("users").document(uid).collection("ratings").get().await()
          val count = ratingsDocs.size()
          totalRatingsCount = count
          when {
            count >= 20 -> {
              userGamingLevel = "Tier 4: Legendary Director"
              ratingsProgress = 1.0f
            }
            count >= 10 -> {
              userGamingLevel = "Tier 3: Movie Maestro"
              ratingsProgress = 0.7f
            }
            count >= 3 -> {
              userGamingLevel = "Tier 2: Film Critic"
              ratingsProgress = 0.4f
            }
            else -> {
              userGamingLevel = "Tier 1: Cinephile Rookie"
              ratingsProgress = 0.15f
            }
          }
        } catch (_: Exception) {
          totalRatingsCount = 0
          userGamingLevel = "Tier 1: Cinephile Rookie"
          ratingsProgress = 0.15f
        }

        // Fetch user watchlist from Firestore
        val favDocs = firestore.collection("users").document(uid).collection("favorites").get().await()
        watchlistItems = favDocs.documents.map { d ->
          SavedWatchlistItem(
            id = d.id,
            title = d.getString("title") ?: d.getString("name") ?: "Saved Media",
            posterUrl = d.getString("posterPath") ?: d.getString("posterUrl") ?: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80",
            rating = d.getDouble("rating")?.toString() ?: "8.5"
          )
        }
        if (watchlistItems.isEmpty()) {
          watchlistItems = listOf(
            SavedWatchlistItem("1", "Dune: Part Two", "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80", "8.6"),
            SavedWatchlistItem("2", "Interstellar", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80", "8.7"),
            SavedWatchlistItem("3", "Cyberpunk 2077", "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80", "9.0")
          )
        }
      } catch (_: Exception) {
        fullName = currentUser?.displayName ?: "Veylora Member"
        username = currentUser?.email?.substringBefore("@").orEmpty()
        isVerified = currentUser?.isEmailVerified == true
      } finally {
        isLoading = false
      }
    } else {
      fullName = "Guest Member"
      username = "guest"
      isLoading = false
    }
  }

  val activePlatforms = remember(socialLinks) {
    SOCIAL_PLATFORMS.filter { socialLinks[it.id]?.isNotBlank() == true }
  }

  val sharePassIntent = {
    val sendIntent: Intent = Intent().apply {
      action = Intent.ACTION_SEND
      putExtra(Intent.EXTRA_TEXT, "Check out my Veylora Digital ID Pass: https://veylora.app/user/@${username.ifBlank { "member" }}")
      type = "text/plain"
    }
    val shareIntent = Intent.createChooser(sendIntent, "Share Veylora Pass")
    context.startActivity(shareIntent)
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
              imageVector = Icons.Default.Badge,
              contentDescription = null,
              tint = CinemaWhite,
              modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(text = "Digital Profile Card", fontWeight = FontWeight.Bold, fontSize = 18.sp)
          }
        },
        actions = {
          IconButton(onClick = sharePassIntent) {
            Icon(imageVector = Icons.Default.Share, contentDescription = "Share Card", tint = CinemaWhite)
          }
        }
      )
    },
    modifier = modifier.testTag("digital_profile_card_screen")
  ) { paddingValues ->
    if (isLoading) {
      Box(modifier = Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = CinemaWhite, strokeWidth = 2.5.dp)
      }
    } else {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(paddingValues)
          .verticalScroll(rememberScrollState())
          .padding(horizontal = 20.dp, vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp)
      ) {
        // VIP HOLOGRAPHIC DIGITAL PASS CONTAINER (Landscape Credit Card Layout)
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1.58f)
            .clip(RoundedCornerShape(20.dp))
            .background(
              Brush.linearGradient(
                colors = listOf(
                  Color.White.copy(alpha = 0.12f),
                  Color.White.copy(alpha = 0.02f)
                )
              )
            )
            .border(
              1.dp,
              Color.White.copy(alpha = 0.15f),
              RoundedCornerShape(20.dp)
            )
            .padding(18.dp)
        ) {
          Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
          ) {
            // 1. Top Row: Avatar and Membership ID
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Box(
                modifier = Modifier
                  .size(40.dp)
                  .clip(CircleShape)
                  .border(1.5.dp, Color.White.copy(alpha = 0.4f), CircleShape)
              ) {
                AsyncImage(
                  model = currentUser?.photoUrl ?: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
                  contentDescription = "Avatar",
                  contentScale = ContentScale.Crop,
                  modifier = Modifier.fillMaxSize()
                )
              }
              Text(
                text = "ID: #${(currentUser?.uid ?: "GUEST").take(8).uppercase()}",
                color = CinemaWhite.copy(alpha = 0.8f),
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                letterSpacing = 1.sp
              )
            }

            // 2. Middle Section: Full Name and Username/Location
            Column(
              modifier = Modifier.fillMaxWidth()
            ) {
              Text(
                text = fullName,
                color = CinemaWhite,
                fontWeight = FontWeight.Black,
                fontSize = 20.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "@${username.ifBlank { "member" }} • $country",
                color = Zinc400,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
              )
            }

            // 3. Bottom Row: Level Tier / Progress
            Column(
              modifier = Modifier.fillMaxWidth(),
              verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Text(
                  text = "Level 5 Elite VIP",
                  color = Color(0xFFFFD700), // Gold Tier
                  fontWeight = FontWeight.Bold,
                  fontSize = 11.sp
                )
                Text(
                  text = "85% XP",
                  color = Zinc400,
                  fontSize = 10.sp,
                  fontWeight = FontWeight.Bold
                )
              }
              // Progress Bar
              Box(
                modifier = Modifier
                  .fillMaxWidth()
                  .height(4.dp)
                  .clip(RoundedCornerShape(2.dp))
                  .background(Color.White.copy(alpha = 0.15f))
              ) {
                Box(
                  modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(0.85f)
                    .clip(RoundedCornerShape(2.dp))
                    .background(
                      Brush.linearGradient(
                        colors = listOf(Color(0xFF6001D2), Color(0xFFFF47A9))
                      )
                    )
                )
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // CONNECTED SOCIAL ACCOUNTS GRID
        Text(
          text = "CONNECTED HANDLES",
          color = Zinc500,
          fontSize = 10.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.5.sp,
          modifier = Modifier.align(Alignment.Start)
        )

            Spacer(modifier = Modifier.height(8.dp))

            if (activePlatforms.isEmpty()) {
              Text(
                text = "No social links connected. Add them in Settings > Edit Profile.",
                color = Zinc500,
                fontSize = 11.sp,
                modifier = Modifier.align(Alignment.Start)
              )
            } else {
              LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
              ) {
                items(activePlatforms) { platform ->
                  val rawUrl = socialLinks[platform.id].orEmpty()
                  val displayHandle = rawUrl.substringAfterLast("/").substringBefore("?").replace("@", "")

                  val brush = when (platform.id) {
                    "tiktok" -> androidx.compose.ui.graphics.Brush.linearGradient(listOf(Color(0xFF00F2FE), Color.Black, Color(0xFFFE0979)))
                    "facebook" -> androidx.compose.ui.graphics.Brush.linearGradient(listOf(Color(0xFF1877F2), Color(0xFF1877F2)))
                    else -> androidx.compose.ui.graphics.Brush.linearGradient(listOf(platform.brandColor, platform.brandColor.copy(alpha = 0.8f)))
                  }

                  Box(
                    modifier = Modifier
                      .clip(RoundedCornerShape(12.dp))
                      .background(brush)
                  ) {
                    Row(
                      verticalAlignment = Alignment.CenterVertically,
                      modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                      if (platform.iconRes != null) {
                        Icon(
                          painter = painterResource(id = platform.iconRes),
                          contentDescription = platform.name,
                          tint = Color.White,
                          modifier = Modifier.size(14.dp)
                        )
                      } else {
                        Text(
                          text = platform.initialText,
                          color = Color.White,
                          fontWeight = FontWeight.Black,
                          fontSize = 11.sp
                        )
                      }
                      Spacer(modifier = Modifier.width(6.dp))
                      Text(
                        text = displayHandle,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp
                      )
                    }
                  }
                }
              }
            }

        // SHARE CARD BUTTON
        Button(
          onClick = sharePassIntent,
          colors = ButtonDefaults.buttonColors(
            containerColor = CinemaWhite,
            contentColor = MinimalBlack
          ),
          shape = RoundedCornerShape(14.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(50.dp)
            .testTag("share_digital_pass_button")
        ) {
          Icon(imageVector = Icons.Default.Share, contentDescription = null, modifier = Modifier.size(18.dp))
          Spacer(modifier = Modifier.width(8.dp))
          Text(text = "Share Digital Pass", fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.height(4.dp))

        // SYNCHRONIZED WATCHLIST GRID
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(imageVector = Icons.Default.Bookmark, contentDescription = null, tint = CinemaWhite, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = "SYNCHRONIZED WATCHLIST", color = CinemaWhite, fontSize = 13.sp, fontWeight = FontWeight.Bold)
          }
          Text(text = "${watchlistItems.size} items", color = Zinc500, fontSize = 12.sp)
        }

        LazyVerticalGrid(
          columns = GridCells.Fixed(2),
          horizontalArrangement = Arrangement.spacedBy(12.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(340.dp)
        ) {
          items(watchlistItems) { item ->
            Surface(
              color = Zinc900,
              shape = RoundedCornerShape(14.dp),
              border = BorderStroke(1.dp, CinematicBorderSubtle),
              modifier = Modifier.fillMaxWidth()
            ) {
              Column {
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                ) {
                  AsyncImage(
                    model = item.posterUrl,
                    contentDescription = item.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                  )
                  Surface(
                    color = MinimalBlack.copy(alpha = 0.8f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                      .padding(8.dp)
                      .align(Alignment.TopEnd)
                  ) {
                    Row(
                      verticalAlignment = Alignment.CenterVertically,
                      modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                      Icon(imageVector = Icons.Default.Star, contentDescription = null, tint = Color(0xFFFFBC05), modifier = Modifier.size(12.dp))
                      Spacer(modifier = Modifier.width(3.dp))
                      Text(text = item.rating, color = CinemaWhite, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                  }
                }
                Text(
                  text = item.title,
                  color = CinemaWhite,
                  fontWeight = FontWeight.Bold,
                  fontSize = 13.sp,
                  maxLines = 1,
                  overflow = TextOverflow.Ellipsis,
                  modifier = Modifier.padding(10.dp)
                )
              }
            }
          }
        }
      }
    }
  }
}
