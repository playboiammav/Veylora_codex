package com.example.ui.auth

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

/**
 * Sealed class representing authentication states
 */
sealed class AuthState {
  data object Idle : AuthState()
  data object Loading : AuthState()
  data class Success(val user: FirebaseUser? = null) : AuthState()
  data class Error(val message: String) : AuthState()
}

// Typealias for backward compatibility
typealias AuthUiState = AuthState

data class UserProfile(
  val username: String = "",
  val firstName: String = "",
  val lastName: String = "",
  val dob: String = "",
  val country: String = "",
  val email: String = "",
  val isEmailVerified: Boolean = false,
  val veyloraId: String = ""
)

class AuthViewModel(
  private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
  private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) : ViewModel() {

  private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
  val authState: StateFlow<AuthState> = _authState.asStateFlow()

  // Alias for backward compatibility
  val uiState: StateFlow<AuthState> = _authState.asStateFlow()

  private val _userProfile = MutableStateFlow<UserProfile?>(null)
  val userProfile: StateFlow<UserProfile?> = _userProfile.asStateFlow()

  private val _isLoadingProfile = MutableStateFlow(false)
  val isLoadingProfile: StateFlow<Boolean> = _isLoadingProfile.asStateFlow()

  val currentUser: FirebaseUser?
    get() = auth.currentUser

  val isAuthenticated: Boolean
    get() = auth.currentUser != null

  init {
    auth.currentUser?.let { user ->
      fetchUserProfile(user.uid)
    }
  }

  /**
   * Signs up a new user with email, password, firstName, lastName, and dob.
   * Saves extra data to Firestore: users/{uid} set mapOf("firstName" to fName, "lastName" to lName, "dob" to dob)
   * and sends email verification link with Toast.
   */
  fun signUp(
    email: String,
    pass: String,
    confirmPass: String,
    firstName: String,
    lastName: String,
    dob: String,
    context: Context,
    username: String = "",
    onSuccess: () -> Unit = {}
  ) {
    if (email.isBlank() || pass.isBlank()) {
      _authState.value = AuthState.Error("Please enter both email and password.")
      return
    }
    if (firstName.isBlank() || lastName.isBlank()) {
      _authState.value = AuthState.Error("Please enter your First Name and Last Name.")
      return
    }
    if (dob.isBlank() || dob.contains("Year") || dob.contains("Month") || dob.contains("Day")) {
      _authState.value = AuthState.Error("Please select your Date of Birth.")
      return
    }
    if (pass != confirmPass) {
      _authState.value = AuthState.Error("Passwords do not match.")
      return
    }
    if (pass.length < 6) {
      _authState.value = AuthState.Error("Password must be at least 6 characters.")
      return
    }

    viewModelScope.launch {
      _authState.value = AuthState.Loading
      try {
        val result = auth.createUserWithEmailAndPassword(email.trim(), pass).await()
        val user = result.user
        if (user != null) {
          val fName = firstName.trim()
          val lName = lastName.trim()
          val userDob = dob.trim()
          val uName = if (username.isNotBlank()) username.trim() else "$fName $lName"

          // A) Save extra data to Firestore
          val randomId = java.util.UUID.randomUUID().toString().replace("-", "").take(7).uppercase()
          val detectedCountry = com.example.data.currency.CurrencyManager.getSavedCountry()
          val userData = mapOf(
            "firstName" to fName,
            "lastName" to lName,
            "dob" to userDob,
            "username" to uName,
            "country" to detectedCountry,
            "email" to email.trim(),
            "veyloraId" to randomId,
            "createdAt" to FieldValue.serverTimestamp()
          )
          firestore.collection("users").document(user.uid).set(userData).await()
          com.example.data.currency.CurrencyManager.setCurrencyByCountry(detectedCountry)

          // B) Send verification link & show Toast
          try {
            user.sendEmailVerification().await()
          } catch (_: Exception) {}

          Toast.makeText(
            context,
            "Account created. Please check your email to verify.",
            Toast.LENGTH_LONG
          ).show()

          _userProfile.value = UserProfile(
            username = "$fName $lName",
            firstName = fName,
            lastName = lName,
            dob = userDob,
            email = email.trim(),
            isEmailVerified = user.isEmailVerified
          )
        }
        _authState.value = AuthState.Success(user)
        onSuccess()
      } catch (e: Exception) {
        _authState.value = AuthState.Error(
          e.localizedMessage ?: "Failed to create account. Please check your credentials."
        )
      }
    }
  }

  /**
   * Overloaded signUp method for backward compatibility
   */
  fun signUp(email: String, pass: String, confirmPass: String, username: String, country: String) {
    val parts = username.trim().split(" ", limit = 2)
    val fName = parts.getOrNull(0) ?: "User"
    val lName = parts.getOrNull(1) ?: ""
    viewModelScope.launch {
      _authState.value = AuthState.Loading
      try {
        val result = auth.createUserWithEmailAndPassword(email.trim(), pass).await()
        val user = result.user
        if (user != null) {
          val randomId = java.util.UUID.randomUUID().toString().replace("-", "").take(7).uppercase()
          val userData = mapOf(
            "firstName" to fName,
            "lastName" to lName,
            "dob" to "2000-01-01",
            "username" to username.trim(),
            "country" to country.trim(),
            "email" to email.trim(),
            "veyloraId" to randomId,
            "createdAt" to FieldValue.serverTimestamp()
          )
          firestore.collection("users").document(user.uid).set(userData).await()
          com.example.data.currency.CurrencyManager.setCurrencyByCountry(country)
          try {
            user.sendEmailVerification().await()
          } catch (_: Exception) {}
        }
        _authState.value = AuthState.Success(user)
      } catch (e: Exception) {
        _authState.value = AuthState.Error(e.localizedMessage ?: "Failed to create account.")
      }
    }
  }

  fun signUp(email: String, pass: String) {
    signUp(email, pass, pass, username = email.substringBefore("@"), country = "Global")
  }

  /**
   * Logs in an existing user with email and password.
   */
  fun login(email: String, pass: String) {
    if (email.isBlank() || pass.isBlank()) {
      _authState.value = AuthState.Error("Please enter both email and password.")
      return
    }

    viewModelScope.launch {
      _authState.value = AuthState.Loading
      try {
        val result = auth.signInWithEmailAndPassword(email.trim(), pass).await()
        val user = result.user
        if (user != null) {
          fetchUserProfile(user.uid)
        }
        _authState.value = AuthState.Success(user)
      } catch (e: Exception) {
        _authState.value = AuthState.Error(
          e.localizedMessage ?: "Failed to sign in. Please check your credentials."
        )
      }
    }
  }

  fun signIn(email: String, pass: String) {
    login(email, pass)
  }

  fun logout() {
    auth.signOut()
    _userProfile.value = null
    _authState.value = AuthState.Idle
  }

  fun signOut() {
    logout()
  }

  fun resetState() {
    _authState.value = AuthState.Idle
  }

  fun setAuthError(message: String) {
    _authState.value = AuthState.Error(message)
  }

  /**
   * Fetches user profile data from Firestore "users" collection
   */
  fun fetchUserProfile(uid: String, onResult: ((UserProfile?) -> Unit)? = null) {
    viewModelScope.launch {
      _isLoadingProfile.value = true
      try {
        val doc = firestore.collection("users").document(uid).get().await()
        if (doc.exists()) {
          val fName = doc.getString("firstName") ?: ""
          val lName = doc.getString("lastName") ?: ""
          val username = if (fName.isNotBlank() || lName.isNotBlank()) "$fName $lName".trim() else (doc.getString("username") ?: auth.currentUser?.displayName ?: "Cinema Member")
          val dob = doc.getString("dob") ?: ""
          val country = doc.getString("country") ?: "Global"
          val email = doc.getString("email") ?: auth.currentUser?.email ?: ""
          
          var fetchedId = doc.getString("veyloraId")
          if (fetchedId.isNullOrBlank()) {
            fetchedId = java.util.UUID.randomUUID().toString().replace("-", "").take(7).uppercase()
            firestore.collection("users").document(uid).update("veyloraId", fetchedId).await()
          }

          val profile = UserProfile(
            username = username,
            firstName = fName,
            lastName = lName,
            dob = dob,
            country = country,
            email = email,
            isEmailVerified = auth.currentUser?.isEmailVerified == true,
            veyloraId = fetchedId
          )
          _userProfile.value = profile
          if (country.isNotBlank() && country != "Global") {
            com.example.data.currency.CurrencyManager.setCurrencyByCountry(country)
          }
          onResult?.invoke(profile)
        } else {
          val fetchedId = java.util.UUID.randomUUID().toString().replace("-", "").take(7).uppercase()
          firestore.collection("users").document(uid).set(mapOf("veyloraId" to fetchedId), com.google.firebase.firestore.SetOptions.merge()).await()
          val fallbackProfile = UserProfile(
            username = auth.currentUser?.displayName ?: (auth.currentUser?.email?.substringBefore("@") ?: "Cinema Member"),
            country = "Global",
            email = auth.currentUser?.email ?: "",
            isEmailVerified = auth.currentUser?.isEmailVerified == true,
            veyloraId = fetchedId
          )
          _userProfile.value = fallbackProfile
          onResult?.invoke(fallbackProfile)
        }
      } catch (e: Exception) {
        val fallbackProfile = UserProfile(
          username = auth.currentUser?.displayName ?: (auth.currentUser?.email?.substringBefore("@") ?: "Cinema Member"),
          country = "Global",
          email = auth.currentUser?.email ?: "",
          isEmailVerified = auth.currentUser?.isEmailVerified == true,
          veyloraId = ""
        )
        _userProfile.value = fallbackProfile
        onResult?.invoke(fallbackProfile)
      } finally {
        _isLoadingProfile.value = false
      }
    }
  }

  fun signInWithFacebook(accessToken: String, onSuccess: () -> Unit = {}) {
    Log.d("FacebookAuthDiagnostic", "AuthViewModel.signInWithFacebook: Starting Firebase sign-in with access token (${accessToken.take(10)}...)")
    viewModelScope.launch {
      _authState.value = AuthState.Loading
      try {
        val credential = com.google.firebase.auth.FacebookAuthProvider.getCredential(accessToken)
        Log.d("FacebookAuthDiagnostic", "AuthViewModel.signInWithFacebook: FacebookAuthProvider.getCredential created successfully.")
        val authResult = auth.signInWithCredential(credential).await()
        val user = authResult.user

        Log.d("FacebookAuthDiagnostic", "AuthViewModel.signInWithFacebook: Firebase sign-in SUCCESS! User UID: ${user?.uid}, Email: ${user?.email}")

        if (user != null) {
          val userDoc = firestore.collection("users").document(user.uid).get().await()
          if (!userDoc.exists()) {
            val displayName = user.displayName ?: ""
            val parts = displayName.trim().split(" ", limit = 2)
            val fName = parts.getOrNull(0) ?: ""
            val lName = parts.getOrNull(1) ?: ""
            val randomId = java.util.UUID.randomUUID().toString().replace("-", "").take(7).uppercase()
            val userData = mapOf(
              "firstName" to fName,
              "lastName" to lName,
              "username" to (displayName.ifBlank { user.email?.substringBefore("@") ?: "Veylora User" }),
              "email" to (user.email ?: ""),
              "veyloraId" to randomId,
              "createdAt" to FieldValue.serverTimestamp()
            )
            firestore.collection("users").document(user.uid).set(userData).await()
            Log.d("FacebookAuthDiagnostic", "AuthViewModel.signInWithFacebook: Created new Firestore user document for ${user.uid}")
          }
          fetchUserProfile(user.uid)
        }
        _authState.value = AuthState.Success(user)
        onSuccess()
      } catch (e: Exception) {
        Log.e("FacebookAuthDiagnostic", "AuthViewModel.signInWithFacebook: Firebase sign-in FAILED.", e)
        _authState.value = AuthState.Error(
          e.localizedMessage ?: "Facebook sign-in failed."
        )
      }
    }
  }

  /**
   * Signs in using Google via CredentialManager and GetGoogleIdOption
   */
  fun signInWithGoogle(context: Context, onSuccess: () -> Unit = {}) {
    viewModelScope.launch {
      _authState.value = AuthState.Loading
      try {
        val credentialManager = CredentialManager.create(context)
        val googleIdOption = GetGoogleIdOption.Builder()
          .setFilterByAuthorizedAccounts(false)
          .setServerClientId(WEB_CLIENT_ID)
          .setAutoSelectEnabled(false)
          .build()

        val request = GetCredentialRequest.Builder()
          .addCredentialOption(googleIdOption)
          .build()

        val result = credentialManager.getCredential(
          request = request,
          context = context
        )

        val credential = result.credential
        if (credential is CustomCredential && credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
          val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
          val firebaseCredential = GoogleAuthProvider.getCredential(googleIdTokenCredential.idToken, null)
          val authResult = auth.signInWithCredential(firebaseCredential).await()
          val user = authResult.user

          if (user != null) {
            val userDoc = firestore.collection("users").document(user.uid).get().await()
            if (!userDoc.exists()) {
              val displayName = user.displayName ?: ""
              val parts = displayName.trim().split(" ", limit = 2)
              val fName = parts.getOrNull(0) ?: ""
              val lName = parts.getOrNull(1) ?: ""
              val randomId = java.util.UUID.randomUUID().toString().replace("-", "").take(7).uppercase()
              val userData = mapOf(
                "firstName" to fName,
                "lastName" to lName,
                "username" to (displayName.ifBlank { user.email?.substringBefore("@") ?: "Cinema User" }),
                "email" to (user.email ?: ""),
                "veyloraId" to randomId,
                "createdAt" to FieldValue.serverTimestamp()
              )
              firestore.collection("users").document(user.uid).set(userData).await()
            }
            fetchUserProfile(user.uid)
          }
          _authState.value = AuthState.Success(user)
          onSuccess()
        } else {
          _authState.value = AuthState.Error("Invalid Google credential format.")
        }
      } catch (e: GetCredentialCancellationException) {
        _authState.value = AuthState.Idle
      } catch (e: Exception) {
        _authState.value = AuthState.Error(
          e.localizedMessage ?: "Google sign-in failed."
        )
      }
    }
  }

  companion object {
    const val WEB_CLIENT_ID = "246707705856-l9pg53nn958notneqctobolkuc24k75v.apps.googleusercontent.com"

    val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
      @Suppress("UNCHECKED_CAST")
      override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return AuthViewModel(
          auth = FirebaseAuth.getInstance(),
          firestore = FirebaseFirestore.getInstance()
        ) as T
      }
    }
  }
}

