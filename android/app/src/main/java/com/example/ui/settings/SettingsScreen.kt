package com.example.ui.settings

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.material3.Scaffold
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.ManageAccounts
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.rounded.FileUpload
import androidx.compose.material.icons.rounded.UploadFile
import androidx.compose.material.icons.rounded.Verified
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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

/**
 * Data model for fetched user profile from Firestore
 */
data class UserSettingsProfile(
  val username: String = "",
  val firstName: String = "",
  val lastName: String = "",
  val dob: String = "",
  val country: String = "",
  val email: String = "",
  val isEmailVerified: Boolean = false,
  val uid: String = ""
)

/**
 * Fetches user profile directly from Firestore 'users' collection
 */
suspend fun fetchUserProfileFromFirestore(
  uid: String,
  firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
  auth: FirebaseAuth = FirebaseAuth.getInstance()
): UserSettingsProfile {
  return try {
    val snapshot = firestore.collection("users").document(uid).get().await()
    val fName = snapshot.getString("firstName").orEmpty()
    val lName = snapshot.getString("lastName").orEmpty()
    val dob = snapshot.getString("dob").orEmpty()
    val rawUsername = snapshot.getString("username")
    val fullName = if (fName.isNotBlank() || lName.isNotBlank()) "$fName $lName".trim() else (rawUsername ?: auth.currentUser?.displayName ?: "Veylora Member")
    val country = snapshot.getString("country") ?: "Global"
    val email = snapshot.getString("email") ?: auth.currentUser?.email.orEmpty()
    val isEmailVerified = auth.currentUser?.isEmailVerified == true

    UserSettingsProfile(
      username = fullName,
      firstName = fName,
      lastName = lName,
      dob = dob,
      country = country,
      email = email,
      isEmailVerified = isEmailVerified,
      uid = uid
    )
  } catch (e: Exception) {
    UserSettingsProfile(
      username = auth.currentUser?.displayName ?: (auth.currentUser?.email?.substringBefore("@") ?: "Member"),
      country = "Global",
      email = auth.currentUser?.email.orEmpty(),
      isEmailVerified = auth.currentUser?.isEmailVerified == true,
      uid = uid
    )
  }
}

/**
 * Settings / Profile Screen with:
 * - TopAppBar: REMOVED Gamepad icon, ONLY Search icon kept.
 * - Redesigned Modern Flat Cards list layout.
 * - Functional Theme Switch connected to StateFlow.
 * - Functional Localization using AppCompatDelegate.setApplicationLocales.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
  isDarkMode: Boolean = true,
  onThemeChanged: (Boolean) -> Unit = {},
  onBackClick: () -> Unit = {},
  onSignOutClick: () -> Unit = {},
  onSignInClick: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  val auth = FirebaseAuth.getInstance()
  var currentUser by remember { mutableStateOf(auth.currentUser) }

  DisposableEffect(auth) {
    val listener = FirebaseAuth.AuthStateListener { firebaseAuth ->
      currentUser = firebaseAuth.currentUser
    }
    auth.addAuthStateListener(listener)
    onDispose {
      auth.removeAuthStateListener(listener)
    }
  }

  var profile by remember { mutableStateOf<UserSettingsProfile?>(null) }
  var isLoading by remember { mutableStateOf(true) }
  var showEditProfileScreen by remember { mutableStateOf(false) }
  var showImportModal by remember { mutableStateOf(false) }
  var showSignOutConfirmation by remember { mutableStateOf(false) }

  val coroutineScope = rememberCoroutineScope()
  val context = LocalContext.current

  // Map display language to ISO tag
  var selectedLanguage by remember { mutableStateOf("English") }
  var langExpanded by remember { mutableStateOf(false) }
  val languages = listOf(
    "English",
    "العربية",
    "Español",
    "Français",
    "Deutsch",
    "Italiano",
    "Türkçe",
    "日本語",
    "한국어",
    "Русский"
  )

  var isEmailVerified by remember { mutableStateOf(currentUser?.isEmailVerified == true) }
  var isFlashingGreen by remember { mutableStateOf(false) }

  val animatedVerifiedColor by animateColorAsState(
    targetValue = if (isFlashingGreen) Color(0xFF4CAF50) else Color(0xFF1E88E5),
    animationSpec = tween(durationMillis = 600),
    label = "VerifiedBadgeColor"
  )

  LaunchedEffect(currentUser) {
    val user = currentUser
    if (user != null) {
      val wasVerifiedBefore = user.isEmailVerified
      try {
        user.reload().await()
      } catch (_: Exception) {}
      val isVerifiedNow = user.isEmailVerified
      isEmailVerified = isVerifiedNow

      isLoading = true
      profile = fetchUserProfileFromFirestore(user.uid)
      isLoading = false

      if (isVerifiedNow && !wasVerifiedBefore) {
        isFlashingGreen = true
        delay(1200L)
        isFlashingGreen = false
      }
    } else {
      profile = null
      isLoading = false
    }
  }

  if (showEditProfileScreen) {
    BackHandler {
      showEditProfileScreen = false
    }
    EditProfileScreen(
      onBackClick = { showEditProfileScreen = false },
      onProfileUpdated = {
        currentUser?.let { user ->
          coroutineScope.launch {
            profile = fetchUserProfileFromFirestore(user.uid)
          }
        }
      }
    )
    return
  }

  if (showImportModal) {
    BackHandler { showImportModal = false }
  }
  if (showSignOutConfirmation) {
    BackHandler { showSignOutConfirmation = false }
  }

  Scaffold(
    containerColor = MaterialTheme.colorScheme.background,
    topBar = {
      TopAppBar(
        colors = TopAppBarDefaults.topAppBarColors(
          containerColor = MaterialTheme.colorScheme.background,
          titleContentColor = MaterialTheme.colorScheme.onBackground
        ),
        navigationIcon = {
          IconButton(onClick = onBackClick) {
            Icon(
              imageVector = Icons.AutoMirrored.Filled.ArrowBack,
              contentDescription = "Back",
              tint = MaterialTheme.colorScheme.onBackground
            )
          }
        },
        title = {
          Text(
            text = stringResource(R.string.settings_title),
            fontWeight = FontWeight.Bold,
            fontSize = 18.sp,
            color = MaterialTheme.colorScheme.onBackground
          )
        },
        actions = {
          IconButton(onClick = {
            Toast.makeText(context, "Search Settings...", Toast.LENGTH_SHORT).show()
          }) {
            Icon(
              imageVector = Icons.Default.Search,
              contentDescription = "Search",
              tint = MaterialTheme.colorScheme.onBackground,
              modifier = Modifier.size(22.dp)
            )
          }
        }
      )
    },
    modifier = modifier.testTag("settings_screen")
  ) { paddingValues ->
    if (isLoading) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .padding(paddingValues),
        contentAlignment = Alignment.Center
      ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
          CircularProgressIndicator(
            color = MaterialTheme.colorScheme.primary,
            strokeWidth = 2.5.dp,
            modifier = Modifier.size(32.dp)
          )
          Spacer(modifier = Modifier.height(16.dp))
          Text(
            text = "Loading profile data...",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 13.sp
          )
        }
      }
    } else {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(paddingValues)
          .verticalScroll(rememberScrollState())
          .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
      ) {
        // 1. USER PROFILE INFO BOX (Avatar, Name, Email, Verified Badge)
        val user = currentUser
        if (user == null) {
          Surface(
            color = MaterialTheme.colorScheme.surface,
            shape = RoundedCornerShape(16.dp),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth()
          ) {
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              Text(
                text = stringResource(R.string.guest_mode),
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
              )
              Spacer(modifier = Modifier.height(4.dp))
              Text(
                text = stringResource(R.string.guest_mode_sub),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 12.sp
              )
            }
          }
        } else {
          val displayName = if (!profile?.firstName.isNullOrBlank() || !profile?.lastName.isNullOrBlank()) {
            "${profile?.firstName.orEmpty()} ${profile?.lastName.orEmpty()}".trim()
          } else {
            user.displayName ?: profile?.username ?: "Veylora User"
          }

          Surface(
            color = MaterialTheme.colorScheme.surface,
            shape = RoundedCornerShape(16.dp),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth()
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Box(
                modifier = Modifier
                  .size(52.dp)
                  .clip(CircleShape)
                  .background(MaterialTheme.colorScheme.primaryContainer)
                  .border(1.5.dp, MaterialTheme.colorScheme.primary, CircleShape),
                contentAlignment = Alignment.Center
              ) {
                Text(
                  text = displayName.take(1).ifBlank { "V" }.uppercase(),
                  color = MaterialTheme.colorScheme.onPrimaryContainer,
                  fontSize = 22.sp,
                  fontWeight = FontWeight.Black
                )
              }

              Spacer(modifier = Modifier.width(14.dp))

              Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  Text(
                    text = displayName,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                  )
                  if (isEmailVerified) {
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(
                      imageVector = Icons.Rounded.Verified,
                      contentDescription = "Verified",
                      tint = animatedVerifiedColor,
                      modifier = Modifier.size(16.dp)
                    )
                  }
                }
                Text(
                  text = user.email ?: profile?.email.orEmpty(),
                  color = MaterialTheme.colorScheme.onSurfaceVariant,
                  fontSize = 12.sp
                )
              }
            }
          }
        }

        // 2. "MANAGE ACCOUNT" BUTTON CARD
        Surface(
          color = MaterialTheme.colorScheme.surface,
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          modifier = Modifier
            .fillMaxWidth()
            .clickable {
              if (currentUser != null) {
                showEditProfileScreen = true
              } else {
                onSignInClick()
              }
            }
            .testTag("manage_account_row")
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(18.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.weight(1f)
            ) {
              Box(
                modifier = Modifier
                  .size(42.dp)
                  .clip(CircleShape)
                  .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  imageVector = Icons.Default.ManageAccounts,
                  contentDescription = stringResource(R.string.manage_account),
                  tint = MaterialTheme.colorScheme.onPrimaryContainer,
                  modifier = Modifier.size(22.dp)
                )
              }
              Spacer(modifier = Modifier.width(14.dp))
              Column {
                Text(
                  text = stringResource(R.string.manage_account),
                  color = MaterialTheme.colorScheme.onSurface,
                  fontSize = 16.sp,
                  fontWeight = FontWeight.Bold
                )
                Text(
                  text = if (currentUser != null) {
                    profile?.username?.ifBlank { currentUser?.email } ?: stringResource(R.string.manage_account_subtitle)
                  } else stringResource(R.string.sign_in_register),
                  color = MaterialTheme.colorScheme.onSurfaceVariant,
                  fontSize = 12.sp,
                  maxLines = 1,
                  overflow = TextOverflow.Ellipsis
                )
              }
            }
            Icon(
              imageVector = Icons.Default.ChevronRight,
              contentDescription = null,
              tint = MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier.size(22.dp)
            )
          }
        }

        // 3. APP PREFERENCES: THEME SWITCH
        Surface(
          color = MaterialTheme.colorScheme.surface,
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = Icons.Default.Settings,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.width(12.dp))
              Column {
                Text(
                  text = stringResource(R.string.app_theme),
                  color = MaterialTheme.colorScheme.onSurface,
                  fontSize = 14.sp,
                  fontWeight = FontWeight.SemiBold
                )
                Text(
                  text = if (isDarkMode) stringResource(R.string.dark_mode) else stringResource(R.string.light_mode),
                  color = MaterialTheme.colorScheme.onSurfaceVariant,
                  fontSize = 11.sp
                )
              }
            }
            Switch(
              checked = isDarkMode,
              onCheckedChange = onThemeChanged,
              modifier = Modifier.testTag("theme_switch")
            )
          }
        }

        // 4. LANGUAGE DROPDOWN CARD
        Surface(
          color = MaterialTheme.colorScheme.surface,
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = Icons.Default.Language,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.width(10.dp))
              Text(
                text = stringResource(R.string.language_label),
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
              )
            }

            ExposedDropdownMenuBox(
              expanded = langExpanded,
              onExpandedChange = { langExpanded = !langExpanded },
              modifier = Modifier.fillMaxWidth()
            ) {
              OutlinedTextField(
                value = selectedLanguage,
                onValueChange = {},
                readOnly = true,
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = langExpanded) },
                colors = OutlinedTextFieldDefaults.colors(
                  focusedBorderColor = MaterialTheme.colorScheme.primary,
                  unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
                  focusedTextColor = MaterialTheme.colorScheme.onSurface,
                  unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
                  focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                  unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                  .fillMaxWidth()
                  .menuAnchor()
                  .testTag("language_dropdown")
              )
              ExposedDropdownMenu(
                expanded = langExpanded,
                onDismissRequest = { langExpanded = false },
                modifier = Modifier.background(MaterialTheme.colorScheme.surface)
              ) {
                languages.forEach { lang ->
                  DropdownMenuItem(
                    text = {
                      Text(
                        text = lang,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = if (lang == selectedLanguage) FontWeight.Bold else FontWeight.Normal
                      )
                    },
                    onClick = {
                      selectedLanguage = lang
                      langExpanded = false
                      val localeTag = when (lang) {
                        "English" -> "en"
                        "العربية" -> "ar"
                        "Español" -> "es"
                        "Français" -> "fr"
                        "Deutsch" -> "de"
                        "Italiano" -> "it"
                        "Türkçe" -> "tr"
                        "日本語" -> "ja"
                        "한국어" -> "ko"
                        "Русский" -> "ru"
                        else -> "en"
                      }
                      AppCompatDelegate.setApplicationLocales(
                        LocaleListCompat.forLanguageTags(localeTag)
                      )
                      Toast.makeText(context, "Language set to $lang", Toast.LENGTH_SHORT).show()
                    }
                  )
                }
              }
            }
          }
        }

        // 4.5 GLOBAL CURRENCY PREFERENCE CARD
        var currencyExpanded by remember { mutableStateOf(false) }
        val currentCurrencyInfo by com.example.data.currency.CurrencyManager.currentCurrency.collectAsState()

        Surface(
          color = MaterialTheme.colorScheme.surface,
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = Icons.Default.Settings,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.width(10.dp))
              Text(
                text = "Global Currency (${currentCurrencyInfo.code})",
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
              )
            }

            ExposedDropdownMenuBox(
              expanded = currencyExpanded,
              onExpandedChange = { currencyExpanded = !currencyExpanded },
              modifier = Modifier.fillMaxWidth()
            ) {
              OutlinedTextField(
                value = "${currentCurrencyInfo.flag} ${currentCurrencyInfo.name} (${currentCurrencyInfo.code})",
                onValueChange = {},
                readOnly = true,
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = currencyExpanded) },
                colors = OutlinedTextFieldDefaults.colors(
                  focusedBorderColor = MaterialTheme.colorScheme.primary,
                  unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
                  focusedTextColor = MaterialTheme.colorScheme.onSurface,
                  unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
                  focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                  unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                  .menuAnchor()
                  .fillMaxWidth()
                  .testTag("currency_dropdown_field")
              )

              ExposedDropdownMenu(
                expanded = currencyExpanded,
                onDismissRequest = { currencyExpanded = false },
                modifier = Modifier.background(MaterialTheme.colorScheme.surface)
              ) {
                com.example.data.currency.CurrencyManager.SUPPORTED_CURRENCIES.forEach { curr ->
                  DropdownMenuItem(
                    text = {
                      Text(
                        text = "${curr.flag} ${curr.name} (${curr.code})",
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = if (curr.code == currentCurrencyInfo.code) FontWeight.Bold else FontWeight.Normal
                      )
                    },
                    onClick = {
                      com.example.data.currency.CurrencyManager.setCurrency(curr.code)
                      currencyExpanded = false
                      Toast.makeText(context, "Currency set to ${curr.code}", Toast.LENGTH_SHORT).show()
                    }
                  )
                }
              }
            }
          }
        }

        // 5. IMPORT DATA (CSV/JSON) BUTTON CARD
        OutlinedButton(
          onClick = { showImportModal = true },
          shape = RoundedCornerShape(14.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary),
          colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.primary),
          modifier = Modifier
            .fillMaxWidth()
            .height(50.dp)
            .testTag("import_csv_button")
        ) {
          Icon(
            imageVector = Icons.Rounded.UploadFile,
            contentDescription = null,
            modifier = Modifier.size(20.dp)
          )
          Spacer(modifier = Modifier.width(10.dp))
          Text(
            text = stringResource(R.string.import_data_button),
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp
          )
        }

        // 6. "SIGN OUT" / "SIGN IN" BUTTON (Alone at the very bottom)
        if (currentUser != null) {
          Spacer(modifier = Modifier.height(8.dp))
          Button(
            onClick = {
              showSignOutConfirmation = true
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F), contentColor = Color.White),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
              .fillMaxWidth()
              .height(48.dp)
              .testTag("settings_sign_out_button")
          ) {
            Icon(
              imageVector = Icons.AutoMirrored.Filled.Logout,
              contentDescription = null,
              tint = Color.White,
              modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = stringResource(R.string.sign_out),
              color = Color.White,
              fontSize = 14.sp,
              fontWeight = FontWeight.Bold
            )
          }
        } else {
          Spacer(modifier = Modifier.height(8.dp))
          Button(
            onClick = onSignInClick,
            colors = ButtonDefaults.buttonColors(
              containerColor = MaterialTheme.colorScheme.primary,
              contentColor = MaterialTheme.colorScheme.onPrimary
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
              .fillMaxWidth()
              .height(48.dp)
              .testTag("settings_sign_in_button")
          ) {
            Text(text = stringResource(R.string.sign_in_register), fontWeight = FontWeight.Bold, fontSize = 14.sp)
          }
        }

        Spacer(modifier = Modifier.height(24.dp))
      }
    }
  }

  // IMPORT DATA MODAL DIALOG
  if (showImportModal) {
    AlertDialog(
      onDismissRequest = { showImportModal = false },
      containerColor = MaterialTheme.colorScheme.surface,
      shape = RoundedCornerShape(20.dp),
      title = {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Rounded.UploadFile,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(24.dp)
          )
          Spacer(modifier = Modifier.width(10.dp))
          Text(
            text = stringResource(R.string.import_data_button),
            color = MaterialTheme.colorScheme.onSurface,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
          )
        }
      },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
          Text(
            text = "Your JSON or CSV payload must match the required structure below:",
            color = MaterialTheme.colorScheme.onSurface,
            fontSize = 13.sp
          )

          // Code Snippet Box
          Surface(
            color = MaterialTheme.colorScheme.surfaceVariant,
            shape = RoundedCornerShape(10.dp),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth()
          ) {
            Text(
              text = "[{\"title\": \"GTA VI\", \"type\": \"game\", \"platform\": \"Xbox\"}]",
              color = Color(0xFF388E3C),
              fontFamily = FontFamily.Monospace,
              fontSize = 12.sp,
              modifier = Modifier.padding(12.dp)
            )
          }

          Text(
            text = "Click proceed to select a file from device storage or paste payload.",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 12.sp
          )
        }
      },
      confirmButton = {
        Button(
          onClick = {
            showImportModal = false
            Toast.makeText(context, "Data import initiated successfully!", Toast.LENGTH_SHORT).show()
          },
          colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary
          ),
          shape = RoundedCornerShape(10.dp)
        ) {
          Icon(
            imageVector = Icons.Rounded.FileUpload,
            contentDescription = "Proceed with Import",
            tint = MaterialTheme.colorScheme.onPrimary,
            modifier = Modifier.size(18.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(text = "Proceed with Import", fontWeight = FontWeight.Bold)
        }
      },
      dismissButton = {
        TextButton(onClick = { showImportModal = false }) {
          Text(text = "Cancel", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
      }
    )
  }

  if (showSignOutConfirmation) {
    AlertDialog(
      onDismissRequest = { showSignOutConfirmation = false },
      containerColor = MaterialTheme.colorScheme.surface,
      shape = RoundedCornerShape(20.dp),
      title = {
        Text(
          text = "Sign Out",
          color = MaterialTheme.colorScheme.onSurface,
          fontSize = 18.sp,
          fontWeight = FontWeight.Bold
        )
      },
      text = {
        Text(
          text = "Are you sure you want to log out?",
          color = MaterialTheme.colorScheme.onSurface,
          fontSize = 14.sp
        )
      },
      confirmButton = {
        Button(
          onClick = {
            showSignOutConfirmation = false
            auth.signOut()
            onSignOutClick()
          },
          colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F), contentColor = Color.White),
          shape = RoundedCornerShape(10.dp)
        ) {
          Text(text = "Yes, Sign Out", fontWeight = FontWeight.Bold)
        }
      },
      dismissButton = {
        TextButton(onClick = { showSignOutConfirmation = false }) {
          Text(text = "Cancel", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
      }
    )
  }
}
