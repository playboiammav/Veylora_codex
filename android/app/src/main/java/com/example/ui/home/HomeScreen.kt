package com.example.ui.home

import android.content.Intent
import androidx.activity.compose.BackHandler
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.Bookmarks
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Movie
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.SportsEsports
import androidx.compose.material.icons.rounded.Bookmarks
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.VideogameAsset
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.ui.res.stringResource
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import com.example.ui.publisher.PublisherGamesScreen
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.material.icons.outlined.People
import androidx.compose.material.icons.rounded.Badge
import androidx.compose.material.icons.rounded.People
import androidx.compose.material.icons.rounded.Search
import com.example.ui.auth.CompleteProfileScreen
import com.example.ui.components.VerifiedBadge
import com.example.ui.social.DigitalProfileCardScreen
import com.example.ui.social.FriendsChatScreen
import com.example.ui.social.GlobalChatScreen
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import com.example.R
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.deals.DealsViewModel
import com.example.ui.deals.GameDealsSection
import com.example.ui.deals.GameDealsScreen
import com.example.domain.model.ContentType
import com.example.domain.model.GameCompany
import com.example.domain.model.GameItem
import com.example.domain.model.Movie
import com.example.ui.auth.AuthScreen
import com.example.ui.auth.LoginScreen
import com.example.ui.settings.SettingsScreen
import com.example.ui.company.CompanyMoviesScreen
import com.example.ui.details.DetailsScreen
import com.example.ui.home.components.GameListItem
import com.example.ui.home.components.HeroFeaturedMovie
import com.example.ui.home.components.MovieDetailBottomSheet
import com.example.ui.home.components.MovieListItem
import com.example.ui.home.components.StandardGameCard
import com.example.ui.home.components.Top50GameListItem
import com.example.ui.home.components.TrendingGamesCarousel
import com.example.ui.home.components.TrendingMovieCard
import com.example.ui.home.components.TrendingMoviesCarousel
import com.example.ui.person.PersonDetailScreen
import com.google.firebase.auth.FirebaseAuth
import com.example.ui.theme.CinemaDarkGray
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.CinematicBorder
import com.example.ui.theme.CinematicBorderSubtle
import com.example.ui.theme.GlassBorder
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc200
import com.example.ui.theme.Zinc300
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc600
import com.example.ui.theme.Zinc700
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900
import com.example.ui.theme.Zinc950

enum class NavigationTab {
  HOME,
  WATCHLIST,
  PROFILE,
  REFRESH
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
  viewModel: HomeViewModel,
  isDarkMode: Boolean = true,
  onThemeChanged: (Boolean) -> Unit = {},
  modifier: Modifier = Modifier
) {
  val state by viewModel.state.collectAsStateWithLifecycle()
  var isSearchExpanded by remember { mutableStateOf(false) }
  var showAuthSheet by remember { mutableStateOf(false) }
  var showProfileDialog by remember { mutableStateOf(false) }
  var authUser by remember { mutableStateOf(FirebaseAuth.getInstance().currentUser) }

  DisposableEffect(Unit) {
    val listener = FirebaseAuth.AuthStateListener { auth ->
      val user = auth.currentUser
      authUser = user
      if (user != null) {
        showAuthSheet = false
      }
    }
    FirebaseAuth.getInstance().addAuthStateListener(listener)
    onDispose {
      FirebaseAuth.getInstance().removeAuthStateListener(listener)
    }
  }
  val focusManager = LocalFocusManager.current
  val context = LocalContext.current

  var currentRoute by remember { mutableStateOf("movies") }
  var needsOnboarding by remember { mutableStateOf(false) }

  var backPressCount by remember { mutableStateOf(0) }
  var lastBackPressTime by remember { mutableStateOf(0L) }

  BackHandler(enabled = true) {
    if (state.selectedMovie != null) {
      viewModel.handleIntent(HomeIntent.SelectMovie(null))
    } else if (state.selectedGame != null) {
      viewModel.handleIntent(HomeIntent.SelectGame(null))
    } else if (state.selectedCompany != null) {
      viewModel.handleIntent(HomeIntent.SelectCompany(null))
    } else if (state.selectedPublisher != null) {
      viewModel.handleIntent(HomeIntent.SelectPublisher(null))
    } else if (state.selectedPersonId != null) {
      viewModel.handleIntent(HomeIntent.SelectPerson(null))
    } else if (showAuthSheet) {
      showAuthSheet = false
    } else {
      // We are at a ROOT screen (Home/movies/games, Search, Friends, Card, Settings).
      val currentTime = System.currentTimeMillis()
      if (currentTime - lastBackPressTime > 3000) {
        backPressCount = 1
        lastBackPressTime = currentTime
        android.widget.Toast.makeText(context, "Press back 2 more times to exit", android.widget.Toast.LENGTH_SHORT).show()
      } else {
        backPressCount++
        lastBackPressTime = currentTime
        if (backPressCount >= 3) {
          (context as? android.app.Activity)?.finish()
        } else {
          android.widget.Toast.makeText(context, "Press back ${3 - backPressCount} more times to exit", android.widget.Toast.LENGTH_SHORT).show()
        }
      }
    }
  }

  LaunchedEffect(authUser?.uid) {
    val uid = authUser?.uid
    if (uid != null) {
      try {
        val doc = FirebaseFirestore.getInstance().collection("users").document(uid).get().await()
        val username = doc.getString("username").orEmpty()
        val dob = doc.getString("dob").orEmpty()
        if (!doc.exists() || username.isBlank() || dob.isBlank()) {
          needsOnboarding = true
        } else {
          needsOnboarding = false
        }
      } catch (_: Exception) {
      }
    } else {
      needsOnboarding = false
    }
  }

  if (authUser != null && needsOnboarding) {
    CompleteProfileScreen(
      onProfileCompleted = { needsOnboarding = false },
      onSignOut = {
        FirebaseAuth.getInstance().signOut()
        authUser = null
        needsOnboarding = false
      }
    )
    return
  }

  Scaffold(
    containerColor = MaterialTheme.colorScheme.background,
    topBar = {
      if (currentRoute != "settings") {
        TopAppBar(
          colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.background,
            titleContentColor = MaterialTheme.colorScheme.onBackground
          ),
          title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
              val photoUrl = authUser?.photoUrl
              if (photoUrl != null) {
                AsyncImage(
                  model = photoUrl,
                  contentDescription = "Profile Picture",
                  contentScale = ContentScale.Crop,
                  modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .border(1.dp, MaterialTheme.colorScheme.primary, CircleShape)
                )
              } else {
                Box(
                  modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(
                      Brush.linearGradient(
                        colors = listOf(Color(0xFF6001D2), Color(0xFFFF47A9))
                      )
                    ),
                  contentAlignment = Alignment.Center
                ) {
                  Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "Guest",
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                  )
                }
              }
              Spacer(modifier = Modifier.width(10.dp))
              Column {
                Text(
                  text = authUser?.displayName?.split(" ")?.firstOrNull() ?: authUser?.email?.substringBefore("@") ?: "Guest",
                  fontWeight = FontWeight.Bold,
                  fontSize = 16.sp,
                  color = MaterialTheme.colorScheme.onBackground
                )
              }
            }
          },
          actions = {
            // Circular Search Button ONLY (Gamepad icon REMOVED)
            Box(
              modifier = Modifier
                .padding(end = 12.dp)
                .size(42.dp)
                .clip(CircleShape)
                .border(1.dp, GlassBorder, CircleShape)
                .clickable {
                  isSearchExpanded = !isSearchExpanded
                  if (!isSearchExpanded) {
                    viewModel.handleIntent(HomeIntent.ClearSearch)
                  }
                }
                .testTag("search_toggle_button"),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = if (isSearchExpanded) Icons.Default.Clear else Icons.Default.Search,
                contentDescription = "Search",
                tint = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.size(20.dp)
              )
            }
          },
          modifier = Modifier.testTag("home_top_bar")
        )
      }
    },
    bottomBar = {
      // Floating Modern Pill-Shaped Navigation Bar with 5 Tabs
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
      ) {
        Surface(
          color = Zinc900.copy(alpha = 0.95f),
          shape = RoundedCornerShape(percent = 50),
          border = BorderStroke(1.dp, GlassBorder),
          shadowElevation = 12.dp,
          modifier = Modifier
            .fillMaxWidth()
            .height(64.dp)
        ) {
          Row(
            modifier = Modifier
              .fillMaxSize()
              .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
          ) {
            // 1. Home Tab
            val isHomeActive = currentRoute == "movies" || currentRoute == "games" || currentRoute == "home"
            Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              modifier = Modifier
                .clickable {
                  currentRoute = if (state.activeMediaType == MediaType.MOVIES) "movies" else "games"
                }
                .padding(4.dp)
                .testTag("nav_tab_home")
            ) {
              Icon(
                imageVector = if (isHomeActive) Icons.Rounded.Home else Icons.Outlined.Home,
                contentDescription = "Home",
                tint = if (isHomeActive) CinemaWhite else Zinc600,
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "Home",
                fontSize = 10.sp,
                fontWeight = if (isHomeActive) FontWeight.Bold else FontWeight.Normal,
                color = if (isHomeActive) CinemaWhite else Zinc600
              )
            }

            // 2. Search Tab
            val isSearchActive = currentRoute == "search"
            Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              modifier = Modifier
                .clickable {
                  currentRoute = "search"
                  isSearchExpanded = true
                }
                .padding(4.dp)
                .testTag("nav_tab_search")
            ) {
              Icon(
                imageVector = if (isSearchActive) Icons.Rounded.Search else Icons.Outlined.Search,
                contentDescription = "Search",
                tint = if (isSearchActive) CinemaWhite else Zinc600,
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "Search",
                fontSize = 10.sp,
                fontWeight = if (isSearchActive) FontWeight.Bold else FontWeight.Normal,
                color = if (isSearchActive) CinemaWhite else Zinc600
              )
            }

            // 3. Friends (Chat) Tab
            val isFriendsActive = currentRoute == "friends"
            Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              modifier = Modifier
                .clickable {
                  currentRoute = "friends"
                }
                .padding(4.dp)
                .testTag("nav_tab_friends")
            ) {
              Icon(
                imageVector = if (isFriendsActive) Icons.Rounded.People else Icons.Outlined.People,
                contentDescription = "Friends",
                tint = if (isFriendsActive) CinemaWhite else Zinc600,
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "Friends",
                fontSize = 10.sp,
                fontWeight = if (isFriendsActive) FontWeight.Bold else FontWeight.Normal,
                color = if (isFriendsActive) CinemaWhite else Zinc600
              )
            }

            // 4. Card (Digital Profile) Tab
            val isCardActive = currentRoute == "card"
            Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              modifier = Modifier
                .clickable {
                  currentRoute = "card"
                }
                .padding(4.dp)
                .testTag("nav_tab_card")
            ) {
              Icon(
                imageVector = if (isCardActive) Icons.Rounded.Badge else Icons.Outlined.Badge,
                contentDescription = "Card",
                tint = if (isCardActive) CinemaWhite else Zinc600,
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "Card",
                fontSize = 10.sp,
                fontWeight = if (isCardActive) FontWeight.Bold else FontWeight.Normal,
                color = if (isCardActive) CinemaWhite else Zinc600
              )
            }

            // 5. Settings Tab
            val isSettingsActive = currentRoute == "settings"
            Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              modifier = Modifier
                .clickable {
                  currentRoute = "settings"
                }
                .padding(4.dp)
                .testTag("nav_tab_settings")
            ) {
              Icon(
                imageVector = if (isSettingsActive) Icons.Rounded.Settings else Icons.Outlined.Settings,
                contentDescription = "Settings",
                tint = if (isSettingsActive) CinemaWhite else Zinc600,
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "Settings",
                fontSize = 10.sp,
                fontWeight = if (isSettingsActive) FontWeight.Bold else FontWeight.Normal,
                color = if (isSettingsActive) CinemaWhite else Zinc600
              )
            }
          }
        }
      }
    },
    modifier = modifier
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .background(MinimalBlack)
    ) {
      if (currentRoute == "settings") {
        SettingsScreen(
          isDarkMode = isDarkMode,
          onThemeChanged = onThemeChanged,
          onBackClick = {
            currentRoute = "movies"
          },
          onSignInClick = {
            showAuthSheet = true
          },
          onSignOutClick = {
            FirebaseAuth.getInstance().signOut()
            authUser = null
          }
        )
      } else if (currentRoute == "friends") {
        var isGlobalChatActive by remember { mutableStateOf(false) }
        BackHandler(enabled = isGlobalChatActive) {
          isGlobalChatActive = false
        }
        if (isGlobalChatActive) {
          GlobalChatScreen(
            currentUserUid = authUser?.uid ?: "",
            currentUserName = authUser?.displayName ?: authUser?.email?.substringBefore("@") ?: "Guest",
            onBack = { isGlobalChatActive = false }
          )
        } else {
          FriendsChatScreen(
            onOpenGlobalChat = { isGlobalChatActive = true }
          )
        }
      } else if (currentRoute == "card") {
        DigitalProfileCardScreen()
      } else if (currentRoute == "library") {
        PullToRefreshBox(
          isRefreshing = state.isLoading,
          onRefresh = { viewModel.handleIntent(HomeIntent.Refresh) },
          modifier = Modifier.fillMaxSize()
        ) {
          WatchlistView(
            favorites = state.favoriteMovies,
            onMovieClick = { viewModel.handleIntent(HomeIntent.SelectMovie(it)) },
            onFavoriteClick = { viewModel.handleIntent(HomeIntent.ToggleFavorite(it)) },
            onExploreClick = { currentRoute = "movies" }
          )
        }
      } else {
        PullToRefreshBox(
          isRefreshing = state.isLoading || state.isLoadingGames,
          onRefresh = { viewModel.handleIntent(HomeIntent.Refresh) },
          modifier = Modifier.fillMaxSize()
        ) {
          Column(modifier = Modifier.fillMaxSize()) {
          // Media Switcher Pill (Movies vs Games)
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.Center
          ) {
            Surface(
              color = Zinc950,
              shape = RoundedCornerShape(50.dp),
              border = BorderStroke(1.dp, CinematicBorderSubtle)
            ) {
              Row(modifier = Modifier.padding(4.dp)) {
                MediaType.entries.forEach { mediaType ->
                  val isSelected = state.activeMediaType == mediaType
                  Surface(
                    color = if (isSelected) CinemaWhite else Color.Transparent,
                    shape = RoundedCornerShape(50.dp),
                    modifier = Modifier
                      .clickable {
                        viewModel.handleIntent(HomeIntent.SelectMediaType(mediaType))
                        currentRoute = if (mediaType == MediaType.MOVIES) "movies" else "games"
                      }
                      .testTag("media_tab_${mediaType.name.lowercase()}")
                  ) {
                    Text(
                      text = mediaType.displayName.uppercase(),
                      color = if (isSelected) MinimalBlack else Zinc400,
                      fontSize = 11.sp,
                      fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                      letterSpacing = 1.sp,
                      modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                    )
                  }
                }
              }
            }
          }

        // Search Bar (Expanded)
        AnimatedVisibility(
          visible = isSearchExpanded,
          enter = fadeIn(),
          exit = fadeOut()
        ) {
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 16.dp, vertical = 6.dp)
          ) {
            OutlinedTextField(
              value = state.searchQuery,
              onValueChange = { viewModel.handleIntent(HomeIntent.SearchQueryChanged(it)) },
              placeholder = {
                Text(
                  if (state.activeMediaType == MediaType.MOVIES) "Search TMDB titles..." else "Search RAWG games...",
                  color = Zinc500,
                  fontSize = 14.sp
                )
              },
              singleLine = true,
              leadingIcon = {
                Icon(
                  imageVector = Icons.Default.Search,
                  contentDescription = null,
                  tint = Zinc400
                )
              },
              trailingIcon = {
                if (state.searchQuery.isNotEmpty()) {
                  IconButton(onClick = { viewModel.handleIntent(HomeIntent.ClearSearch) }) {
                    Icon(
                      imageVector = Icons.Default.Clear,
                      contentDescription = "Clear",
                      tint = CinemaWhite
                    )
                  }
                }
              },
              keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
              keyboardActions = KeyboardActions(onSearch = { focusManager.clearFocus() }),
              colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Zinc900,
                unfocusedContainerColor = Zinc950,
                focusedBorderColor = CinemaWhite,
                unfocusedBorderColor = CinematicBorderSubtle,
                focusedTextColor = CinemaWhite,
                unfocusedTextColor = CinemaWhite,
                cursorColor = CinemaWhite
              ),
              shape = RoundedCornerShape(16.dp),
              modifier = Modifier
                .fillMaxWidth()
                .testTag("search_input")
            )
          }
        }

        // Error Banner
        state.errorMessage?.let { error ->
          Surface(
            color = Zinc900,
            border = BorderStroke(1.dp, CinematicBorderSubtle),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 16.dp, vertical = 6.dp)
              .testTag("error_banner")
          ) {
            Row(
              modifier = Modifier.padding(12.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Text(
                text = error,
                color = Zinc300,
                fontSize = 12.sp,
                modifier = Modifier.weight(1f)
              )
              Spacer(modifier = Modifier.width(8.dp))
              Button(
                onClick = { viewModel.handleIntent(HomeIntent.Refresh) },
                colors = ButtonDefaults.buttonColors(
                  containerColor = CinemaWhite,
                  contentColor = MinimalBlack
                ),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
              ) {
                Text("Retry", fontSize = 12.sp, fontWeight = FontWeight.Bold)
              }
            }
          }
        }

        // Main Scroll Content
        if (state.showFavoritesOnly) {
          // Watchlist View
          WatchlistView(
            favorites = state.favoriteMovies,
            onMovieClick = { viewModel.handleIntent(HomeIntent.SelectMovie(it)) },
            onFavoriteClick = { viewModel.handleIntent(HomeIntent.ToggleFavorite(it)) },
            onExploreClick = { viewModel.handleIntent(HomeIntent.ToggleFavoritesFilter) }
          )
        } else if (isSearchExpanded && state.searchQuery.isNotBlank()) {
          // Search Results View
          if (state.activeMediaType == MediaType.MOVIES) {
            SearchResultsView(
              results = state.searchResults,
              isSearching = state.isSearching,
              query = state.searchQuery,
              onMovieClick = { viewModel.handleIntent(HomeIntent.SelectMovie(it)) },
              onFavoriteClick = { viewModel.handleIntent(HomeIntent.ToggleFavorite(it)) }
            )
          } else {
            GameSearchResultsView(
              results = state.gameSearchResults,
              isSearching = state.isSearching,
              query = state.searchQuery,
              onGameClick = { viewModel.handleIntent(HomeIntent.SelectGame(it)) }
            )
          }
        } else if (state.activeMediaType == MediaType.MOVIES) {
          // MOVIES TAB
          if (state.isLoading && state.trendingMovies.isEmpty() && state.categorizedMovies.isEmpty()) {
            Box(
              modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
              contentAlignment = Alignment.Center
            ) {
              Column(horizontalAlignment = Alignment.CenterHorizontally) {
                CircularProgressIndicator(
                  color = CinemaWhite,
                  strokeWidth = 2.5.dp,
                  modifier = Modifier.size(44.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                  text = "FETCHING TMDB CATALOG...",
                  color = Zinc400,
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  letterSpacing = 1.5.sp
                )
              }
            }
          } else {
            LazyColumn(
              modifier = Modifier
                .fillMaxSize()
                .testTag("home_content_list"),
              contentPadding = PaddingValues(bottom = 90.dp)
            ) {
              // 1. Trending Movies Carousel (HorizontalPager Auto-Slider)
              if (state.trendingMovies.isNotEmpty()) {
                item(key = "trending_movies_carousel") {
                  TrendingMoviesCarousel(
                    movies = state.trendingMovies,
                    onMovieClick = { viewModel.handleIntent(HomeIntent.SelectMovie(it)) },
                    onFavoriteClick = { viewModel.handleIntent(HomeIntent.ToggleFavorite(it)) }
                  )
                  Spacer(modifier = Modifier.height(14.dp))
                }
              } else {
                state.featuredMovie?.let { featured ->
                  item(key = "featured_spotlight") {
                    HeroFeaturedMovie(
                      movie = featured,
                      onMovieClick = { viewModel.handleIntent(HomeIntent.SelectMovie(it)) },
                      onFavoriteClick = { viewModel.handleIntent(HomeIntent.ToggleFavorite(it)) }
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                  }
                }
              }

              // 2. Trending Movies Rail
              if (state.trendingMovies.isNotEmpty()) {
                item(key = "trending_rail_section") {
                  Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                      modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp),
                      verticalAlignment = Alignment.CenterVertically,
                      horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                      Text(
                        text = "TRENDING NOW",
                        color = Zinc400,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                      )

                      Text(
                        text = "View All",
                        color = CinemaWhite,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier
                          .clickable { viewModel.handleIntent(HomeIntent.SelectCategory(MovieCategory.TRENDING)) }
                      )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    LazyRow(
                      contentPadding = PaddingValues(horizontal = 16.dp),
                      horizontalArrangement = Arrangement.spacedBy(12.dp),
                      modifier = Modifier.testTag("trending_rail")
                    ) {
                      items(
                        items = state.trendingMovies,
                        key = { "trending_${it.id}" }
                      ) { movie ->
                        TrendingMovieCard(
                          movie = movie,
                          onMovieClick = { viewModel.handleIntent(HomeIntent.SelectMovie(it)) },
                          onFavoriteClick = { viewModel.handleIntent(HomeIntent.ToggleFavorite(it)) }
                        )
                      }
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                  }
                }
              }

              // 3. Category Selector Chips
              item(key = "category_tabs") {
                Column(modifier = Modifier.fillMaxWidth()) {
                  Row(
                    modifier = Modifier
                      .fillMaxWidth()
                      .padding(horizontal = 18.dp),
                    verticalAlignment = Alignment.CenterVertically
                  ) {
                    Text(
                      text = "EXPLORE CATALOG",
                      color = Zinc400,
                      fontSize = 13.sp,
                      fontWeight = FontWeight.Bold,
                      letterSpacing = 1.5.sp
                    )
                  }

                  Spacer(modifier = Modifier.height(10.dp))

                  LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.testTag("category_chips_row")
                  ) {
                    items(
                      items = MovieCategory.entries.toTypedArray(),
                      key = { it.name }
                    ) { category ->
                      val isSelected = state.selectedCategory == category
                      Surface(
                        color = if (isSelected) CinemaWhite else Zinc900,
                        shape = RoundedCornerShape(50.dp),
                        border = BorderStroke(
                          1.dp,
                          if (isSelected) CinemaWhite else CinematicBorderSubtle
                        ),
                        modifier = Modifier
                          .clickable { viewModel.handleIntent(HomeIntent.SelectCategory(category)) }
                          .testTag("category_chip_${category.name}")
                      ) {
                        Text(
                          text = category.displayName.uppercase(),
                          color = if (isSelected) MinimalBlack else Zinc400,
                          fontSize = 11.sp,
                          fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                          letterSpacing = 0.5.sp,
                          modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                        )
                      }
                    }
                  }

                  Spacer(modifier = Modifier.height(14.dp))
                }
              }

              // 4. Categorized Movie List
              items(
                items = state.categorizedMovies,
                key = { "cat_${state.selectedCategory.name}_${it.id}" }
              ) { movie ->
                Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                  MovieListItem(
                    movie = movie,
                    onMovieClick = { viewModel.handleIntent(HomeIntent.SelectMovie(it)) },
                    onFavoriteClick = { viewModel.handleIntent(HomeIntent.ToggleFavorite(it)) }
                  )
                }
              }
            }
          }
        } else {
          // GAMES TAB (RAWG)
          if (state.isLoadingGames && state.gamesList.isEmpty()) {
            Box(
              modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
              contentAlignment = Alignment.Center
            ) {
              Column(horizontalAlignment = Alignment.CenterHorizontally) {
                CircularProgressIndicator(
                  color = CinemaWhite,
                  strokeWidth = 2.5.dp,
                  modifier = Modifier.size(44.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                  text = "FETCHING RAWG GAMES...",
                  color = Zinc400,
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  letterSpacing = 1.5.sp
                )
              }
            }
          } else {
            LazyColumn(
              modifier = Modifier
                .fillMaxSize()
                .testTag("games_content_list"),
              contentPadding = PaddingValues(bottom = 90.dp)
            ) {
              // 1. Trending Games Carousel with HorizontalPager peeking effect & page indicator dots
              val trendingGames = if (state.trendingGames.isNotEmpty()) state.trendingGames else state.gamesList
              if (trendingGames.isNotEmpty()) {
                item(key = "trending_games_carousel_header") {
                  Text(
                    text = "TRENDING RELEASES",
                    color = Zinc400,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp,
                    modifier = Modifier.padding(start = 18.dp, top = 8.dp, bottom = 12.dp)
                  )
                }

                item(key = "trending_games_carousel") {
                  TrendingGamesCarousel(
                    games = trendingGames,
                    onGameClick = { viewModel.handleIntent(HomeIntent.SelectGame(it)) },
                    onStoreClick = { url ->
                      try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        context.startActivity(intent)
                      } catch (_: Exception) {}
                    }
                  )
                  Spacer(modifier = Modifier.height(16.dp))
                }
              }

              // SECTION 1: UPCOMING RELEASES (Games releasing soon, display release dates)
              val upcomingList = if (state.upcomingGames.isNotEmpty()) state.upcomingGames else state.gamesList.filter { (it.releaseDate ?: "") > "2026-08-28" || it.title.contains("GTA", ignoreCase = true) }
              if (upcomingList.isNotEmpty()) {
                item(key = "upcoming_releases_header") {
                  Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                      text = "UPCOMING RELEASES",
                      color = Zinc400,
                      fontSize = 13.sp,
                      fontWeight = FontWeight.Bold,
                      letterSpacing = 1.5.sp,
                      modifier = Modifier.padding(horizontal = 18.dp, vertical = 6.dp)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    LazyRow(
                      contentPadding = PaddingValues(horizontal = 16.dp),
                      horizontalArrangement = Arrangement.spacedBy(12.dp),
                      modifier = Modifier.testTag("upcoming_games_horizontal_row")
                    ) {
                      items(
                        items = upcomingList.take(10),
                        key = { "upcoming_card_${it.id}" }
                      ) { game ->
                        StandardGameCard(
                          game = game,
                          showReleaseDate = true,
                          onGameClick = { viewModel.handleIntent(HomeIntent.SelectGame(it)) }
                        )
                      }
                    }

                    Spacer(modifier = Modifier.height(20.dp))
                  }
                }
              }

              // SECTION 2: TOP 50 GAMES GLOBALLY (Ranked by Metacritic / RAWG rating)
              val top50List = if (state.top50GamesGlobally.isNotEmpty()) state.top50GamesGlobally else state.gamesList
              if (top50List.isNotEmpty()) {
                item(key = "top50_games_header") {
                  Text(
                    text = "TOP 50 GAMES GLOBALLY",
                    color = Zinc400,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp,
                    modifier = Modifier.padding(start = 18.dp, end = 18.dp, top = 8.dp, bottom = 10.dp)
                  )
                }

                items(
                  count = top50List.size,
                  key = { index -> "top50_game_${top50List[index].id}_$index" }
                ) { index ->
                  val game = top50List[index]
                  Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                    Top50GameListItem(
                      game = game,
                      rank = index + 1,
                      onGameClick = { viewModel.handleIntent(HomeIntent.SelectGame(it)) }
                    )
                  }
                }

                item(key = "top50_games_spacer") {
                  Spacer(modifier = Modifier.height(16.dp))
                }
              }

              // SECTION 3: RECENTLY RELEASED (Games just dropped)
              val recentList = if (state.recentlyReleasedGames.isNotEmpty()) state.recentlyReleasedGames else state.gamesList
              if (recentList.isNotEmpty()) {
                item(key = "recently_released_header") {
                  Text(
                    text = "RECENTLY RELEASED",
                    color = Zinc400,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp,
                    modifier = Modifier.padding(horizontal = 18.dp, vertical = 6.dp)
                  )
                }

                items(
                  items = recentList,
                  key = { "recent_game_item_${it.id}" }
                ) { game ->
                  Box(modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                    GameListItem(
                      game = game,
                      showReleaseDate = false,
                      onGameClick = { viewModel.handleIntent(HomeIntent.SelectGame(it)) }
                    )
                  }
                }
              }
            }
          }
        }
      }
      }

      // Movie Details Modal Bottom Sheet
      state.selectedMovie?.let { movie ->
        val contentType = ContentType.Movie(
          watchProviders = state.selectedMovieDetails?.watchProviders.orEmpty(),
          productionCompanies = state.selectedMovieDetails?.productionCompany?.let { listOf(it) }.orEmpty()
        )

        DetailsScreen(
          title = movie.title,
          backdropPath = movie.highResBackdropUrl ?: movie.backdropUrl ?: movie.posterUrl,
          posterUrl = movie.highResPosterUrl ?: movie.posterUrl,
          rating = movie.voteAverage,
          formattedRating = movie.formattedRating,
          voteCount = movie.voteCount,
          releaseDate = movie.releaseDate ?: movie.releaseYear,
          overview = movie.overview,
          contentType = contentType,
          isFavorite = movie.isFavorite,
          userRating = state.currentUserRating,
          onRateContent = { rating ->
            viewModel.handleIntent(HomeIntent.RateContent("movie_${movie.id}", rating))
          },
          cast = state.selectedMovieDetails?.cast.orEmpty(),
          videos = state.selectedMovieDetails?.videos.orEmpty(),
          isLoadingDetails = state.isLoadingDetails,
          onDismiss = { viewModel.handleIntent(HomeIntent.SelectMovie(null)) },
          onFavoriteClick = { viewModel.handleIntent(HomeIntent.ToggleFavorite(movie)) },
          onCompanyClick = { company ->
            // Close details bottom sheet before opening company screen to avoid overlapping sheets
            viewModel.handleIntent(HomeIntent.SelectMovie(null))
            viewModel.handleIntent(HomeIntent.SelectCompany(company))
          },
          onPersonClick = { personId ->
            // Close details bottom sheet before opening actor screen
            viewModel.handleIntent(HomeIntent.SelectMovie(null))
            viewModel.handleIntent(HomeIntent.SelectPerson(personId))
          }
        )
      }

      // Game Details Modal Bottom Sheet
      state.selectedGame?.let { game ->
        val gameDetails = state.selectedGameDetails
        val effectiveGame = gameDetails?.game ?: game
        val contentType = ContentType.Game(
          platforms = effectiveGame.platforms,
          stores = if (effectiveGame.stores.isNotEmpty()) effectiveGame.stores else gameDetails?.stores.orEmpty(),
          publishers = effectiveGame.publishers,
          publishersList = effectiveGame.publishersList,
          developers = effectiveGame.developers,
          developersList = effectiveGame.developersList,
          developerCompany = effectiveGame.developerCompany ?: gameDetails?.developerCompany,
          metacritic = effectiveGame.metacritic,
          websiteUrl = effectiveGame.websiteUrl,
          screenshots = if (effectiveGame.screenshots.isNotEmpty()) effectiveGame.screenshots else (gameDetails?.screenshots?.takeIf { it.isNotEmpty() } ?: listOfNotNull(effectiveGame.backdropUrl, effectiveGame.posterUrl)),
          dominantColor = effectiveGame.dominantColor,
          saturatedColor = effectiveGame.saturatedColor,
          editions = if (effectiveGame.editions.isNotEmpty()) effectiveGame.editions else gameDetails?.editions.orEmpty(),
          pcRequirements = effectiveGame.pcRequirements ?: gameDetails?.pcRequirements,
          supportedHardware = if (effectiveGame.supportedHardware.isNotEmpty()) effectiveGame.supportedHardware else gameDetails?.supportedHardware.orEmpty(),
          price = effectiveGame.price ?: gameDetails?.price
        )

        DetailsScreen(
          title = effectiveGame.title,
          backdropPath = effectiveGame.backdropUrl ?: effectiveGame.posterUrl,
          posterUrl = effectiveGame.posterUrl ?: effectiveGame.backdropUrl,
          rating = effectiveGame.rating,
          formattedRating = effectiveGame.formattedRating,
          voteCount = 0,
          releaseDate = effectiveGame.releaseDate ?: effectiveGame.releaseYear,
          overview = effectiveGame.overview,
          contentType = contentType,
          isFavorite = false,
          userRating = state.currentUserRating,
          onRateContent = { rating ->
            viewModel.handleIntent(HomeIntent.RateContent("game_${effectiveGame.id}", rating))
          },
          isLoadingDetails = state.isLoadingDetails,
          onDismiss = { viewModel.handleIntent(HomeIntent.SelectGame(null)) },
          onPublisherClick = { company ->
            viewModel.handleIntent(HomeIntent.SelectGame(null))
            viewModel.handleIntent(HomeIntent.SelectPublisher(company))
          },
          onBuyNowClick = { url ->
            try {
              val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
              intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
              context.startActivity(intent)
            } catch (_: Exception) {}
          }
        )
      }

      // Company Movies Screen Overlay
      state.selectedCompany?.let { company ->
        CompanyMoviesScreen(
          company = company,
          movies = state.companyMovies,
          isLoading = state.isLoadingCompanyMovies,
          errorMessage = state.companyErrorMessage,
          onBackClick = { viewModel.handleIntent(HomeIntent.SelectCompany(null)) },
          onMovieClick = { viewModel.handleIntent(HomeIntent.SelectMovie(it)) },
          onFavoriteClick = { viewModel.handleIntent(HomeIntent.ToggleFavorite(it)) },
          onRetry = { viewModel.handleIntent(HomeIntent.SelectCompany(company)) }
        )
      }

      // Publisher Games Screen Overlay
      state.selectedPublisher?.let { publisher ->
        PublisherGamesScreen(
          publisher = publisher,
          games = state.publisherGames,
          isLoading = state.isLoadingPublisherGames,
          errorMessage = state.publisherErrorMessage,
          onBackClick = { viewModel.handleIntent(HomeIntent.SelectPublisher(null)) },
          onGameClick = { viewModel.handleIntent(HomeIntent.SelectGame(it)) },
          onRetry = { viewModel.handleIntent(HomeIntent.SelectPublisher(publisher)) }
        )
      }

      // Person Details Screen Overlay
      state.selectedPersonId?.let { personId ->
        PersonDetailScreen(
          personDetails = state.selectedPersonDetails,
          isLoading = state.isLoadingPersonDetails,
          errorMessage = state.personErrorMessage,
          onBackClick = { viewModel.handleIntent(HomeIntent.SelectPerson(null)) },
          onMovieClick = { viewModel.handleIntent(HomeIntent.SelectMovie(it)) },
          onFavoriteClick = { viewModel.handleIntent(HomeIntent.ToggleFavorite(it)) },
          onRetry = { viewModel.handleIntent(HomeIntent.SelectPerson(personId)) }
        )
      }
      }

      // Login / Sign Up Bottom Sheet Modal
      if (showAuthSheet) {
        ModalBottomSheet(
          onDismissRequest = { showAuthSheet = false },
          sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
          containerColor = MinimalBlack,
          dragHandle = null
        ) {
          AuthScreen(
            onAuthSuccess = {
              authUser = FirebaseAuth.getInstance().currentUser
              showAuthSheet = false
            }
          )
        }
      }
    }
  }
}

@Composable
private fun WatchlistView(
  favorites: List<Movie>,
  onMovieClick: (Movie) -> Unit,
  onFavoriteClick: (Movie) -> Unit,
  onExploreClick: () -> Unit
) {
  if (favorites.isEmpty()) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(32.dp),
      contentAlignment = Alignment.Center
    ) {
      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
      ) {
        Box(
          modifier = Modifier
            .size(64.dp)
            .clip(CircleShape)
            .border(1.dp, GlassBorder, CircleShape),
          contentAlignment = Alignment.Center
        ) {
          Icon(
            imageVector = Icons.Rounded.VideogameAsset,
            contentDescription = null,
            tint = Zinc500,
            modifier = Modifier.size(28.dp)
          )
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text(
          text = "YOUR LIBRARY IS EMPTY",
          color = CinemaWhite,
          fontSize = 15.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
          text = "Save your favorite movies, series, and games to your universal library.",
          color = Zinc500,
          fontSize = 12.sp,
          textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        Spacer(modifier = Modifier.height(18.dp))
        Button(
          onClick = onExploreClick,
          colors = ButtonDefaults.buttonColors(
            containerColor = CinemaWhite,
            contentColor = MinimalBlack
          ),
          shape = RoundedCornerShape(14.dp)
        ) {
          Text("Explore Movies & Games", fontWeight = FontWeight.Bold)
        }
      }
    }
  } else {
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .padding(horizontal = 16.dp),
      contentPadding = PaddingValues(top = 12.dp, bottom = 32.dp),
      verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      item {
        Text(
          text = "SAVED WATCHLIST (${favorites.size})",
          color = Zinc400,
          fontSize = 12.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.2.sp,
          modifier = Modifier.padding(bottom = 6.dp, start = 2.dp)
        )
      }
      items(favorites, key = { "fav_${it.id}" }) { movie ->
        MovieListItem(
          movie = movie,
          onMovieClick = onMovieClick,
          onFavoriteClick = onFavoriteClick
        )
      }
    }
  }
}

@Composable
private fun SearchResultsView(
  results: List<Movie>,
  isSearching: Boolean,
  query: String,
  onMovieClick: (Movie) -> Unit,
  onFavoriteClick: (Movie) -> Unit
) {
  if (isSearching) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(32.dp),
      contentAlignment = Alignment.Center
    ) {
      CircularProgressIndicator(
        color = CinemaWhite,
        strokeWidth = 2.dp,
        modifier = Modifier.size(36.dp)
      )
    }
  } else if (results.isEmpty()) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(32.dp),
      contentAlignment = Alignment.Center
    ) {
      Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
          text = "NO RESULTS FOUND",
          color = CinemaWhite,
          fontSize = 14.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
          text = "No movies matching \"$query\"",
          color = Zinc500,
          fontSize = 12.sp
        )
      }
    }
  } else {
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .padding(horizontal = 16.dp),
      contentPadding = PaddingValues(top = 8.dp, bottom = 32.dp),
      verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      item {
        Text(
          text = "FOUND ${results.size} MATCHES",
          color = Zinc400,
          fontSize = 12.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.sp,
          modifier = Modifier.padding(bottom = 4.dp, start = 2.dp)
        )
      }
      items(results, key = { "search_${it.id}" }) { movie ->
        MovieListItem(
          movie = movie,
          onMovieClick = onMovieClick,
          onFavoriteClick = onFavoriteClick
        )
      }
    }
  }
}

@Composable
private fun GameSearchResultsView(
  results: List<GameItem>,
  isSearching: Boolean,
  query: String,
  onGameClick: (GameItem) -> Unit
) {
  if (isSearching) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(32.dp),
      contentAlignment = Alignment.Center
    ) {
      CircularProgressIndicator(
        color = CinemaWhite,
        strokeWidth = 2.dp,
        modifier = Modifier.size(36.dp)
      )
    }
  } else if (results.isEmpty()) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(32.dp),
      contentAlignment = Alignment.Center
    ) {
      Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
          text = "NO GAME RESULTS FOUND",
          color = CinemaWhite,
          fontSize = 14.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
          text = "No games matching \"$query\"",
          color = Zinc500,
          fontSize = 12.sp
        )
      }
    }
  } else {
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .padding(horizontal = 16.dp),
      contentPadding = PaddingValues(top = 8.dp, bottom = 32.dp),
      verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
      item {
        Text(
          text = "FOUND ${results.size} MATCHES",
          color = Zinc400,
          fontSize = 12.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.sp,
          modifier = Modifier.padding(bottom = 4.dp, start = 2.dp)
        )
      }
      items(results, key = { "search_game_${it.id}" }) { game ->
        GameListItem(
          game = game,
          onGameClick = onGameClick
        )
      }
    }
  }
}


