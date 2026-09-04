package com.example

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.home.HomeScreen
import com.example.ui.home.HomeViewModel
import com.example.ui.theme.ThemeManager
import com.example.ui.theme.VeyloraTheme
import com.facebook.CallbackManager

class MainActivity : ComponentActivity() {

  private val homeViewModel: HomeViewModel by viewModels { HomeViewModel.Factory }

  companion object {
    var callbackManager: CallbackManager? = null
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Explicitly request maximum available display refresh rate (120Hz/144Hz support)
    try {
      val displayToUse = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
        display
      } else {
        @Suppress("DEPRECATION")
        windowManager.defaultDisplay
      }
      val modes = displayToUse?.supportedModes
      val bestMode = modes?.maxByOrNull { it.refreshRate }
      if (bestMode != null) {
        val layoutParams = window.attributes
        layoutParams.preferredDisplayModeId = bestMode.modeId
        window.attributes = layoutParams
      }
    } catch (e: Exception) {
      Log.e("MainActivity", "Error setting preferred display mode refresh rate", e)
    }

    enableEdgeToEdge()
    setContent {
      val isDarkMode by ThemeManager.isDarkMode.collectAsStateWithLifecycle()
      VeyloraTheme(darkTheme = isDarkMode) {
        Surface(
          modifier = Modifier.fillMaxSize(),
          color = MaterialTheme.colorScheme.background
        ) {
          HomeScreen(
            viewModel = homeViewModel,
            isDarkMode = isDarkMode,
            onThemeChanged = { enabled -> ThemeManager.setDarkMode(enabled) },
            modifier = Modifier.fillMaxSize()
          )
        }
      }
    }
  }

  @Deprecated("Deprecated in Java")
  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    Log.d("FacebookAuthDiagnostic", "MainActivity.onActivityResult called with requestCode: $requestCode, resultCode: $resultCode")
    val handled = callbackManager?.onActivityResult(requestCode, resultCode, data)
    Log.d("FacebookAuthDiagnostic", "CallbackManager handled result: $handled")
  }
}
