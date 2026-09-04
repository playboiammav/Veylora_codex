package com.example.ui.auth

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
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
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.MainActivity
import com.example.R
import com.example.ui.components.fastPingPongGradientBackground
import com.example.ui.components.fastPingPongGradientMask
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.CinematicBorderSubtle
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900
import com.facebook.CallbackManager
import com.facebook.FacebookCallback
import com.facebook.FacebookException
import com.facebook.login.LoginManager
import com.facebook.login.LoginResult
import com.google.firebase.auth.FirebaseAuth
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthScreen(
  onAuthSuccess: () -> Unit = {},
  onForgotPasswordClick: () -> Unit = {},
  viewModel: AuthViewModel = viewModel(factory = AuthViewModel.Factory),
  modifier: Modifier = Modifier
) {
  val authState by viewModel.authState.collectAsStateWithLifecycle()
  val snackbarHostState = remember { SnackbarHostState() }
  var isSignUpMode by remember { mutableStateOf(false) }
  val context = LocalContext.current
  val callbackManager = remember { CallbackManager.Factory.create() }

  var showResetPasswordDialog by remember { mutableStateOf(false) }
  var resetPasswordEmail by remember { mutableStateOf("") }

  LaunchedEffect(callbackManager) {
    MainActivity.callbackManager = callbackManager
  }

  DisposableEffect(callbackManager) {
    LoginManager.getInstance().registerCallback(
      callbackManager,
      object : FacebookCallback<LoginResult> {
        override fun onSuccess(result: LoginResult) {
          val token = result.accessToken.token
          val grantedPerms = result.accessToken.permissions.joinToString(",")
          Log.d("FacebookAuthDiagnostic", "FacebookCallback.onSuccess: Token received (${token.take(10)}...), Granted permissions: [$grantedPerms]")
          viewModel.signInWithFacebook(token)
        }

        override fun onCancel() {
          Log.d("FacebookAuthDiagnostic", "FacebookCallback.onCancel: User cancelled Facebook login flow.")
          viewModel.resetState()
        }

        override fun onError(error: FacebookException) {
          Log.e("FacebookAuthDiagnostic", "FacebookCallback.onError: Facebook login failed with error.", error)
          viewModel.setAuthError("Facebook Login Error: ${error.localizedMessage ?: error.message ?: "Unknown error"}")
        }
      }
    )
    onDispose {
      LoginManager.getInstance().unregisterCallback(callbackManager)
    }
  }

  // Sign-Up fields
  var username by remember { mutableStateOf("") }
  var firstName by remember { mutableStateOf("") }
  var lastName by remember { mutableStateOf("") }

  // Date of Birth Dropdowns
  var selectedYear by remember { mutableStateOf("Year") }
  var yearExpanded by remember { mutableStateOf(false) }
  val years = remember { (1950..2026).toList().reversed().map { it.toString() } }

  var selectedMonth by remember { mutableStateOf("Month") }
  var monthExpanded by remember { mutableStateOf(false) }
  val months = remember { (1..12).toList().map { String.format("%02d", it) } }

  var selectedDay by remember { mutableStateOf("Day") }
  var dayExpanded by remember { mutableStateOf(false) }
  val days = remember { (1..31).toList().map { String.format("%02d", it) } }

  var email by remember { mutableStateOf("") }
  var password by remember { mutableStateOf("") }
  var confirmPassword by remember { mutableStateOf("") }
  var isPasswordVisible by remember { mutableStateOf(false) }

  val focusManager = LocalFocusManager.current
  val scrollState = rememberScrollState()

  // Handle Success navigation and Error messages
  LaunchedEffect(authState) {
    when (val state = authState) {
      is AuthState.Success -> {
        onAuthSuccess()
      }
      is AuthState.Error -> {
        snackbarHostState.showSnackbar(message = state.message)
      }
      else -> Unit
    }
  }

  Scaffold(
    snackbarHost = {
      SnackbarHost(snackbarHostState) { data ->
        Snackbar(
          containerColor = Zinc800,
          contentColor = CinemaWhite,
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.padding(16.dp)
        ) {
          Text(
            text = data.visuals.message,
            color = CinemaWhite,
            fontSize = 14.sp
          )
        }
      }
    },
    containerColor = Color(0xFF09080C),
    modifier = modifier.fillMaxSize()
  ) { paddingValues ->
    val infiniteTransition = rememberInfiniteTransition(label = "google_bg")
    val animatedOffset by infiniteTransition.animateFloat(
      initialValue = 0f,
      targetValue = 1000f,
      animationSpec = infiniteRepeatable(
        animation = tween(durationMillis = 30000, easing = LinearEasing),
        repeatMode = RepeatMode.Reverse
      ),
      label = "offset"
    )

    val backgroundBrush = androidx.compose.ui.graphics.Brush.linearGradient(
      0.0f to Color(0xFF4285F4), // Blue
      0.33f to Color(0xFFEA4335), // Red
      0.66f to Color(0xFFFBBC05), // Yellow
      1.0f to Color(0xFF34A853), // Green
      start = androidx.compose.ui.geometry.Offset(animatedOffset, animatedOffset),
      end = androidx.compose.ui.geometry.Offset(animatedOffset + 2000f, animatedOffset + 2000f)
    )
    Box(
      modifier = Modifier
        .fillMaxSize()
        .background(backgroundBrush)
        .padding(paddingValues)
        .imePadding()
        .testTag("auth_screen"),
      contentAlignment = Alignment.Center
    ) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .verticalScroll(scrollState)
          .padding(horizontal = 24.dp, vertical = 28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
      ) {
        Spacer(modifier = Modifier.height(16.dp))

        Text(
          text = if (isSignUpMode) "Create an account to sync your watchlist & ratings" else "Sign in to access your synchronized watchlist & ratings",
          color = Zinc400,
          fontSize = 13.sp,
          fontWeight = FontWeight.Normal
        )

        Spacer(modifier = Modifier.height(28.dp))

        // Sign Up Specific Fields: Username, First Name, Last Name, Date of Birth
        if (isSignUpMode) {
          // Username Field
          OutlinedTextField(
            value = username,
            onValueChange = { username = it },
            label = { Text("Username", color = Zinc400, fontSize = 12.sp) },
            singleLine = true,
            enabled = authState !is AuthState.Loading,
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = CinemaWhite,
              unfocusedBorderColor = Zinc800,
              focusedTextColor = CinemaWhite,
              unfocusedTextColor = CinemaWhite,
              cursorColor = CinemaWhite
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("username_input")
          )

          Spacer(modifier = Modifier.height(10.dp))

          // First Name & Last Name Row
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            OutlinedTextField(
              value = firstName,
              onValueChange = { firstName = it },
              label = { Text("First Name", color = Zinc400, fontSize = 12.sp) },
              singleLine = true,
              enabled = authState !is AuthState.Loading,
              colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = CinemaWhite,
                unfocusedBorderColor = Zinc800,
                focusedTextColor = CinemaWhite,
                unfocusedTextColor = CinemaWhite,
                cursorColor = CinemaWhite
              ),
              shape = RoundedCornerShape(12.dp),
              modifier = Modifier
                .weight(1f)
                .testTag("first_name_input")
            )

            OutlinedTextField(
              value = lastName,
              onValueChange = { lastName = it },
              label = { Text("Last Name", color = Zinc400, fontSize = 12.sp) },
              singleLine = true,
              enabled = authState !is AuthState.Loading,
              colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = CinemaWhite,
                unfocusedBorderColor = Zinc800,
                focusedTextColor = CinemaWhite,
                unfocusedTextColor = CinemaWhite,
                cursorColor = CinemaWhite
              ),
              shape = RoundedCornerShape(12.dp),
              modifier = Modifier
                .weight(1f)
                .testTag("last_name_input")
            )
          }

          Spacer(modifier = Modifier.height(14.dp))

          // Date of Birth Header & Dropdowns
          Column(modifier = Modifier.fillMaxWidth()) {
            Text(
              text = "Date of Birth",
              color = Zinc400,
              fontSize = 12.sp,
              fontWeight = FontWeight.Medium,
              modifier = Modifier.padding(start = 4.dp, bottom = 6.dp)
            )

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              // Year Dropdown
              ExposedDropdownMenuBox(
                expanded = yearExpanded,
                onExpandedChange = { yearExpanded = !yearExpanded },
                modifier = Modifier.weight(1f)
              ) {
                OutlinedTextField(
                  value = selectedYear,
                  onValueChange = {},
                  readOnly = true,
                  trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = yearExpanded) },
                  colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CinemaWhite,
                    unfocusedBorderColor = Zinc800,
                    focusedTextColor = CinemaWhite,
                    unfocusedTextColor = CinemaWhite
                  ),
                  shape = RoundedCornerShape(10.dp),
                  modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor()
                    .testTag("dob_year_dropdown")
                )
                ExposedDropdownMenu(
                  expanded = yearExpanded,
                  onDismissRequest = { yearExpanded = false },
                  modifier = Modifier
                    .heightIn(max = 240.dp)
                    .background(Zinc900)
                ) {
                  years.forEach { yr ->
                    DropdownMenuItem(
                      text = { Text(yr, color = CinemaWhite, fontSize = 13.sp) },
                      onClick = {
                        selectedYear = yr
                        yearExpanded = false
                      }
                    )
                  }
                }
              }

              // Month Dropdown
              ExposedDropdownMenuBox(
                expanded = monthExpanded,
                onExpandedChange = { monthExpanded = !monthExpanded },
                modifier = Modifier.weight(1f)
              ) {
                OutlinedTextField(
                  value = selectedMonth,
                  onValueChange = {},
                  readOnly = true,
                  trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = monthExpanded) },
                  colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CinemaWhite,
                    unfocusedBorderColor = Zinc800,
                    focusedTextColor = CinemaWhite,
                    unfocusedTextColor = CinemaWhite
                  ),
                  shape = RoundedCornerShape(10.dp),
                  modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor()
                    .testTag("dob_month_dropdown")
                )
                ExposedDropdownMenu(
                  expanded = monthExpanded,
                  onDismissRequest = { monthExpanded = false },
                  modifier = Modifier
                    .heightIn(max = 240.dp)
                    .background(Zinc900)
                ) {
                  months.forEach { m ->
                    DropdownMenuItem(
                      text = { Text(m, color = CinemaWhite, fontSize = 13.sp) },
                      onClick = {
                        selectedMonth = m
                        monthExpanded = false
                      }
                    )
                  }
                }
              }

              // Day Dropdown
              ExposedDropdownMenuBox(
                expanded = dayExpanded,
                onExpandedChange = { dayExpanded = !dayExpanded },
                modifier = Modifier.weight(1f)
              ) {
                OutlinedTextField(
                  value = selectedDay,
                  onValueChange = {},
                  readOnly = true,
                  trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = dayExpanded) },
                  colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CinemaWhite,
                    unfocusedBorderColor = Zinc800,
                    focusedTextColor = CinemaWhite,
                    unfocusedTextColor = CinemaWhite
                  ),
                  shape = RoundedCornerShape(10.dp),
                  modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor()
                    .testTag("dob_day_dropdown")
                )
                ExposedDropdownMenu(
                  expanded = dayExpanded,
                  onDismissRequest = { dayExpanded = false },
                  modifier = Modifier
                    .heightIn(max = 240.dp)
                    .background(Zinc900)
                ) {
                  days.forEach { d ->
                    DropdownMenuItem(
                      text = { Text(d, color = CinemaWhite, fontSize = 13.sp) },
                      onClick = {
                        selectedDay = d
                        dayExpanded = false
                      }
                    )
                  }
                }
              }
            }
          }

          Spacer(modifier = Modifier.height(14.dp))
        }

        // Email Field
        OutlinedTextField(
          value = email,
          onValueChange = { email = it },
          label = { Text("Email", color = Zinc400) },
          placeholder = { Text("name@example.com", color = Zinc500) },
          leadingIcon = {
            Icon(
              imageVector = Icons.Default.Email,
              contentDescription = "Email Icon",
              tint = CinemaWhite
            )
          },
          singleLine = true,
          enabled = authState !is AuthState.Loading,
          keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Email,
            imeAction = ImeAction.Next
          ),
          keyboardActions = KeyboardActions(
            onNext = { focusManager.moveFocus(FocusDirection.Down) }
          ),
          colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = CinemaWhite,
            unfocusedBorderColor = Zinc800,
            focusedTextColor = CinemaWhite,
            unfocusedTextColor = CinemaWhite,
            cursorColor = CinemaWhite
          ),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("email_input")
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Password Field
        OutlinedTextField(
          value = password,
          onValueChange = { password = it },
          label = { Text("Password", color = Zinc400) },
          placeholder = { Text("••••••••", color = Zinc500) },
          leadingIcon = {
            Icon(
              imageVector = Icons.Default.Lock,
              contentDescription = "Lock Icon",
              tint = CinemaWhite
            )
          },
          trailingIcon = {
            IconButton(
              onClick = { isPasswordVisible = !isPasswordVisible },
              modifier = Modifier.size(48.dp)
            ) {
              Icon(
                imageVector = if (isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                contentDescription = if (isPasswordVisible) "Hide password" else "Show password",
                tint = CinemaWhite
              )
            }
          },
          visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
          singleLine = true,
          enabled = authState !is AuthState.Loading,
          keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Password,
            imeAction = if (isSignUpMode) ImeAction.Next else ImeAction.Done
          ),
          keyboardActions = KeyboardActions(
            onDone = {
              focusManager.clearFocus()
              if (isSignUpMode) {
                val dob = "$selectedYear-$selectedMonth-$selectedDay"
                viewModel.signUp(email, password, confirmPassword, firstName, lastName, dob, context, username)
              } else {
                viewModel.login(email, password)
              }
            }
          ),
          colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = CinemaWhite,
            unfocusedBorderColor = Zinc800,
            focusedTextColor = CinemaWhite,
            unfocusedTextColor = CinemaWhite,
            cursorColor = CinemaWhite
          ),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("password_input")
        )

        if (isSignUpMode) {
          Spacer(modifier = Modifier.height(14.dp))
          OutlinedTextField(
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = { Text("Confirm Password", color = Zinc400) },
            placeholder = { Text("••••••••", color = Zinc500) },
            leadingIcon = {
              Icon(
                imageVector = Icons.Default.Lock,
                contentDescription = "Confirm Lock Icon",
                tint = CinemaWhite
              )
            },
            visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            singleLine = true,
            enabled = authState !is AuthState.Loading,
            keyboardOptions = KeyboardOptions(
              keyboardType = KeyboardType.Password,
              imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(
              onDone = {
                focusManager.clearFocus()
                val dob = "$selectedYear-$selectedMonth-$selectedDay"
                viewModel.signUp(email, password, confirmPassword, firstName, lastName, dob, context, username)
              }
            ),
            colors = OutlinedTextFieldDefaults.colors(
              focusedBorderColor = CinemaWhite,
              unfocusedBorderColor = Zinc800,
              focusedTextColor = CinemaWhite,
              unfocusedTextColor = CinemaWhite,
              cursorColor = CinemaWhite
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("confirm_password_input")
          )
        }

        if (!isSignUpMode) {
          Spacer(modifier = Modifier.height(10.dp))

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End
          ) {
            Text(
              text = "Forgot password?",
              color = Zinc400,
              fontSize = 12.sp,
              fontWeight = FontWeight.Medium,
              modifier = Modifier
                .clickable {
                  resetPasswordEmail = email.ifBlank { "" }
                  showResetPasswordDialog = true
                }
                .padding(4.dp)
                .testTag("forgot_password_button")
            )
          }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Solid White Sign In / Sign Up Button
        Button(
          onClick = {
            focusManager.clearFocus()
            if (isSignUpMode) {
              val dob = "$selectedYear-$selectedMonth-$selectedDay"
              viewModel.signUp(email, password, confirmPassword, firstName, lastName, dob, context, username)
            } else {
              viewModel.login(email, password)
            }
          },
          enabled = authState !is AuthState.Loading,
          colors = ButtonDefaults.buttonColors(
            containerColor = Color.White,
            contentColor = Color.Black,
            disabledContainerColor = Color.White.copy(alpha = 0.5f),
            disabledContentColor = Color.Black.copy(alpha = 0.5f)
          ),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .testTag(if (isSignUpMode) "sign_up_action_button" else "sign_in_button")
        ) {
          if (authState is AuthState.Loading) {
            CircularProgressIndicator(
              color = Color.Black,
              strokeWidth = 2.5.dp,
              modifier = Modifier.size(24.dp)
            )
          } else {
            Text(
              text = if (isSignUpMode) "Sign Up" else "Sign In",
              color = Color.Black,
              fontWeight = FontWeight.Bold,
              fontSize = 16.sp
            )
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 1. GOOGLE SIGN-IN BUTTON (Fast Ping-Pong Gradient Background: #4285F4 -> #34A853 -> #FBBC05 -> #EA4335)
        val googleColors = listOf(Color(0xFF4285F4), Color(0xFF34A853), Color(0xFFFBBC05), Color(0xFFEA4335))
        Button(
          onClick = {
            focusManager.clearFocus()
            viewModel.signInWithGoogle(context)
          },
          enabled = authState !is AuthState.Loading,
          colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            contentColor = Color.White
          ),
          contentPadding = androidx.compose.foundation.layout.PaddingValues(0.dp),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .fastPingPongGradientBackground(googleColors, shape = RoundedCornerShape(12.dp))
            .testTag("google_auth_button")
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
          ) {
            Icon(
              painter = painterResource(id = R.drawable.ic_google_logo),
              contentDescription = "Google Logo",
              tint = Color.White,
              modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
              text = stringResource(R.string.continue_with_google),
              color = Color.White,
              fontWeight = FontWeight.Bold,
              fontSize = 15.sp
            )
          }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 2. YAHOO SIGN-IN BUTTON (Fast Ping-Pong Gradient Background: #6001D2 -> #7B2BE2 -> #9747FF)
        val yahooColors = listOf(Color(0xFF6001D2), Color(0xFF7B2BE2), Color(0xFF9747FF))
        Button(
          onClick = {
            focusManager.clearFocus()
            Toast.makeText(context, "Redirecting to Yahoo Sign-In...", Toast.LENGTH_SHORT).show()
          },
          enabled = authState !is AuthState.Loading,
          colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            contentColor = Color.White
          ),
          contentPadding = androidx.compose.foundation.layout.PaddingValues(0.dp),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .fastPingPongGradientBackground(yahooColors, shape = RoundedCornerShape(12.dp))
            .testTag("yahoo_auth_button")
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
          ) {
            Text(
              text = "Y!",
              color = Color.White,
              fontWeight = FontWeight.Black,
              fontSize = 20.sp
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
              text = stringResource(R.string.continue_with_yahoo),
              color = Color.White,
              fontWeight = FontWeight.Bold,
              fontSize = 15.sp
            )
          }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 3. FACEBOOK SIGN-IN BUTTON (Fast Ping-Pong Gradient Background: #1877F2 -> #0866FF)
        val facebookColors = listOf(Color(0xFF1877F2), Color(0xFF0866FF))
        Button(
          onClick = {
            focusManager.clearFocus()
            Log.d("FacebookAuthDiagnostic", "Facebook Auth Button Clicked. Launching LoginManager.logInWithReadPermissions with [email, public_profile]")
            
            val activity = context.let {
              var ctx = it
              while (ctx is android.content.ContextWrapper) {
                if (ctx is Activity) return@let ctx
                ctx = ctx.baseContext
              }
              null
            }
            
            if (activity != null) {
              LoginManager.getInstance().logInWithReadPermissions(
                activity,
                listOf("email", "public_profile")
              )
            } else {
              Log.e("FacebookAuthDiagnostic", "Facebook Auth Button Clicked failed: Context is not an Activity ($context)")
              Toast.makeText(context, "Unable to launch Facebook Login (Activity context required).", Toast.LENGTH_SHORT).show()
            }
          },
          enabled = authState !is AuthState.Loading,
          colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            contentColor = Color.White
          ),
          contentPadding = androidx.compose.foundation.layout.PaddingValues(0.dp),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .fastPingPongGradientBackground(facebookColors, shape = RoundedCornerShape(12.dp))
            .testTag("facebook_auth_button")
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
          ) {
            Icon(
              painter = painterResource(id = R.drawable.ic_facebook_logo),
              contentDescription = "Facebook",
              tint = Color.White,
              modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
              text = stringResource(R.string.continue_with_facebook),
              color = Color.White,
              fontWeight = FontWeight.Bold,
              fontSize = 15.sp
            )
          }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Sign Up / Sign In Toggle Prompt
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.Center,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = if (isSignUpMode) "Already have an account? " else "Don't have an account? ",
            color = Zinc400,
            fontSize = 13.sp
          )
          Text(
            text = if (isSignUpMode) "Sign In" else "Sign Up",
            color = CinemaWhite,
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp,
            modifier = Modifier
              .clickable {
                viewModel.resetState()
                isSignUpMode = !isSignUpMode
              }
              .padding(4.dp)
              .testTag("sign_up_button")
          )
        }

        Spacer(modifier = Modifier.height(24.dp))
      }
    }

    // RESET PASSWORD DIALOG
    if (showResetPasswordDialog) {
      AlertDialog(
        onDismissRequest = { showResetPasswordDialog = false },
        containerColor = Zinc900,
        shape = RoundedCornerShape(20.dp),
        title = {
          Text(text = "Reset Password", color = CinemaWhite, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        },
        text = {
          Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(text = "Enter your registered email address to receive a password reset link:", color = Zinc400, fontSize = 13.sp)
            OutlinedTextField(
              value = resetPasswordEmail,
              onValueChange = { resetPasswordEmail = it },
              placeholder = { Text("email@example.com", color = Zinc500) },
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
          }
        },
        confirmButton = {
          Button(
            onClick = {
              if (resetPasswordEmail.isNotBlank()) {
                FirebaseAuth.getInstance().sendPasswordResetEmail(resetPasswordEmail.trim())
                  .addOnSuccessListener {
                    Toast.makeText(context, "Password reset email sent!", Toast.LENGTH_LONG).show()
                  }
                  .addOnFailureListener { e ->
                    Toast.makeText(context, e.localizedMessage ?: "Failed to send reset email.", Toast.LENGTH_LONG).show()
                  }
                showResetPasswordDialog = false
              } else {
                Toast.makeText(context, "Please enter your email address.", Toast.LENGTH_SHORT).show()
              }
            },
            colors = ButtonDefaults.buttonColors(containerColor = CinemaWhite, contentColor = MinimalBlack),
            shape = RoundedCornerShape(10.dp)
          ) {
            Text(text = "Send Link", fontWeight = FontWeight.Bold)
          }
        },
        dismissButton = {
          TextButton(onClick = { showResetPasswordDialog = false }) {
            Text(text = "Cancel", color = Zinc400)
          }
        }
      )
    }
  }
}
