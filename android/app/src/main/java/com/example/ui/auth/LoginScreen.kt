package com.example.ui.auth

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel

/**
 * LoginScreen delegates to AuthScreen for unified Firebase authentication flow.
 */
@Composable
fun LoginScreen(
  onAuthSuccess: () -> Unit = {},
  onForgotPasswordClick: () -> Unit = {},
  viewModel: AuthViewModel = viewModel(factory = AuthViewModel.Factory),
  modifier: Modifier = Modifier
) {
  AuthScreen(
    onAuthSuccess = onAuthSuccess,
    onForgotPasswordClick = onForgotPasswordClick,
    viewModel = viewModel,
    modifier = modifier
  )
}
