package com.example.ui.settings

import android.app.DatePickerDialog
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material.icons.rounded.CameraAlt
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.R
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
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.util.Calendar

fun extractUsernameFromSocialUrl(url: String): String {
  if (url.isBlank()) return ""
  val displayHandle = url.substringAfterLast("/").substringBefore("?").replace("@", "")
  return displayHandle.ifBlank { url }
}

data class SocialPlatformInfo(
  val id: String,
  val name: String,
  val brandColor: Color,
  val iconRes: Int? = null,
  val initialText: String = ""
)

val SOCIAL_PLATFORMS = listOf(
  SocialPlatformInfo("facebook", "Facebook", Color(0xFF1877F2), R.drawable.ic_facebook_logo, "F"),
  SocialPlatformInfo("tiktok", "TikTok", Color(0xFF00F2FE), initialText = "TikTok"),
  SocialPlatformInfo("instagram", "Instagram", Color(0xFFE1306C), initialText = "IG"),
  SocialPlatformInfo("x", "X (Twitter)", Color(0xFFFFFFFF), initialText = "X"),
  SocialPlatformInfo("snapchat", "Snapchat", Color(0xFFFFFC00), initialText = "Snap"),
  SocialPlatformInfo("youtube", "YouTube", Color(0xFFFF0000), initialText = "YT"),
  SocialPlatformInfo("telegram", "Telegram", Color(0xFF229ED9), initialText = "TG"),
  SocialPlatformInfo("steam", "Steam", Color(0xFF66C0F4), initialText = "Steam"),
  SocialPlatformInfo("xbox", "Xbox", Color(0xFF107C41), initialText = "Xbox"),
  SocialPlatformInfo("playstation", "PlayStation", Color(0xFF003791), initialText = "PS")
)

val COUNTRIES_LIST = listOf(
  "Egypt", "Saudi Arabia", "United Arab Emirates", "United States",
  "United Kingdom", "France", "Germany", "Japan", "South Korea",
  "Brazil", "Morocco", "Algeria"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
  onBackClick: () -> Unit,
  onProfileUpdated: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  val auth = FirebaseAuth.getInstance()
  val firestore = FirebaseFirestore.getInstance()
  val currentUser = auth.currentUser
  val context = LocalContext.current
  val clipboardManager = LocalClipboardManager.current
  val coroutineScope = rememberCoroutineScope()

  var username by remember { mutableStateOf("") }
  var firstName by remember { mutableStateOf("") }
  var lastName by remember { mutableStateOf("") }
  var dob by remember { mutableStateOf("") }
  var country by remember { mutableStateOf("United States") }
  var isVerified by remember { mutableStateOf(false) }
  var socialLinks by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
  var isLoading by remember { mutableStateOf(true) }
  var isSaving by remember { mutableStateOf(false) }
  var isCountryDropdownExpanded by remember { mutableStateOf(false) }

  // Dialog state for editing a social link
  var activeEditingPlatform by remember { mutableStateOf<SocialPlatformInfo?>(null) }
  var tempLinkInput by remember { mutableStateOf("") }

  LaunchedEffect(currentUser?.uid) {
    val uid = currentUser?.uid
    if (uid != null) {
      isLoading = true
      try {
        val doc = firestore.collection("users").document(uid).get().await()
        if (doc.exists()) {
          firstName = doc.getString("firstName").orEmpty()
          lastName = doc.getString("lastName").orEmpty()
          username = doc.getString("username") ?: if (firstName.isNotBlank() || lastName.isNotBlank()) "$firstName $lastName".trim() else (currentUser.displayName ?: "")
          dob = doc.getString("dob").orEmpty()
          country = doc.getString("country") ?: "United States"
          isVerified = doc.getBoolean("isVerified") ?: currentUser.isEmailVerified
          @Suppress("UNCHECKED_CAST")
          socialLinks = (doc.get("socialLinks") as? Map<String, String>) ?: emptyMap()
        } else {
          username = currentUser.displayName ?: currentUser.email?.substringBefore("@").orEmpty()
          country = "United States"
          isVerified = currentUser.isEmailVerified
        }
      } catch (_: Exception) {
        username = currentUser.displayName ?: currentUser.email?.substringBefore("@").orEmpty()
        isVerified = currentUser.isEmailVerified
      } finally {
        isLoading = false
      }
    } else {
      isLoading = false
    }
  }

  // Native Date Picker Dialog Setup
  val calendar = Calendar.getInstance()
  val datePickerDialog = remember {
    DatePickerDialog(
      context,
      { _, year, month, dayOfMonth ->
        dob = String.format("%04d-%02d-%02d", year, month + 1, dayOfMonth)
      },
      calendar.get(Calendar.YEAR) - 20,
      calendar.get(Calendar.MONTH),
      calendar.get(Calendar.DAY_OF_MONTH)
    )
  }

  val imagePickerLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.GetContent()
  ) { uri ->
    if (uri != null) {
      Toast.makeText(context, "Selected Image: $uri", Toast.LENGTH_SHORT).show()
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
        navigationIcon = {
          IconButton(onClick = onBackClick) {
            Icon(
              imageVector = Icons.AutoMirrored.Filled.ArrowBack,
              contentDescription = "Back",
              tint = CinemaWhite
            )
          }
        },
        title = {
          Text(
            text = "Manage Account",
            fontWeight = FontWeight.Bold,
            fontSize = 18.sp
          )
        },
        modifier = Modifier.testTag("edit_profile_top_bar")
      )
    },
    modifier = modifier.testTag("edit_profile_screen")
  ) { innerPadding ->
    if (isLoading) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .padding(innerPadding),
        contentAlignment = Alignment.Center
      ) {
        CircularProgressIndicator(color = CinemaWhite, strokeWidth = 2.5.dp)
      }
    } else {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(innerPadding)
          .background(MinimalBlack)
          .verticalScroll(rememberScrollState())
          .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(18.dp)
      ) {
        // 1. PROFILE PICTURE WITH EDIT BADGE
        Box(
          modifier = Modifier
            .size(120.dp)
            .clip(CircleShape)
            .clickable {
              imagePickerLauncher.launch("image/*")
            }
            .border(2.5.dp, CinemaWhite, CircleShape)
            .testTag("profile_picture_container"),
          contentAlignment = Alignment.Center
        ) {
          AsyncImage(
            model = currentUser?.photoUrl ?: "",
            contentDescription = "Profile Picture",
            contentScale = ContentScale.Crop,
            modifier = Modifier
              .size(120.dp)
              .testTag("profile_picture")
          )
          // Camera icon overlay
          Box(
            modifier = Modifier
              .size(120.dp)
              .background(Color.Black.copy(alpha = 0.45f)),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Rounded.CameraAlt,
              contentDescription = "Edit Avatar",
              tint = Color.White,
              modifier = Modifier.size(32.dp)
            )
          }
        }

        // 2. IDENTITY ROW (Verified Badge + Username + Copyable UID)
        val uid = currentUser?.uid ?: "GUEST_UID"
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.Center,
          modifier = Modifier
            .fillMaxWidth()
            .testTag("identity_row")
        ) {
          // Verified Badge
          VerifiedBadge(isVerified = isVerified, size = 22.dp)

          Spacer(modifier = Modifier.width(8.dp))

          // Username
          Text(
            text = username.ifBlank { "Member" },
            color = CinemaWhite,
            fontWeight = FontWeight.Bold,
            fontSize = 20.sp
          )

          Spacer(modifier = Modifier.width(12.dp))

          // Truncated UID & Copy Button
          Surface(
            color = Zinc900,
            shape = RoundedCornerShape(20.dp),
            border = BorderStroke(1.dp, CinematicBorderSubtle)
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier
                .clickable {
                  clipboardManager.setText(AnnotatedString(uid))
                  Toast.makeText(context, "ID Copied to clipboard!", Toast.LENGTH_SHORT).show()
                }
                .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
              Text(
                text = "#${uid.take(6)}",
                color = Zinc400,
                fontSize = 12.sp,
                fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace
              )
              Spacer(modifier = Modifier.width(4.dp))
              Icon(
                imageVector = Icons.Default.ContentCopy,
                contentDescription = "Copy UID",
                tint = CinemaWhite,
                modifier = Modifier.size(14.dp)
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(4.dp))

        // 3. PERSONAL INFORMATION FORM
        Text(
          text = "PERSONAL DETAILS",
          color = Zinc500,
          fontSize = 11.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.5.sp,
          modifier = Modifier.fillMaxWidth()
        )

        // First Name
        OutlinedTextField(
          value = firstName,
          onValueChange = { firstName = it },
          label = { Text("First Name", color = Zinc400) },
          colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = CinemaWhite,
            unfocusedBorderColor = CinematicBorderSubtle,
            focusedTextColor = CinemaWhite,
            unfocusedTextColor = CinemaWhite,
            focusedLabelColor = CinemaWhite,
            unfocusedLabelColor = Zinc400,
            cursorColor = CinemaWhite,
            focusedContainerColor = Zinc900,
            unfocusedContainerColor = Zinc900
          ),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("edit_firstname_input")
        )

        // Last Name
        OutlinedTextField(
          value = lastName,
          onValueChange = { lastName = it },
          label = { Text("Last Name", color = Zinc400) },
          colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = CinemaWhite,
            unfocusedBorderColor = CinematicBorderSubtle,
            focusedTextColor = CinemaWhite,
            unfocusedTextColor = CinemaWhite,
            focusedLabelColor = CinemaWhite,
            unfocusedLabelColor = Zinc400,
            cursorColor = CinemaWhite,
            focusedContainerColor = Zinc900,
            unfocusedContainerColor = Zinc900
          ),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("edit_lastname_input")
        )

        // Date of Birth (Native DatePickerDialog trigger ONLY)
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .clickable { datePickerDialog.show() }
        ) {
          OutlinedTextField(
            value = dob.ifBlank { "Select Date of Birth" },
            onValueChange = {},
            readOnly = true,
            enabled = false,
            label = { Text("Date of Birth", color = Zinc400) },
            leadingIcon = {
              Icon(imageVector = Icons.Default.CalendarMonth, contentDescription = null, tint = CinemaWhite)
            },
            colors = OutlinedTextFieldDefaults.colors(
              disabledBorderColor = CinematicBorderSubtle,
              disabledTextColor = CinemaWhite,
              disabledLabelColor = Zinc400,
              disabledLeadingIconColor = CinemaWhite,
              disabledContainerColor = Zinc900
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("edit_dob_picker")
          )
        }

        // Country Dropdown (ExposedDropdownMenuBox)
        ExposedDropdownMenuBox(
          expanded = isCountryDropdownExpanded,
          onExpandedChange = { isCountryDropdownExpanded = !isCountryDropdownExpanded },
          modifier = Modifier.fillMaxWidth()
        ) {
          OutlinedTextField(
            value = country,
            onValueChange = {},
            readOnly = true,
            label = { Text("Country", color = Zinc400) },
            leadingIcon = {
              Icon(imageVector = Icons.Default.Public, contentDescription = null, tint = CinemaWhite)
            },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isCountryDropdownExpanded) },
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = CinemaWhite,
              unfocusedBorderColor = CinematicBorderSubtle,
              focusedTextColor = CinemaWhite,
              unfocusedTextColor = CinemaWhite,
              focusedLabelColor = CinemaWhite,
              unfocusedLabelColor = Zinc400,
              focusedContainerColor = Zinc900,
              unfocusedContainerColor = Zinc900
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
              .fillMaxWidth()
              .menuAnchor()
              .testTag("edit_country_dropdown")
          )
          ExposedDropdownMenu(
            expanded = isCountryDropdownExpanded,
            onDismissRequest = { isCountryDropdownExpanded = false },
            modifier = Modifier
              .heightIn(max = 260.dp)
              .background(Zinc900)
          ) {
            COUNTRIES_LIST.forEach { countryOption ->
              DropdownMenuItem(
                text = { Text(countryOption, color = CinemaWhite, fontSize = 14.sp) },
                onClick = {
                  country = countryOption
                  isCountryDropdownExpanded = false
                }
              )
            }
          }
        }

        // Apply for Verification Request Button
        Button(
          onClick = {
            coroutineScope.launch {
              val userUid = currentUser?.uid ?: return@launch
              firestore.collection("users").document(userUid).update("isVerified", true).await()
              isVerified = true
              Toast.makeText(context, "Verification badge granted!", Toast.LENGTH_SHORT).show()
            }
          },
          colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF1877F2),
            contentColor = Color.White
          ),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(48.dp)
            .testTag("apply_verification_button")
        ) {
          Icon(imageVector = Icons.Default.Verified, contentDescription = null, modifier = Modifier.size(18.dp))
          Spacer(modifier = Modifier.width(8.dp))
          Text(text = if (isVerified) "Verified Account" else "Apply for Verification Badge", fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.height(8.dp))

        // 4. SOCIAL MEDIA GRID (2 COLUMNS)
        Text(
          text = "SOCIAL PROFILES & GAMING HANDLES",
          color = Zinc500,
          fontSize = 11.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.5.sp,
          modifier = Modifier.fillMaxWidth()
        )

        LazyVerticalGrid(
          columns = GridCells.Fixed(2),
          horizontalArrangement = Arrangement.spacedBy(10.dp),
          verticalArrangement = Arrangement.spacedBy(10.dp),
          contentPadding = PaddingValues(vertical = 4.dp),
          modifier = Modifier
            .fillMaxWidth()
            .heightIn(max = 420.dp)
        ) {
          items(SOCIAL_PLATFORMS) { platform ->
            val linkValue = socialLinks[platform.id].orEmpty()
            val isPopulated = linkValue.isNotBlank()

            val displayedText = if (isPopulated) {
              extractUsernameFromSocialUrl(linkValue)
            } else {
              "Not connected"
            }

            val brush = when {
              !isPopulated -> androidx.compose.ui.graphics.Brush.linearGradient(listOf(Zinc900, Zinc900))
              platform.id == "tiktok" -> androidx.compose.ui.graphics.Brush.linearGradient(listOf(Color(0xFF00F2FE), Color.Black, Color(0xFFFE0979)))
              platform.id == "facebook" -> androidx.compose.ui.graphics.Brush.linearGradient(listOf(Color(0xFF1877F2), Color(0xFF1877F2)))
              else -> androidx.compose.ui.graphics.Brush.linearGradient(listOf(platform.brandColor, platform.brandColor))
            }

            Box(
              modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(brush)
                .clickable {
                  activeEditingPlatform = platform
                  tempLinkInput = linkValue
                }
                .testTag("social_grid_item_${platform.id}")
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(12.dp)
              ) {
                Box(
                  modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(if (isPopulated) Color.White.copy(alpha = 0.2f) else MinimalBlack),
                  contentAlignment = Alignment.Center
                ) {
                  val domain = when (platform.id) {
                    "playstation" -> "playstation.com"
                    "xbox" -> "xbox.com"
                    "nintendo" -> "nintendo.com"
                    "steam" -> "steampowered.com"
                    "discord" -> "discord.com"
                    "tiktok" -> "tiktok.com"
                    "facebook" -> "facebook.com"
                    "twitch" -> "twitch.tv"
                    "youtube" -> "youtube.com"
                    "github" -> "github.com"
                    else -> "${platform.id}.com"
                  }
                  AsyncImage(
                    model = "https://logo.clearbit.com/$domain",
                    contentDescription = platform.name,
                    modifier = Modifier.size(24.dp)
                  )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column {
                  Text(
                    text = platform.name,
                    color = CinemaWhite,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                  )
                  Text(
                    text = displayedText,
                    color = if (isPopulated) Color.White else Zinc500,
                    fontSize = 11.sp,
                    maxLines = 1
                  )
                }
              }
            }
          }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // SAVE BUTTON
        Button(
          onClick = {
            val userUid = currentUser?.uid
            if (userUid == null) {
              Toast.makeText(context, "Please sign in to update profile.", Toast.LENGTH_SHORT).show()
              return@Button
            }
            coroutineScope.launch {
              isSaving = true
              try {
                val updateData = mapOf(
                  "username" to username.trim(),
                  "firstName" to firstName.trim(),
                  "lastName" to lastName.trim(),
                  "dob" to dob.trim(),
                  "country" to country.trim(),
                  "isVerified" to isVerified,
                  "socialLinks" to socialLinks
                )
                firestore.collection("users").document(userUid).set(updateData, com.google.firebase.firestore.SetOptions.merge()).await()
                if (country.isNotBlank()) {
                  com.example.data.currency.CurrencyManager.setCurrencyByCountry(country.trim())
                }
                Toast.makeText(context, "Account information saved successfully!", Toast.LENGTH_SHORT).show()
                onProfileUpdated()
                onBackClick()
              } catch (e: Exception) {
                Toast.makeText(context, e.localizedMessage ?: "Failed to save profile.", Toast.LENGTH_LONG).show()
              } finally {
                isSaving = false
              }
            }
          },
          enabled = !isSaving,
          colors = ButtonDefaults.buttonColors(
            containerColor = CinemaWhite,
            contentColor = MinimalBlack
          ),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .testTag("save_profile_button")
        ) {
          if (isSaving) {
            CircularProgressIndicator(color = MinimalBlack, strokeWidth = 2.dp, modifier = Modifier.size(20.dp))
          } else {
            Text(text = "Save Changes", fontWeight = FontWeight.Bold, fontSize = 15.sp)
          }
        }
      }
    }
  }

  // DIALOG FOR EDITING A SOCIAL PLATFORM HANDLE/LINK
  activeEditingPlatform?.let { platform ->
    AlertDialog(
      onDismissRequest = { activeEditingPlatform = null },
      containerColor = Zinc900,
      shape = RoundedCornerShape(20.dp),
      title = {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.Link,
            contentDescription = null,
            tint = platform.brandColor,
            modifier = Modifier.size(22.dp)
          )
          Spacer(modifier = Modifier.width(10.dp))
          Text(text = "Connect ${platform.name}", color = CinemaWhite, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
      },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text(text = "Enter your handle or profile link for ${platform.name}:", color = Zinc400, fontSize = 13.sp)
          OutlinedTextField(
            value = tempLinkInput,
            onValueChange = { tempLinkInput = it },
            placeholder = { Text("e.g. @username or profile URL", color = Zinc500) },
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = platform.brandColor,
              unfocusedBorderColor = CinematicBorderSubtle,
              focusedTextColor = CinemaWhite,
              unfocusedTextColor = CinemaWhite,
              focusedContainerColor = MinimalBlack,
              unfocusedContainerColor = MinimalBlack
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
          )
        }
      },
      confirmButton = {
        Button(
          onClick = {
            socialLinks = socialLinks.toMutableMap().apply {
              if (tempLinkInput.isBlank()) {
                remove(platform.id)
              } else {
                put(platform.id, tempLinkInput.trim())
              }
            }
            activeEditingPlatform = null
          },
          colors = ButtonDefaults.buttonColors(containerColor = CinemaWhite, contentColor = MinimalBlack),
          shape = RoundedCornerShape(10.dp)
        ) {
          Text(text = "Save Handle", fontWeight = FontWeight.Bold)
        }
      },
      dismissButton = {
        TextButton(onClick = { activeEditingPlatform = null }) {
          Text(text = "Cancel", color = Zinc400)
        }
      }
    )
  }
}
