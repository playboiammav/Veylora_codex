package com.example.ui.auth

import android.widget.Toast
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.CinematicBorderSubtle
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

@Composable
fun CompleteProfileScreen(
  onProfileCompleted: () -> Unit,
  onSignOut: () -> Unit = {},
  modifier: Modifier = Modifier
) {
  val auth = FirebaseAuth.getInstance()
  val firestore = FirebaseFirestore.getInstance()
  val currentUser = auth.currentUser
  val context = LocalContext.current
  val coroutineScope = rememberCoroutineScope()

  var username by remember {
    mutableStateOf(currentUser?.displayName?.replace(" ", "")?.lowercase() ?: currentUser?.email?.substringBefore("@").orEmpty())
  }
  var firstName by remember {
    mutableStateOf(currentUser?.displayName?.substringBefore(" ").orEmpty())
  }
  var lastName by remember {
    mutableStateOf(currentUser?.displayName?.substringAfter(" ", "").orEmpty())
  }
  var dob by remember { mutableStateOf("") }
  var isSaving by remember { mutableStateOf(false) }

  Box(
    modifier = modifier
      .fillMaxSize()
      .background(MinimalBlack)
      .statusBarsPadding()
      .testTag("complete_profile_screen")
  ) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 24.dp, vertical = 32.dp),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center
    ) {
      // Header
      Text(
        text = "VEYLORA",
        color = Zinc500,
        fontWeight = FontWeight.Bold,
        fontSize = 12.sp,
        letterSpacing = 2.5.sp
      )

      Spacer(modifier = Modifier.height(12.dp))

      Text(
        text = "Complete Your Profile",
        color = CinemaWhite,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        textAlign = TextAlign.Center
      )

      Spacer(modifier = Modifier.height(8.dp))

      Text(
        text = "Please set up your username, name, and birth date to finish creating your account.",
        color = Zinc400,
        fontSize = 13.sp,
        textAlign = TextAlign.Center,
        modifier = Modifier.padding(horizontal = 16.dp)
      )

      Spacer(modifier = Modifier.height(32.dp))

      // Card Container
      Surface(
        color = Zinc900,
        shape = RoundedCornerShape(20.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, CinematicBorderSubtle),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(20.dp),
          verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
          // Username
          OutlinedTextField(
            value = username,
            onValueChange = { username = it.replace(" ", "") },
            label = { Text("Username (@handle)", color = Zinc400) },
            leadingIcon = {
              Icon(imageVector = Icons.Default.Person, contentDescription = null, tint = CinemaWhite)
            },
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = CinemaWhite,
              unfocusedBorderColor = CinematicBorderSubtle,
              focusedTextColor = CinemaWhite,
              unfocusedTextColor = CinemaWhite,
              focusedLabelColor = CinemaWhite,
              unfocusedLabelColor = Zinc400,
              cursorColor = CinemaWhite,
              focusedContainerColor = MinimalBlack,
              unfocusedContainerColor = MinimalBlack
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("onboarding_username_input")
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
              focusedContainerColor = MinimalBlack,
              unfocusedContainerColor = MinimalBlack
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("onboarding_firstname_input")
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
              focusedContainerColor = MinimalBlack,
              unfocusedContainerColor = MinimalBlack
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("onboarding_lastname_input")
          )

          // Date of Birth
          OutlinedTextField(
            value = dob,
            onValueChange = { dob = it },
            label = { Text("Date of Birth (YYYY-MM-DD)", color = Zinc400) },
            leadingIcon = {
              Icon(imageVector = Icons.Default.CalendarMonth, contentDescription = null, tint = CinemaWhite)
            },
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = CinemaWhite,
              unfocusedBorderColor = CinematicBorderSubtle,
              focusedTextColor = CinemaWhite,
              unfocusedTextColor = CinemaWhite,
              focusedLabelColor = CinemaWhite,
              unfocusedLabelColor = Zinc400,
              cursorColor = CinemaWhite,
              focusedContainerColor = MinimalBlack,
              unfocusedContainerColor = MinimalBlack
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("onboarding_dob_input")
          )

          Spacer(modifier = Modifier.height(8.dp))

          Button(
            onClick = {
              val uid = currentUser?.uid
              if (uid == null) {
                Toast.makeText(context, "Session expired, please sign in again.", Toast.LENGTH_SHORT).show()
                return@Button
              }
              if (username.isBlank()) {
                Toast.makeText(context, "Please enter a valid username.", Toast.LENGTH_SHORT).show()
                return@Button
              }
              if (dob.isBlank()) {
                Toast.makeText(context, "Please enter your date of birth.", Toast.LENGTH_SHORT).show()
                return@Button
              }

              coroutineScope.launch {
                isSaving = true
                try {
                  val savedCountry = com.example.data.currency.CurrencyManager.getSavedCountry()
                  val profileData = mapOf(
                    "uid" to uid,
                    "username" to username.trim(),
                    "firstName" to firstName.trim(),
                    "lastName" to lastName.trim(),
                    "dob" to dob.trim(),
                    "country" to savedCountry,
                    "email" to (currentUser.email ?: ""),
                    "createdAt" to System.currentTimeMillis()
                  )
                  firestore.collection("users").document(uid)
                    .set(profileData, SetOptions.merge())
                    .await()
                  com.example.data.currency.CurrencyManager.setCurrencyByCountry(savedCountry)

                  Toast.makeText(context, "Profile completed successfully!", Toast.LENGTH_SHORT).show()
                  onProfileCompleted()
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
              .height(50.dp)
              .testTag("complete_profile_submit_button")
          ) {
            if (isSaving) {
              CircularProgressIndicator(color = MinimalBlack, strokeWidth = 2.dp, modifier = Modifier.size(20.dp))
            } else {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                  imageVector = Icons.Rounded.CheckCircle,
                  contentDescription = null,
                  modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = "Continue to Veylora", fontWeight = FontWeight.Bold, fontSize = 15.sp)
              }
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      OutlinedButton(
        onClick = {
          auth.signOut()
          onSignOut()
        },
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = Zinc400),
        border = androidx.compose.foundation.BorderStroke(1.dp, Zinc800),
        modifier = Modifier
          .fillMaxWidth()
          .height(46.dp)
      ) {
        Icon(imageVector = Icons.AutoMirrored.Filled.Logout, contentDescription = null, modifier = Modifier.size(16.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = "Sign Out & Abort", fontSize = 13.sp)
      }
    }
  }
}
