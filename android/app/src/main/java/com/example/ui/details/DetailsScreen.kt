package com.example.ui.details

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.compose.animation.animateColor
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.keyframes
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.ui.geometry.Offset
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
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
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForwardIos
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.rounded.Bookmark
import androidx.compose.material.icons.rounded.BookmarkBorder
import androidx.compose.material.icons.rounded.Movie
import androidx.compose.material.icons.rounded.VideogameAsset
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.res.painterResource
import com.example.R
import com.example.ui.home.components.DynamicCountdownTimer
import androidx.compose.material.icons.filled.Close
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.rounded.SportsEsports
import androidx.compose.material.icons.rounded.ArrowForward
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.foundation.layout.wrapContentHeight
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.AbstractYouTubePlayerListener
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView
import coil.compose.AsyncImage
import coil.compose.SubcomposeAsyncImage
import coil.request.CachePolicy
import coil.request.ImageRequest
import com.example.domain.model.CastMember
import com.example.domain.model.ContentType
import com.example.domain.model.GameCompany
import com.example.domain.model.GameEdition
import com.example.domain.model.GamePlatform
import com.example.domain.model.GamePrice
import com.example.domain.model.GameStoreLink
import com.example.domain.model.MovieVideo
import com.example.domain.model.ProductionCompany
import com.example.domain.model.WatchProvider
import com.example.domain.model.isVerifiedCompany
import com.example.ui.home.components.AnimatedGradientStoreButton
import com.example.ui.home.components.PlatformBadge
import com.example.ui.home.components.getCleanPlatformName
import com.example.ui.home.components.getPlatformGradient
import com.example.ui.home.components.getSimpleIconName
import com.example.ui.theme.CinemaWhite
import com.example.ui.theme.CinematicBorderSubtle
import com.example.ui.theme.GlassBorder
import com.example.ui.theme.MinimalBlack
import com.example.ui.theme.Zinc300
import com.example.ui.theme.Zinc400
import com.example.ui.theme.Zinc500
import com.example.ui.theme.Zinc700
import com.example.ui.theme.Zinc800
import com.example.ui.theme.Zinc900
import com.example.ui.theme.Zinc950
import com.google.firebase.auth.FirebaseAuth

@Composable
fun YouTubeTrailerPlayer(videoId: String, modifier: Modifier = Modifier) {
  AndroidView(
    factory = { ctx ->
      YouTubePlayerView(ctx).apply {
        enableAutomaticInitialization = false
        initialize(object : AbstractYouTubePlayerListener() {
          override fun onReady(youTubePlayer: YouTubePlayer) {
            youTubePlayer.cueVideo(videoId, 0f)
          }
        })
      }
    },
    modifier = modifier
      .fillMaxWidth()
      .aspectRatio(16f / 9f)
      .clip(RoundedCornerShape(12.dp))
  )
}

val GoldStarColor = Color(0xFFFFB800)

fun calculateCountdown(releaseDateStr: String?): String? {
  if (releaseDateStr.isNullOrBlank()) return null
  return try {
    val cleanDateStr = if (releaseDateStr.length >= 10) releaseDateStr.substring(0, 10) else releaseDateStr
    val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)
    val targetDate = sdf.parse(cleanDateStr)
    val now = java.util.Date()
    if (targetDate != null && targetDate.after(now)) {
      val diffMs = targetDate.time - now.time
      val days = java.util.concurrent.TimeUnit.MILLISECONDS.toDays(diffMs)
      val hours = java.util.concurrent.TimeUnit.MILLISECONDS.toHours(diffMs) % 24
      val mins = java.util.concurrent.TimeUnit.MILLISECONDS.toMinutes(diffMs) % 60
      "${days}d ${hours}h ${mins}m"
    } else null
  } catch (_: Exception) {
    null
  }
}

data class StoreListing(
    val storeName: String,
    val storeDomain: String,
    val editionName: String,
    val priceUsd: Double,
    val isPreOrder: Boolean,
    val gradientColors: List<Color>,
    val storeUrl: String = ""
)

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun DetailsScreen(
  title: String,
  backdropPath: String?,
  posterUrl: String? = null,
  rating: Double = 0.0,
  formattedRating: String = String.format("%.1f", rating),
  voteCount: Int = 0,
  releaseDate: String? = null,
  overview: String = "",
  contentType: ContentType,
  isFavorite: Boolean = false,
  userRating: Float? = null,
  onRateContent: (Float) -> Unit = {},
  cast: List<CastMember> = emptyList(),
  videos: List<MovieVideo> = emptyList(),
  isLoadingDetails: Boolean = false,
  onDismiss: () -> Unit,
  onFavoriteClick: () -> Unit = {},
  onCompanyClick: (ProductionCompany) -> Unit = {},
  onPublisherClick: (GameCompany) -> Unit = {},
  onPersonClick: (Long) -> Unit = {},
  onBuyNowClick: (String) -> Unit = {},
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)


  var showLoginPromptDialog by remember { mutableStateOf(false) }
  var showCurrencyConverter by remember { mutableStateOf(false) }
  var showPcRequirementsModal by remember { mutableStateOf(false) }
  var showAndroidCompatibilityModal by remember { mutableStateOf(false) }
  var showLinuxCompatibilityModal by remember { mutableStateOf(false) }
  var showIosCompatibilityModal by remember { mutableStateOf(false) }
  var selectedPriceUsd by remember { mutableStateOf(69.99) }
  val regionalSheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  var activeTrailerVideoId by remember { mutableStateOf<String?>(null) }

  val handleSaveAction = {
    val currentUser = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser
    if (currentUser == null) {
      android.widget.Toast.makeText(context, "Please sign in to save to your library", android.widget.Toast.LENGTH_SHORT).show()
    } else {
      val itemId = title.lowercase().replace(Regex("[^a-z0-9]"), "_")
      val data = mapOf(
        "id" to itemId,
        "title" to title,
        "posterUrl" to (posterUrl ?: ""),
        "timestamp" to com.google.firebase.Timestamp.now()
      )
      com.google.firebase.firestore.FirebaseFirestore.getInstance()
        .collection("users")
        .document(currentUser.uid)
        .collection("library")
        .document(itemId)
        .set(data)

      android.widget.Toast.makeText(context, "Saved to Library!", android.widget.Toast.LENGTH_SHORT).show()
      onFavoriteClick()
    }
  }

  val gamePlatforms = remember(contentType, title) {
    if (contentType is ContentType.Game) {
      val names = contentType.platforms.map { it.name }
      if (names.isEmpty() || title.contains("GTA", ignoreCase = true) || title.contains("Grand Theft Auto", ignoreCase = true)) {
        listOf("PlayStation 5", "Xbox Series S/X")
      } else {
        names
      }
    } else emptyList()
  }

  val isGamePreorder = remember(releaseDate, title) {
    val titleLower = title.lowercase()
    val isFutureDate = if (!releaseDate.isNullOrBlank()) {
      try {
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)
        val date = sdf.parse(releaseDate)
        date?.after(java.util.Date()) ?: false
      } catch (_: Exception) {
        false
      }
    } else {
      false
    }
    isFutureDate || titleLower.contains("gta vi") || titleLower.contains("gta 6") || titleLower.contains("grand theft auto vi") || titleLower.contains("preorder") || titleLower.contains("pre-order")
  }

  // Extract screenshot carousel items for games or backdrops
  val gameCovers = remember(contentType, backdropPath, posterUrl) {
    val gameScreenshots = (contentType as? ContentType.Game)?.screenshots.orEmpty()
    if (gameScreenshots.isNotEmpty()) {
      gameScreenshots
    } else {
      listOfNotNull(backdropPath, posterUrl).ifEmpty { emptyList() }
    }
  }

  val pagerState = rememberPagerState(pageCount = { gameCovers.size.coerceAtLeast(1) })

  // Auto-sliding carousel for screenshots
  LaunchedEffect(gameCovers.size) {
    if (gameCovers.size > 1) {
      while (true) {
        kotlinx.coroutines.delay(3500)
        val nextPage = (pagerState.currentPage + 1) % gameCovers.size
        pagerState.animateScrollToPage(nextPage)
      }
    }
  }

  if (showLoginPromptDialog) {
    AlertDialog(
      onDismissRequest = { showLoginPromptDialog = false },
      title = {
        Text("Sign In Required", color = CinemaWhite, fontWeight = FontWeight.Bold, fontSize = 16.sp)
      },
      text = {
        Text("You must be logged in to rate and review titles.", color = Zinc400, fontSize = 13.sp)
      },
      confirmButton = {
        Button(
          onClick = { showLoginPromptDialog = false },
          colors = ButtonDefaults.buttonColors(containerColor = CinemaWhite, contentColor = MinimalBlack)
        ) {
          Text("Got it")
        }
      },
      containerColor = Zinc900,
      shape = RoundedCornerShape(18.dp)
    )
  }

  if (showCurrencyConverter) {
    ModalBottomSheet(
      onDismissRequest = { showCurrencyConverter = false },
      sheetState = regionalSheetState,
      containerColor = Zinc950,
      contentColor = CinemaWhite,
      shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
      var dropdownExpanded by remember { mutableStateOf(false) }
      val currencies = listOf(
        Triple("USD", 1.0, "$"),
        Triple("EGP", 48.5, "EGP "),
        Triple("EUR", 0.92, "€"),
        Triple("GBP", 0.79, "£"),
        Triple("SAR", 3.75, "SR ")
      )
      var selectedCurrencyIndex by remember { mutableStateOf(0) }
      val selectedCurrency = currencies[selectedCurrencyIndex]
      
      var taxPercentage by remember { mutableStateOf(14f) }

      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(24.dp)
          .navigationBarsPadding(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "Regional Price Calculator",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = CinemaWhite
          )
          IconButton(onClick = { showCurrencyConverter = false }) {
            Icon(
              imageVector = Icons.Default.Close,
              contentDescription = "Close",
              tint = Zinc400
            )
          }
        }

        Text(
          text = "Base Price: $${String.format(java.util.Locale.US, "%.2f", selectedPriceUsd)} USD",
          style = MaterialTheme.typography.bodyMedium,
          color = Zinc300
        )

        // Dropdown to select currency
        Text(
          text = "Select Target Currency",
          style = MaterialTheme.typography.titleSmall,
          color = Zinc400,
          fontWeight = FontWeight.Bold
        )

        ExposedDropdownMenuBox(
          expanded = dropdownExpanded,
          onExpandedChange = { dropdownExpanded = !dropdownExpanded }
        ) {
          OutlinedTextField(
            readOnly = true,
            value = "${selectedCurrency.first} (${selectedCurrency.third})",
            onValueChange = {},
            label = { Text("Currency", color = Zinc400) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = dropdownExpanded) },
            colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(
              focusedTextColor = CinemaWhite,
              unfocusedTextColor = CinemaWhite,
              focusedBorderColor = CinemaWhite,
              unfocusedBorderColor = Zinc700,
              focusedLabelColor = CinemaWhite,
              unfocusedLabelColor = Zinc400
            ),
            modifier = Modifier
              .fillMaxWidth()
              .menuAnchor()
          )
          ExposedDropdownMenu(
            expanded = dropdownExpanded,
            onDismissRequest = { dropdownExpanded = false },
            modifier = androidx.compose.ui.Modifier.background(Zinc900)
          ) {
            currencies.forEachIndexed { index, triple ->
              DropdownMenuItem(
                text = { Text("${triple.first} (${triple.third})", color = CinemaWhite) },
                onClick = {
                  selectedCurrencyIndex = index
                  dropdownExpanded = false
                }
              )
            }
          }
        }

        // Tax Slider / Input
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "Local Tax Percentage",
            style = MaterialTheme.typography.titleSmall,
            color = Zinc400,
            fontWeight = FontWeight.Bold
          )
          Text(
            text = "${taxPercentage.toInt()}%",
            style = MaterialTheme.typography.titleMedium,
            color = Color(0xFF4CAF50),
            fontWeight = FontWeight.Bold
          )
        }

        Slider(
          value = taxPercentage,
          onValueChange = { taxPercentage = it },
          valueRange = 0f..30f,
          colors = androidx.compose.material3.SliderDefaults.colors(
            thumbColor = CinemaWhite,
            activeTrackColor = Color(0xFF4CAF50),
            inactiveTrackColor = Zinc800
          )
        )

        // Real-time calculation logic
        val convertedBase = selectedPriceUsd * selectedCurrency.second
        val finalPriceValue = convertedBase + (convertedBase * (taxPercentage / 100f))

        Spacer(modifier = Modifier.height(8.dp))

        Box(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Zinc900)
            .padding(16.dp),
          contentAlignment = Alignment.Center
        ) {
          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
              text = "TOTAL ESTIMATED PRICE",
              style = MaterialTheme.typography.labelSmall,
              color = Zinc400,
              fontWeight = FontWeight.Bold,
              letterSpacing = 1.1.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = "${selectedCurrency.third}${String.format(java.util.Locale.US, "%,.2f", finalPriceValue)}",
              style = MaterialTheme.typography.headlineLarge,
              fontWeight = FontWeight.Black,
              color = Color(0xFF4CAF50)
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
              text = "Base: ${selectedCurrency.third}${String.format(java.util.Locale.US, "%,.2f", convertedBase)} + ${taxPercentage.toInt()}% Tax",
              style = MaterialTheme.typography.bodySmall,
              color = Zinc500
            )
          }
        }
      }
    }
  }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = Color(0xFF09090B),
    contentColor = CinemaWhite,
    dragHandle = null,
    shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
    modifier = modifier.testTag("details_screen_sheet")
  ) {
    val scrollState = rememberScrollState()

    Box(modifier = Modifier.fillMaxSize().background(Color(0xFF09090B))) {
      // 2. Foreground Scrollable Content
      Column(
        modifier = Modifier
          .fillMaxSize()
          .verticalScroll(scrollState)
      ) {
        // FIX 1: HORIZONTAL PAGER WITH DOTS (AT THE TOP)
        Box(modifier = Modifier.fillMaxWidth().height(300.dp)) {
          HorizontalPager(state = pagerState, modifier = Modifier.fillMaxSize()) { page ->
            AsyncImage(
              model = gameCovers.getOrNull(page) ?: "",
              contentDescription = "Cover",
              contentScale = ContentScale.Crop,
              modifier = Modifier.fillMaxSize()
            )
          }
          // Pagination Indicator Dots
          Row(
            modifier = Modifier
              .wrapContentHeight()
              .fillMaxWidth()
              .align(Alignment.BottomCenter)
              .padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.Center
          ) {
            repeat(pagerState.pageCount) { iteration ->
              val color = if (pagerState.currentPage == iteration) Color.White else Color.White.copy(alpha = 0.4f)
              Box(
                modifier = Modifier
                  .padding(2.dp)
                  .clip(CircleShape)
                  .background(color)
                  .size(8.dp)
              )
            }
          }
        }

        Surface(
          color = Color(0xFF09090B),
          modifier = Modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = 500.dp)
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .padding(top = 16.dp)
          ) {
          // Poster & Header Information
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
          ) {
            // Poster / Cover
            Box(
              modifier = Modifier
                .width(100.dp)
                .aspectRatio(0.67f)
                .clip(RoundedCornerShape(16.dp))
                .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
                .background(Zinc900)
            ) {
              SubcomposeAsyncImage(
                model = ImageRequest.Builder(context)
                  .data(posterUrl ?: backdropPath)
                  .crossfade(true)
                  .diskCachePolicy(CachePolicy.ENABLED)
                  .memoryCachePolicy(CachePolicy.ENABLED)
                  .build(),
                contentDescription = title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
              )
            }

            // Title and ContentType-specific metadata
            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                color = CinemaWhite,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                  .fillMaxWidth()
                  .testTag("details_title")
              )

              // Hardware Platform Row directly beside / beneath Game Title
              if (contentType is ContentType.Game && (contentType.platforms.isNotEmpty() || contentType.supportedHardware.isNotEmpty())) {
                Spacer(modifier = Modifier.height(6.dp))
                com.example.util.DetailsPlatformLogosSection(
                  platforms = contentType.platforms,
                  supportedHardware = contentType.supportedHardware,
                  logoHeight = 24.dp,
                  spacing = 8.dp,
                  onPlatformClick = { platform ->
                    when {
                      platform.isPc -> showPcRequirementsModal = true
                      platform.isAndroid -> showAndroidCompatibilityModal = true
                      platform.isLinux -> showLinuxCompatibilityModal = true
                      platform.isIos -> showIosCompatibilityModal = true
                    }
                  }
                )
              }

              when (contentType) {
                is ContentType.Movie -> {
                  // Production Company Logo and Name with verified check
                  val mainCompany = contentType.productionCompanies.firstOrNull()
                  if (mainCompany != null) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Surface(
                      color = Zinc900,
                      shape = RoundedCornerShape(8.dp),
                      border = BorderStroke(1.dp, CinematicBorderSubtle),
                      modifier = Modifier
                        .clickable { onCompanyClick(mainCompany) }
                        .testTag("details_company_button")
                    ) {
                      Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                      ) {
                        if (!mainCompany.logoUrl.isNullOrBlank()) {
                          Box(
                            modifier = Modifier
                              .size(20.dp)
                              .clip(RoundedCornerShape(4.dp))
                              .background(CinemaWhite)
                              .padding(2.dp),
                            contentAlignment = Alignment.Center
                          ) {
                            SubcomposeAsyncImage(
                              model = ImageRequest.Builder(context)
                                .data(mainCompany.logoUrl)
                                .crossfade(true)
                                .build(),
                              contentDescription = mainCompany.name,
                              contentScale = ContentScale.Fit,
                              modifier = Modifier.fillMaxSize()
                            )
                          }
                          Spacer(modifier = Modifier.width(6.dp))
                        }
                        Text(
                          text = mainCompany.name,
                          color = CinemaWhite,
                          fontSize = 11.sp,
                          fontWeight = FontWeight.Medium,
                          maxLines = 1,
                          overflow = TextOverflow.Ellipsis,
                          modifier = Modifier.weight(1f, fill = false)
                        )
                        if (isVerifiedCompany(mainCompany.name)) {
                          Spacer(modifier = Modifier.width(4.dp))
                          Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Verified Studio",
                            tint = CinemaWhite,
                            modifier = Modifier.size(12.dp)
                          )
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                          imageVector = Icons.AutoMirrored.Filled.ArrowForwardIos,
                          contentDescription = "View Studio Films",
                          tint = Zinc500,
                          modifier = Modifier.size(10.dp)
                        )
                      }
                    }
                  }
                }
                is ContentType.Game -> {
                  val company = contentType.developerCompany 
                    ?: contentType.developersList.firstOrNull() 
                    ?: contentType.publishersList.firstOrNull()
                  val publisherOrDev = company?.name ?: contentType.developers.firstOrNull() ?: contentType.publishers.firstOrNull()
                  if (!publisherOrDev.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Surface(
                      color = Zinc900,
                      shape = RoundedCornerShape(8.dp),
                      border = BorderStroke(1.dp, CinematicBorderSubtle),
                      modifier = Modifier
                        .clickable {
                          val targetCompany = company ?: GameCompany(
                            id = 0,
                            name = publisherOrDev,
                            slug = publisherOrDev.lowercase().replace(" ", "-"),
                            isDeveloper = true
                          )
                          onPublisherClick(targetCompany)
                        }
                        .testTag("details_game_publisher")
                    ) {
                      Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                      ) {
                        if (company?.imageUrl != null && company.imageUrl.isNotBlank()) {
                          SubcomposeAsyncImage(
                            model = ImageRequest.Builder(context)
                              .data(company.imageUrl)
                              .crossfade(true)
                              .diskCachePolicy(CachePolicy.ENABLED)
                              .memoryCachePolicy(CachePolicy.ENABLED)
                              .build(),
                            contentDescription = company.name,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                              .size(16.dp)
                              .clip(RoundedCornerShape(4.dp)),
                            error = {
                              Icon(
                                imageVector = Icons.Rounded.SportsEsports,
                                contentDescription = "Developer",
                                tint = CinemaWhite,
                                modifier = Modifier.size(13.dp)
                              )
                            }
                          )
                          Spacer(modifier = Modifier.width(6.dp))
                        } else {
                          Icon(
                            imageVector = Icons.Rounded.SportsEsports,
                            contentDescription = "Developer",
                            tint = CinemaWhite,
                            modifier = Modifier.size(13.dp)
                          )
                          Spacer(modifier = Modifier.width(6.dp))
                        }
                        Text(
                          text = publisherOrDev,
                          color = CinemaWhite,
                          fontSize = 11.sp,
                          fontWeight = FontWeight.Medium,
                          maxLines = 1,
                          overflow = TextOverflow.Ellipsis
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                          imageVector = Icons.Default.CheckCircle,
                          contentDescription = "Verified Studio",
                          tint = CinemaWhite,
                          modifier = Modifier.size(12.dp)
                        )
                      }
                    }
                  } else {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                      text = "GAME RELEASE",
                      color = Zinc400,
                      fontSize = 10.sp,
                      fontWeight = FontWeight.Bold,
                      letterSpacing = 1.2.sp
                    )
                  }
                }
              }

              Spacer(modifier = Modifier.height(6.dp))

              // Rating Pill
              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
              ) {
                Surface(
                  color = CinemaWhite,
                  shape = RoundedCornerShape(50.dp)
                ) {
                  Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                  ) {
                    Icon(
                      imageVector = Icons.Default.Star,
                      contentDescription = null,
                      tint = MinimalBlack,
                      modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                      text = formattedRating,
                      color = MinimalBlack,
                      fontSize = 12.sp,
                      fontWeight = FontWeight.Bold
                    )
                  }
                }

                if (voteCount > 0) {
                  Text(
                    text = "($voteCount votes)",
                    color = Zinc500,
                    fontSize = 12.sp
                  )
                }
              }

              // Countdown Timer for Upcoming Games / Release Date (Dynamic Brush + Live Seconds)
              if (!releaseDate.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                DynamicCountdownTimer(
                  releaseDateStr = releaseDate,
                  gameTitle = title,
                  imageUrl = posterUrl ?: backdropPath
                )
              } else if (releaseDate != null) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                  text = "Release: $releaseDate",
                  color = Zinc400,
                  fontSize = 12.sp
                )
              }
            }
          }

          Spacer(modifier = Modifier.height(18.dp))

          // 4. YOUR RATING Section (Auth-Gated & Persisted in Room DB)
          UserRatingSection(
            currentRating = userRating,
            onRatingChanged = { ratingValue ->
              val currentUser = FirebaseAuth.getInstance().currentUser
              if (currentUser == null) {
                showLoginPromptDialog = true
              } else {
                onRateContent(ratingValue)
              }
            },
            modifier = Modifier.padding(horizontal = 20.dp)
          )

          Spacer(modifier = Modifier.height(18.dp))

          // 5. PURCHASE & OFFICIAL STORES Section (The Animated Glass Buttons)
      when (contentType) {
        is ContentType.Movie -> {
          // Watchlist Action Button
          Button(
            onClick = handleSaveAction,
            colors = ButtonDefaults.buttonColors(
              containerColor = if (isFavorite) Zinc800 else CinemaWhite,
              contentColor = if (isFavorite) CinemaWhite else MinimalBlack
            ),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
              .fillMaxWidth()
              .height(50.dp)
              .padding(horizontal = 20.dp)
              .testTag("detail_watchlist_button")
          ) {
            Icon(
              imageVector = if (isFavorite) Icons.Default.Bookmark else Icons.Outlined.BookmarkBorder,
              contentDescription = null,
              modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = if (isFavorite) "Saved in Watchlist" else "Add to Watchlist",
              fontWeight = FontWeight.Bold,
              fontSize = 14.sp
            )
          }

          Spacer(modifier = Modifier.height(20.dp))

          // Where to Watch Section (Real TMDB Flatrate Providers)
          WhereToWatchSection(providers = contentType.watchProviders)
        }

        is ContentType.Game -> {
          // Editions Section (rendered when editions available)
          if (contentType.editions.size > 1) {
            GameEditionsSection(
              editions = contentType.editions,
              onEditionClick = { edition ->
                if (!edition.storeUrl.isNullOrBlank()) {
                  val intent = Intent(Intent.ACTION_VIEW, Uri.parse(edition.storeUrl))
                  context.startActivity(intent)
                } else {
                  onBuyNowClick(title)
                }
              }
            )
            Spacer(modifier = Modifier.height(20.dp))
          }

          // Buy Now Store Links
          GameStoresSection(
            gameTitle = title,
            gamePlatforms = gamePlatforms,
            stores = contentType.stores,
            onStoreClick = {
              onBuyNowClick(title)
            }
          )
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // 6. SYNOPSIS Section (Overview / Story Description)
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 20.dp)
      ) {
        Text(
          text = "SYNOPSIS",
          color = Zinc400,
          fontSize = 11.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.2.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
          text = if (overview.isNotBlank()) overview else "No overview available for this title.",
          color = Zinc300,
          fontSize = 13.sp,
          lineHeight = 20.sp
        )
      }

      if (contentType is ContentType.Game) {
        val devList = contentType.developersList.ifEmpty {
          contentType.developers.map { com.example.domain.model.GameCompany(id = 0L, name = it, isDeveloper = true) }
        }
        val pubList = contentType.publishersList.ifEmpty {
          contentType.publishers.map { com.example.domain.model.GameCompany(id = 0L, name = it, isDeveloper = false) }
        }
        if (devList.isNotEmpty() || pubList.isNotEmpty()) {
          Spacer(modifier = Modifier.height(20.dp))
          GameDevelopersAndPublishersSection(
            developers = devList,
            publishers = pubList,
            onCompanyClick = onPublisherClick
          )
        }
      }

      // 6. Cast & Crew Section (For movies or items with cast)
      if (cast.isNotEmpty() || (contentType is ContentType.Movie && isLoadingDetails)) {
        Spacer(modifier = Modifier.height(22.dp))
        CastAndCrewSection(
          cast = cast,
          isLoading = isLoadingDetails && cast.isEmpty(),
          onPersonClick = onPersonClick
        )
      }

      // 7. Official Trailers Section
      if (videos.isNotEmpty()) {
        Spacer(modifier = Modifier.height(22.dp))
        OfficialTrailersSection(
          videos = videos,
          backdropUrl = backdropPath,
          onVideoClick = { videoId -> activeTrailerVideoId = videoId }
        )
      }

      Spacer(modifier = Modifier.height(36.dp))
          }
        }
      }

      // Top floating buttons overlay
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Close Button
        IconButton(
          onClick = onDismiss,
          modifier = Modifier
            .size(38.dp)
            .clip(CircleShape)
            .background(Color(0x99000000))
            .border(1.dp, GlassBorder, CircleShape)
        ) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close",
            tint = CinemaWhite,
            modifier = Modifier.size(18.dp)
          )
        }

        // Watchlist / Bookmark Button
        IconButton(
          onClick = handleSaveAction,
          modifier = Modifier
            .size(38.dp)
            .clip(CircleShape)
            .background(if (isFavorite) GoldStarColor.copy(alpha = 0.25f) else Color(0x99000000))
            .border(1.dp, if (isFavorite) GoldStarColor else GlassBorder, CircleShape)
            .testTag("details_save_button")
        ) {
          Icon(
            imageVector = Icons.Rounded.Bookmark,
            contentDescription = "Watchlist",
            tint = if (isFavorite) GoldStarColor else CinemaWhite,
            modifier = Modifier.size(18.dp)
          )
        }
      }
    }
  }

  if (showPcRequirementsModal && contentType is ContentType.Game) {
    PcRequirementsBottomSheet(
      gameTitle = title,
      requirements = contentType.pcRequirements,
      onDismiss = { showPcRequirementsModal = false }
    )
  }

  if (showAndroidCompatibilityModal && contentType is ContentType.Game) {
    val isNativeAndroid = contentType.platforms.any { it.slug == "android" || it.name.contains("android", ignoreCase = true) } ||
        contentType.supportedHardware.any { it.equals("android", ignoreCase = true) }
    AndroidCompatibilityBottomSheet(
      gameTitle = title,
      pcRequirements = contentType.pcRequirements,
      isNativeAndroid = isNativeAndroid,
      onDismiss = { showAndroidCompatibilityModal = false }
    )
  }

  if (showLinuxCompatibilityModal && contentType is ContentType.Game) {
    val isNativeLinux = contentType.platforms.any { it.slug == "linux" || it.name.contains("linux", ignoreCase = true) } ||
        contentType.supportedHardware.any { it.equals("linux", ignoreCase = true) }
    LinuxCompatibilityBottomSheet(
      gameTitle = title,
      pcRequirements = contentType.pcRequirements,
      isNativeLinux = isNativeLinux,
      onDismiss = { showLinuxCompatibilityModal = false }
    )
  }

  if (showIosCompatibilityModal && contentType is ContentType.Game) {
    val isNativeIos = contentType.platforms.any { it.slug == "ios" || it.name.contains("ios", ignoreCase = true) } ||
        contentType.supportedHardware.any { it.equals("ios", ignoreCase = true) }
    IosCompatibilityBottomSheet(
      gameTitle = title,
      pcRequirements = contentType.pcRequirements,
      isNativeIos = isNativeIos,
      onDismiss = { showIosCompatibilityModal = false }
    )
  }

  if (activeTrailerVideoId != null) {
    Dialog(
      onDismissRequest = { activeTrailerVideoId = null },
      properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .padding(16.dp)
          .aspectRatio(16f / 9f)
          .clip(RoundedCornerShape(16.dp))
          .background(Color.Black),
        contentAlignment = Alignment.Center
      ) {
        AndroidView(
          factory = { ctx ->
            WebView(ctx).apply {
              settings.apply {
                javaScriptEnabled = true
                mediaPlaybackRequiresUserGesture = false
                domStorageEnabled = true
              }
              webViewClient = WebViewClient()
              webChromeClient = WebChromeClient()
              loadUrl("https://www.youtube.com/embed/${activeTrailerVideoId}?autoplay=1")
            }
          },
          modifier = Modifier.fillMaxSize()
        )
      }
    }
  }
}

/**
 * Interactive Star-Rating Component persisted to Room DB
 */
@Composable
fun UserRatingSection(
  currentRating: Float?,
  onRatingChanged: (Float) -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    color = Zinc900,
    shape = RoundedCornerShape(14.dp),
    border = BorderStroke(1.dp, if (currentRating != null && currentRating > 0f) GoldStarColor.copy(alpha = 0.5f) else CinematicBorderSubtle),
    modifier = modifier
      .fillMaxWidth()
      .testTag("user_rating_section")
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "YOUR RATING",
          color = Zinc400,
          fontSize = 11.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.2.sp
        )

        if (currentRating != null && currentRating > 0f) {
          Text(
            text = "★ ${String.format(java.util.Locale.US, "%.1f", currentRating)} / 5.0",
            color = GoldStarColor,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
          )
        } else {
          Text(
            text = "Not Rated Yet",
            color = Zinc500,
            fontSize = 12.sp
          )
        }
      }

      Spacer(modifier = Modifier.height(8.dp))

      // 5-Star Interactive Bar
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        val selectedStars = currentRating ?: 0f

        for (i in 1..5) {
          val isFilled = selectedStars >= i
          val starColor by animateColorAsState(
            targetValue = if (isFilled) GoldStarColor else Zinc700,
            label = "star_color_$i"
          )
          val scale by animateFloatAsState(
            targetValue = if (isFilled) 1.1f else 1.0f,
            label = "star_scale_$i"
          )

          Box(
            modifier = Modifier
              .size(36.dp)
              .clip(CircleShape)
              .background(if (isFilled) GoldStarColor.copy(alpha = 0.12f) else Zinc800.copy(alpha = 0.4f))
              .clickable {
                // If tapping the exact current star, reset/clear to 0
                if (selectedStars == i.toFloat()) {
                  onRatingChanged(0f)
                } else {
                  onRatingChanged(i.toFloat())
                }
              }
              .testTag("star_rate_button_$i"),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = if (isFilled) Icons.Default.Star else Icons.Default.StarBorder,
              contentDescription = "Rate $i star",
              tint = starColor,
              modifier = Modifier
                .size(24.dp)
                .scale(scale)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(6.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = if (currentRating != null && currentRating > 0f) "Tap rated star to reset" else "Tap stars to rate this title",
          color = Zinc500,
          fontSize = 10.sp
        )

        if (currentRating != null && currentRating > 0f) {
          Text(
            text = "Saved in Room DB",
            color = Color(0xFF4CAF50),
            fontSize = 10.sp,
            fontWeight = FontWeight.Medium
          )
        }
      }
    }
  }
}

fun getLogoUrl(name: String): String = com.example.util.PlatformLogoUtils.getLogoUrl(name)

fun getBrandColors(name: String): List<Color> = com.example.util.PlatformLogoUtils.getBrandColors(name)

fun getBrandColor(name: String): Color = com.example.util.PlatformLogoUtils.getBrandColor(name)

@Composable
fun AnimatedGlassStoreButton(
    storeName: String,
    onClick: () -> Unit,
    logoUrl: String? = null,
    testTag: String = ""
) {
    val brandColors = getBrandColors(storeName)
    val effectiveLogoUrl = com.example.util.PlatformLogoUtils.getStoreLogoUrl(storeName).ifBlank { logoUrl ?: "" }
    val transition = rememberInfiniteTransition(label = "shimmer")
    val progress by transition.animateFloat(
        initialValue = -1f,
        targetValue = 2f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2500, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerProgress"
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .clip(RoundedCornerShape(16.dp))
            .border(
                width = 1.dp,
                brush = Brush.linearGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.35f),
                        Color.White.copy(alpha = 0.08f),
                        Color.White.copy(alpha = 0.25f)
                    )
                ),
                shape = RoundedCornerShape(16.dp)
            )
            .drawWithCache {
                val width = size.width
                val height = size.height

                val baseBrush = if (brandColors.size > 1) {
                    Brush.linearGradient(
                        colors = brandColors.map { it.copy(alpha = 0.85f) },
                        start = Offset(0f, 0f),
                        end = Offset(width, height)
                    )
                } else {
                    val single = brandColors.first()
                    Brush.linearGradient(
                        colors = listOf(single.copy(alpha = 0.75f), single.copy(alpha = 0.9f)),
                        start = Offset(0f, 0f),
                        end = Offset(width, height)
                    )
                }

                val startX = width * progress
                val startY = 0f
                val endX = startX + (width * 0.4f)
                val endY = height

                val shimmerBrush = Brush.linearGradient(
                    colors = listOf(
                        Color.Transparent,
                        Color.White.copy(alpha = 0.32f),
                        Color.Transparent
                    ),
                    start = Offset(startX, startY),
                    end = Offset(endX, endY)
                )

                onDrawBehind {
                    drawRect(brush = baseBrush)
                    drawRect(brush = shimmerBrush)
                }
            }
            .clickable { onClick() }
            .padding(horizontal = 20.dp)
            .then(if (testTag.isNotEmpty()) Modifier.testTag(testTag) else Modifier),
        contentAlignment = Alignment.Center
    ) {
        // Floating SVG Logo & Centered Store Name (No background squares/boxes)
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (effectiveLogoUrl.isNotBlank()) {
                val context = LocalContext.current
                SubcomposeAsyncImage(
                    model = ImageRequest.Builder(context)
                        .data(effectiveLogoUrl)
                        .crossfade(true)
                        .diskCachePolicy(CachePolicy.ENABLED)
                        .memoryCachePolicy(CachePolicy.ENABLED)
                        .build(),
                    contentDescription = "$storeName Logo",
                    colorFilter = ColorFilter.tint(Color.White),
                    modifier = Modifier.size(24.dp),
                    contentScale = ContentScale.Fit,
                    loading = { Box(modifier = Modifier.size(24.dp)) },
                    error = { /* Gracefully hide failed store asset */ }
                )
                Spacer(modifier = Modifier.width(10.dp))
            }

            Text(
                text = storeName,
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                letterSpacing = 0.5.sp
            )
        }
    }
}

@Composable
private fun GameEditionsSection(
  editions: List<GameEdition>,
  onEditionClick: (GameEdition) -> Unit
) {
  if (editions.isEmpty()) return

  Column(
    modifier = Modifier
      .fillMaxWidth()
      .padding(horizontal = 20.dp)
      .testTag("game_editions_section")
  ) {
    Text(
      text = "EDITIONS",
      color = Zinc400,
      fontSize = 11.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.2.sp
    )

    Spacer(modifier = Modifier.height(10.dp))

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
      editions.forEach { edition ->
        val priceText = when {
          edition.isFree -> "FREE"
          !edition.formattedPrice.isNullOrBlank() && edition.formattedPrice != "$0.00" -> edition.formattedPrice
          edition.price != null && edition.price > 0.0 -> "$%.2f".format(java.util.Locale.US, edition.price)
          else -> "Unavailable"
        }

        Surface(
          color = Zinc900,
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, CinematicBorderSubtle),
          modifier = Modifier
            .fillMaxWidth()
            .clickable { onEditionClick(edition) }
            .testTag("edition_card_${edition.name.lowercase().replace(" ", "_")}")
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                  color = when (edition.editionType.uppercase()) {
                    "DELUXE" -> Color(0xFF8A3FFC).copy(alpha = 0.2f)
                    "ULTIMATE" -> GoldStarColor.copy(alpha = 0.2f)
                    "PREMIUM", "GOLD" -> Color(0xFFFFB300).copy(alpha = 0.2f)
                    else -> Zinc800
                  },
                  shape = RoundedCornerShape(6.dp),
                  border = BorderStroke(1.dp, when (edition.editionType.uppercase()) {
                    "DELUXE" -> Color(0xFF8A3FFC).copy(alpha = 0.5f)
                    "ULTIMATE" -> GoldStarColor.copy(alpha = 0.5f)
                    "PREMIUM", "GOLD" -> Color(0xFFFFB300).copy(alpha = 0.5f)
                    else -> CinematicBorderSubtle
                  })
                ) {
                  Text(
                    text = edition.editionType.uppercase(),
                    color = when (edition.editionType.uppercase()) {
                      "DELUXE" -> Color(0xFFD4BBFF)
                      "ULTIMATE" -> GoldStarColor
                      "PREMIUM", "GOLD" -> Color(0xFFFFD54F)
                      else -> CinemaWhite
                    },
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.8.sp,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                  )
                }

                if (!edition.platform.isNullOrBlank()) {
                  Spacer(modifier = Modifier.width(8.dp))
                  Text(
                    text = edition.platform,
                    color = Zinc400,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                  )
                }
              }

              Spacer(modifier = Modifier.height(6.dp))

              Text(
                text = edition.name,
                color = CinemaWhite,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
              )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(horizontalAlignment = Alignment.End) {
              if (edition.discountPercentage != null && edition.discountPercentage > 0) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  if (!edition.formattedOriginalPrice.isNullOrBlank()) {
                    Text(
                      text = edition.formattedOriginalPrice,
                      color = Zinc500,
                      fontSize = 11.sp,
                      textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                  }
                  Surface(
                    color = Color(0xFF4CAF50).copy(alpha = 0.2f),
                    shape = RoundedCornerShape(4.dp)
                  ) {
                    Text(
                      text = "-${edition.discountPercentage}%",
                      color = Color(0xFF4CAF50),
                      fontSize = 10.sp,
                      fontWeight = FontWeight.Bold,
                      modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                    )
                  }
                }
                Spacer(modifier = Modifier.height(2.dp))
              }

              Text(
                text = priceText,
                color = if (edition.isFree || (edition.discountPercentage != null && edition.discountPercentage > 0)) Color(0xFF4CAF50) else CinemaWhite,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
              )
            }
          }
        }
      }
    }
  }
}

@Composable
private fun GameStoresSection(
  gameTitle: String,
  gamePlatforms: List<String>,
  stores: List<com.example.domain.model.GameStoreLink> = emptyList(),
  onStoreClick: () -> Unit
) {
  val context = LocalContext.current
  val distinctStores = remember(stores) {
    stores.distinctBy { it.storeName.lowercase().trim() }
  }

  if (distinctStores.isEmpty()) return

  Column(
    modifier = Modifier
      .fillMaxWidth()
      .padding(horizontal = 20.dp)
      .testTag("game_stores_section")
  ) {
    Text(
      text = "PURCHASE & OFFICIAL STORES",
      color = Zinc400,
      fontSize = 11.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.2.sp
    )

    Spacer(modifier = Modifier.height(10.dp))

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
      distinctStores.forEach { storeLink ->
        AnimatedGlassStoreButton(
          storeName = storeLink.storeName,
          onClick = {
            if (storeLink.url.isNotBlank()) {
              try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(storeLink.url))
                context.startActivity(intent)
              } catch (_: Exception) {
                onStoreClick()
              }
            } else {
              onStoreClick()
            }
          },
          testTag = "store_${storeLink.storeName.lowercase().replace(" ", "_")}"
        )
      }
    }
  }
}

/**
 * Authentic TMDB Watch Providers Section with real logos
 */
@Composable
private fun WhereToWatchSection(providers: List<WatchProvider>) {
  val context = LocalContext.current

  if (providers.isEmpty()) return

  Column(
    modifier = Modifier
      .fillMaxWidth()
      .padding(horizontal = 20.dp)
  ) {
    Text(
      text = "STREAM ON",
      color = Zinc400,
      fontSize = 11.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.2.sp
    )

    Spacer(modifier = Modifier.height(10.dp))

    LazyRow(
      horizontalArrangement = Arrangement.spacedBy(10.dp),
      contentPadding = PaddingValues(end = 8.dp)
    ) {
      items(providers, key = { "prov_${it.id}" }) { provider ->
        Surface(
          color = Zinc900,
          shape = RoundedCornerShape(14.dp),
          border = BorderStroke(1.dp, CinematicBorderSubtle),
          modifier = Modifier.height(48.dp)
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
          ) {
            if (!provider.logoUrl.isNullOrBlank()) {
              Box(
                modifier = Modifier
                  .size(32.dp)
                  .clip(RoundedCornerShape(8.dp))
                  .background(Zinc800)
              ) {
                SubcomposeAsyncImage(
                  model = ImageRequest.Builder(context)
                    .data(provider.logoUrl)
                    .crossfade(true)
                    .diskCachePolicy(CachePolicy.ENABLED)
                    .memoryCachePolicy(CachePolicy.ENABLED)
                    .build(),
                  contentDescription = provider.name,
                  contentScale = ContentScale.Crop,
                  modifier = Modifier.fillMaxSize()
                )
              }
              Spacer(modifier = Modifier.width(8.dp))
            }
            Text(
              text = provider.name,
              color = CinemaWhite,
              fontSize = 12.sp,
              fontWeight = FontWeight.SemiBold
            )
          }
        }
      }
    }
  }
}

@Composable
private fun CastAndCrewSection(
  cast: List<CastMember>,
  isLoading: Boolean,
  onPersonClick: (Long) -> Unit
) {
  val context = LocalContext.current

  Column(modifier = Modifier.fillMaxWidth()) {
    Text(
      text = "CAST & CREW",
      color = Zinc400,
      fontSize = 11.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.2.sp,
      modifier = Modifier.padding(horizontal = 20.dp)
    )

    Spacer(modifier = Modifier.height(12.dp))

    if (isLoading) {
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(90.dp),
        contentAlignment = Alignment.Center
      ) {
        CircularProgressIndicator(
          color = CinemaWhite,
          strokeWidth = 2.dp,
          modifier = Modifier.size(24.dp)
        )
      }
    } else if (cast.isNotEmpty()) {
      LazyRow(
        contentPadding = PaddingValues(horizontal = 20.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp)
      ) {
        items(cast, key = { "cast_${it.id}" }) { member ->
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
              .width(76.dp)
              .clip(RoundedCornerShape(8.dp))
              .clickable { onPersonClick(member.id) }
              .testTag("actor_item_${member.id}")
          ) {
            Box(
              modifier = Modifier
                .size(62.dp)
                .clip(CircleShape)
                .background(Zinc800)
                .border(1.dp, CinematicBorderSubtle, CircleShape)
            ) {
              SubcomposeAsyncImage(
                model = ImageRequest.Builder(context)
                  .data(member.profileUrl)
                  .crossfade(true)
                  .diskCachePolicy(CachePolicy.ENABLED)
                  .memoryCachePolicy(CachePolicy.ENABLED)
                  .build(),
                contentDescription = member.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
                error = {
                  Box(
                    modifier = Modifier
                      .fillMaxSize()
                      .background(Zinc800),
                    contentAlignment = Alignment.Center
                  ) {
                    Text(
                      text = member.name.take(1).uppercase(),
                      color = CinemaWhite,
                      fontSize = 18.sp,
                      fontWeight = FontWeight.Bold
                    )
                  }
                }
              )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
              text = member.name,
              color = CinemaWhite,
              fontSize = 11.sp,
              fontWeight = FontWeight.Medium,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis,
              textAlign = TextAlign.Center
            )

            Text(
              text = member.character,
              color = Zinc500,
              fontSize = 10.sp,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis,
              textAlign = TextAlign.Center
            )
          }
        }
      }
    }
  }
}

@Composable
private fun OfficialTrailersSection(
  videos: List<MovieVideo>,
  backdropUrl: String?,
  onVideoClick: (String) -> Unit
) {
  val context = LocalContext.current

  Column(modifier = Modifier.fillMaxWidth()) {
    Text(
      text = "OFFICIAL TRAILERS & CLIPS",
      color = Zinc400,
      fontSize = 11.sp,
      fontWeight = FontWeight.Bold,
      letterSpacing = 1.2.sp,
      modifier = Modifier.padding(horizontal = 20.dp)
    )

    Spacer(modifier = Modifier.height(12.dp))

    LazyRow(
      contentPadding = PaddingValues(horizontal = 20.dp),
      horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
      items(videos, key = { "video_${it.id}" }) { video ->
        Box(
          modifier = Modifier
            .width(220.dp)
            .height(124.dp)
            .clip(RoundedCornerShape(16.dp))
            .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
            .background(Zinc900)
            .clickable {
              onVideoClick(video.key)
            }
            .testTag("trailer_item_${video.id}")
        ) {
          SubcomposeAsyncImage(
            model = ImageRequest.Builder(context)
              .data(video.youtubeThumbnailUrl)
              .crossfade(true)
              .diskCachePolicy(CachePolicy.ENABLED)
              .memoryCachePolicy(CachePolicy.ENABLED)
              .build(),
            contentDescription = video.title,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
          )

          // Play Overlay
          Box(
            modifier = Modifier
              .fillMaxSize()
              .background(Color(0x55000000)),
            contentAlignment = Alignment.Center
          ) {
            Box(
              modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(Color(0xCC000000))
                .border(1.dp, GlassBorder, CircleShape),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Default.PlayArrow,
                contentDescription = "Play Trailer",
                tint = CinemaWhite,
                modifier = Modifier.size(22.dp)
              )
            }
          }

          // Video Title Pill
          Surface(
            color = MinimalBlack.copy(alpha = 0.85f),
            shape = RoundedCornerShape(topStart = 8.dp),
            modifier = Modifier.align(Alignment.BottomStart)
          ) {
            Text(
              text = video.title,
              color = CinemaWhite,
              fontSize = 10.sp,
              fontWeight = FontWeight.Medium,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
          }
        }
      }
    }
  }
}

/**
 * PC System Requirements Modal Bottom Sheet
 */
@Composable
private fun PcSpecRowItem(label: String, value: String) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.Top
  ) {
    Text(
      text = label,
      color = Zinc400,
      fontSize = 12.sp,
      fontWeight = FontWeight.Medium,
      modifier = Modifier.weight(0.4f)
    )
    Text(
      text = value,
      color = CinemaWhite,
      fontSize = 12.sp,
      fontWeight = FontWeight.SemiBold,
      modifier = Modifier.weight(0.6f)
    )
  }
}

@Composable
private fun PerformanceEstimateCard(
  estimate: com.example.domain.model.PerformanceEstimate
) {
  Surface(
    color = Zinc900,
    shape = RoundedCornerShape(16.dp),
    border = BorderStroke(1.dp, CinematicBorderSubtle),
    modifier = Modifier.fillMaxWidth()
  ) {
    Column(modifier = Modifier.padding(16.dp)) {
      Text(
        text = "PERFORMANCE ESTIMATE",
        color = Zinc400,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.2.sp
      )

      Spacer(modifier = Modifier.height(12.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        Column(modifier = Modifier.weight(1f)) {
          Text(text = "ESTIMATED FPS", color = Zinc500, fontSize = 10.sp, fontWeight = FontWeight.Bold)
          Text(text = estimate.fpsRange, color = Color(0xFF00E676), fontSize = 15.sp, fontWeight = FontWeight.ExtraBold)
        }
        Column(modifier = Modifier.weight(1f)) {
          Text(text = "RECOMMENDED PRESET", color = Zinc500, fontSize = 10.sp, fontWeight = FontWeight.Bold)
          Text(text = estimate.recommendedQuality.name.replace("_", " "), color = CinemaWhite, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }
        Column(modifier = Modifier.weight(1f)) {
          Text(text = "TARGET RESOLUTION", color = Zinc500, fontSize = 10.sp, fontWeight = FontWeight.Bold)
          Text(text = estimate.recommendedResolution, color = CinemaWhite, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        Column(modifier = Modifier.weight(1f)) {
          Text(text = "RAM REQUIRED", color = Zinc500, fontSize = 10.sp, fontWeight = FontWeight.Bold)
          Text(text = "%.0f GB (Rec: %.0f GB)".format(estimate.ramRequiredGb, estimate.ramRecommendedGb), color = CinemaWhite, fontSize = 12.sp)
        }
        Column(modifier = Modifier.weight(1f)) {
          Text(text = "STORAGE REQUIRED", color = Zinc500, fontSize = 10.sp, fontWeight = FontWeight.Bold)
          Text(text = "%.0f GB (Rec: %.0f GB)".format(estimate.storageRequiredGb, estimate.storageRecommendedGb), color = CinemaWhite, fontSize = 12.sp)
        }
      }
    }
  }
}

/**
 * PC System Requirements Modal Bottom Sheet with Interactive Smart Hardware Selectors
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PcRequirementsBottomSheet(
  gameTitle: String,
  requirements: com.example.domain.model.PcRequirements?,
  onDismiss: () -> Unit
) {
  var selectedTab by remember { mutableStateOf(0) } // 0 = System Specs, 1 = Smart Evaluator
  var reqTab by remember { mutableStateOf(0) } // 0 = Minimum, 1 = Recommended
  val scrollState = rememberScrollState()

  // Interactive Hardware Selector States
  var selectedOs by remember { mutableStateOf("Windows 11") }
  var selectedCpuTier by remember { mutableStateOf("Intel Core i7 / Ryzen 7") }
  var selectedGpuTier by remember { mutableStateOf("NVIDIA RTX 3060 / RX 6600") }
  var selectedRamGb by remember { mutableStateOf(16) }
  var selectedVramGb by remember { mutableStateOf(8) }
  var selectedResolution by remember { mutableStateOf("1080p (Full HD)") }

  val evaluatedPcResult = remember(selectedOs, selectedCpuTier, selectedGpuTier, selectedRamGb, selectedVramGb, selectedResolution, requirements) {
    com.example.domain.engine.DeviceCompatibilityEngine.evaluatePc(
      selectedOs = selectedOs,
      selectedCpu = selectedCpuTier,
      selectedGpu = selectedGpuTier,
      selectedRamGb = selectedRamGb,
      selectedVramGb = selectedVramGb,
      selectedResolution = selectedResolution,
      selectedQuality = "High",
      pcRequirements = requirements
    )
  }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color(0xFF0D0E12),
    contentColor = CinemaWhite,
    shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(scrollState)
        .padding(horizontal = 24.dp)
        .padding(bottom = 32.dp)
        .navigationBarsPadding()
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          com.example.util.PcChipWithRgbBorder(
            height = 28.dp,
            fontSize = 11.sp,
            textPaddingHorizontal = 6.dp,
            textPaddingVertical = 2.dp
          )
          Spacer(modifier = Modifier.width(12.dp))
          Column {
            Text(
              text = "PC SYSTEM REQUIREMENTS",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              letterSpacing = 0.5.sp,
              color = CinemaWhite
            )
            Text(
              text = gameTitle,
              style = MaterialTheme.typography.bodySmall,
              color = Zinc400,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
          }
        }
        IconButton(onClick = onDismiss) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close",
            tint = Zinc400
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Top Tab Bar: Requirements vs Hardware Evaluator
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(12.dp))
          .background(Zinc900)
          .padding(4.dp)
      ) {
        Box(
          modifier = Modifier
            .weight(1f)
            .clip(RoundedCornerShape(10.dp))
            .background(if (selectedTab == 0) CinemaWhite else Color.Transparent)
            .clickable { selectedTab = 0 }
            .padding(vertical = 10.dp),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "MANUAL",
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            letterSpacing = 0.5.sp,
            color = if (selectedTab == 0) MinimalBlack else Zinc400
          )
        }
        Box(
          modifier = Modifier
            .weight(1f)
            .clip(RoundedCornerShape(10.dp))
            .background(if (selectedTab == 1) CinemaWhite else Color.Transparent)
            .clickable { selectedTab = 1 }
            .padding(vertical = 10.dp),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "SMART EVALUATOR",
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            letterSpacing = 0.5.sp,
            color = if (selectedTab == 1) MinimalBlack else Zinc400
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      if (selectedTab == 0) {
        // Specs Tab
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF1B1C22))
            .padding(4.dp)
        ) {
          Box(
            modifier = Modifier
              .weight(1f)
              .clip(RoundedCornerShape(10.dp))
              .background(if (reqTab == 0) CinemaWhite else Color.Transparent)
              .clickable { reqTab = 0 }
              .padding(vertical = 8.dp),
            contentAlignment = Alignment.Center
          ) {
            Text(
              text = "MINIMUM",
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp,
              color = if (reqTab == 0) MinimalBlack else Zinc400
            )
          }
          Box(
            modifier = Modifier
              .weight(1f)
              .clip(RoundedCornerShape(10.dp))
              .background(if (reqTab == 1) CinemaWhite else Color.Transparent)
              .clickable { reqTab = 1 }
              .padding(vertical = 8.dp),
            contentAlignment = Alignment.Center
          ) {
            Text(
              text = "RECOMMENDED",
              fontWeight = FontWeight.Bold,
              fontSize = 11.sp,
              color = if (reqTab == 1) MinimalBlack else Zinc400
            )
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        val specItems = if (reqTab == 0) {
          listOfNotNull(
            "OS" to requirements?.minOs,
            "Processor" to requirements?.minCpu,
            "Memory / RAM" to requirements?.minRam,
            "Graphics / GPU" to requirements?.minGpu,
            "VRAM" to requirements?.minVram,
            "DirectX" to requirements?.minDirectX,
            requirements?.minVulkan?.let { "Vulkan" to it },
            requirements?.minOpenGl?.let { "OpenGL" to it },
            "Storage" to requirements?.minStorage,
            "Additional Notes" to requirements?.minNotes
          )
        } else {
          listOfNotNull(
            "OS" to requirements?.recOs,
            "Processor" to requirements?.recCpu,
            "Memory / RAM" to requirements?.recRam,
            "Graphics / GPU" to requirements?.recGpu,
            "VRAM" to requirements?.recVram,
            "DirectX" to requirements?.recDirectX,
            requirements?.recVulkan?.let { "Vulkan" to it },
            requirements?.recOpenGl?.let { "OpenGL" to it },
            "Storage" to requirements?.recStorage,
            "Additional Notes" to requirements?.recNotes
          )
        }

        Column(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Zinc900)
            .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
            .padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          specItems.forEach { (label, value) ->
            if (!value.isNullOrBlank()) {
              PcSpecRowItem(label = label, value = value)
            }
          }
        }
      } else {
        // Smart Evaluator Tab
        val statusColor = when (evaluatedPcResult.rating) {
          com.example.domain.model.CompatibilityRating.EXCELLENT -> Color(0xFF00E676)
          com.example.domain.model.CompatibilityRating.GOOD -> Color(0xFF3DDC84)
          com.example.domain.model.CompatibilityRating.PLAYABLE -> Color(0xFFFFB300)
          com.example.domain.model.CompatibilityRating.LOW -> Color(0xFFFF9100)
          com.example.domain.model.CompatibilityRating.UNSUPPORTED -> Color(0xFFFF3D00)
          com.example.domain.model.CompatibilityRating.UNCERTAIN -> Color(0xFF9E9E9E)
        }

        Surface(
          color = Zinc900,
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.5.dp, statusColor.copy(alpha = 0.6f)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(16.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Surface(
                color = statusColor.copy(alpha = 0.15f),
                shape = RoundedCornerShape(8.dp),
                border = BorderStroke(1.dp, statusColor.copy(alpha = 0.4f))
              ) {
                Text(
                  text = evaluatedPcResult.ratingLabel.uppercase(),
                  color = statusColor,
                  fontSize = 12.sp,
                  fontWeight = FontWeight.Bold,
                  letterSpacing = 0.6.sp,
                  modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                )
              }

              Text(
                text = "$selectedGpuTier, $selectedRamGb GB",
                color = Zinc400,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
              )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
              text = evaluatedPcResult.summaryText,
              color = CinemaWhite,
              fontSize = 13.sp,
              lineHeight = 18.sp
            )
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        PerformanceEstimateCard(estimate = evaluatedPcResult.performanceEstimate)

        Spacer(modifier = Modifier.height(20.dp))

        Text(
          text = "CUSTOM HARDWARE PROFILE",
          color = Zinc400,
          fontSize = 11.sp,
          fontWeight = FontWeight.Bold,
          letterSpacing = 1.2.sp
        )

        Spacer(modifier = Modifier.height(10.dp))

        Column(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Zinc900)
            .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
            .padding(16.dp),
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          val osOptions = remember(requirements) {
            val list = mutableListOf<String>()
            val rawReqText = "${requirements?.minOs} ${requirements?.recOs}".lowercase()
            if (rawReqText.contains("windows 11") || rawReqText.contains("win 11")) list.add("Windows 11")
            if (rawReqText.contains("windows 10") || rawReqText.contains("win 10")) list.add("Windows 10")
            if (rawReqText.contains("windows 8.1") || rawReqText.contains("8.1")) list.add("Windows 8.1")
            if (rawReqText.contains("windows 8") || rawReqText.contains("win 8")) list.add("Windows 8")
            if (rawReqText.contains("windows 7") || rawReqText.contains("win 7")) list.add("Windows 7")
            if (rawReqText.contains("xp") || rawReqText.contains("windows xp")) list.add("Windows XP")

            val fullSet = listOf("Windows 11", "Windows 10", "Windows 8.1", "Windows 8", "Windows 7", "Windows XP", "Linux (SteamOS)", "macOS")
            if (list.isEmpty()) fullSet else (list + listOf("Linux (SteamOS)", "macOS")).distinct()
          }

          PcHwSelectorRow(
            label = "Operating System",
            options = osOptions,
            selectedOption = selectedOs,
            onSelect = { selectedOs = it }
          )

          PcHwSelectorRow(
            label = "Processor Tier",
            options = listOf(
              "Intel Core i9 / Ryzen 9",
              "Intel Core i7 / Ryzen 7",
              "Intel Core i5 / Ryzen 5",
              "Intel Core i3 / Ryzen 3"
            ),
            selectedOption = selectedCpuTier,
            onSelect = { selectedCpuTier = it }
          )

          PcHwSelectorRow(
            label = "Graphics Card Tier",
            options = listOf(
              "NVIDIA RTX 4080/4090",
              "NVIDIA RTX 3070/4070",
              "NVIDIA RTX 3060 / RX 6600",
              "NVIDIA GTX 1660 / RX 580",
              "Integrated Graphics"
            ),
            selectedOption = selectedGpuTier,
            onSelect = { selectedGpuTier = it }
          )

          PcHwSelectorRow(
            label = "System Memory (RAM)",
            options = listOf("32 GB", "16 GB", "8 GB", "4 GB"),
            selectedOption = "$selectedRamGb GB",
            onSelect = { selectedRamGb = it.replace(" GB", "").toIntOrNull() ?: 16 }
          )

          PcHwSelectorRow(
            label = "Video Memory (VRAM)",
            options = listOf("16 GB", "12 GB", "8 GB", "4 GB"),
            selectedOption = "$selectedVramGb GB",
            onSelect = { selectedVramGb = it.replace(" GB", "").toIntOrNull() ?: 8 }
          )

          PcHwSelectorRow(
            label = "Target Resolution",
            options = listOf("4K (2160p)", "1440p (QHD)", "1080p (Full HD)", "720p (HD)"),
            selectedOption = selectedResolution,
            onSelect = { selectedResolution = it }
          )
        }
      }
    }
  }
}

@Composable
private fun PcHwSelectorRow(
  label: String,
  options: List<String>,
  selectedOption: String,
  onSelect: (String) -> Unit
) {
  Column(modifier = Modifier.fillMaxWidth()) {
    Text(
      text = label,
      color = Zinc400,
      fontSize = 11.sp,
      fontWeight = FontWeight.Medium
    )
    Spacer(modifier = Modifier.height(6.dp))
    val scrollState = rememberScrollState()
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .horizontalScroll(scrollState),
      horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
      options.forEach { opt ->
        val isSelected = opt.equals(selectedOption, ignoreCase = true) || opt.contains(selectedOption, ignoreCase = true)
        Surface(
          color = if (isSelected) CinemaWhite else Color(0xFF1E2028),
          shape = RoundedCornerShape(8.dp),
          border = BorderStroke(1.dp, if (isSelected) CinemaWhite else CinematicBorderSubtle),
          modifier = Modifier.clickable { onSelect(opt) }
        ) {
          Text(
            text = opt,
            color = if (isSelected) MinimalBlack else CinemaWhite,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
          )
        }
      }
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AndroidCompatibilityBottomSheet(
  gameTitle: String,
  pcRequirements: com.example.domain.model.PcRequirements?,
  isNativeAndroid: Boolean,
  onDismiss: () -> Unit
) {
  val context = LocalContext.current
  val deviceInfo = remember { com.example.data.device.DeviceInfoProvider(context).getDeviceInfo() }
  val evaluation = remember(deviceInfo, pcRequirements, isNativeAndroid) {
    com.example.domain.engine.DeviceCompatibilityEngine.evaluate(deviceInfo, pcRequirements, isNativeAndroid)
  }
  val scrollState = rememberScrollState()

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color(0xFF0D0E12),
    contentColor = CinemaWhite,
    shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(scrollState)
        .padding(horizontal = 24.dp)
        .padding(bottom = 32.dp)
        .navigationBarsPadding()
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          com.example.util.AndroidChipWithThemedBorder(
            height = 28.dp,
            fontSize = 11.sp,
            textPaddingHorizontal = 6.dp,
            textPaddingVertical = 2.dp
          )
          Spacer(modifier = Modifier.width(12.dp))
          Column {
            Text(
              text = "DEVICE COMPATIBILITY CHECK",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              letterSpacing = 0.5.sp,
              color = CinemaWhite
            )
            Text(
              text = gameTitle,
              style = MaterialTheme.typography.bodySmall,
              color = Zinc400,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
          }
        }
        IconButton(onClick = onDismiss) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close",
            tint = Zinc400
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Overall Compatibility Status Banner
      val statusColor = when (evaluation.rating) {
        com.example.domain.model.CompatibilityRating.EXCELLENT -> Color(0xFF00E676)
        com.example.domain.model.CompatibilityRating.GOOD -> Color(0xFF3DDC84)
        com.example.domain.model.CompatibilityRating.PLAYABLE -> Color(0xFFFFB300)
        com.example.domain.model.CompatibilityRating.LOW -> Color(0xFFFF9100)
        com.example.domain.model.CompatibilityRating.UNSUPPORTED -> Color(0xFFFF3D00)
        com.example.domain.model.CompatibilityRating.UNCERTAIN -> Color(0xFF9E9E9E)
      }

      Surface(
        color = Zinc900,
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.5.dp, statusColor.copy(alpha = 0.6f)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(16.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              color = statusColor.copy(alpha = 0.15f),
              shape = RoundedCornerShape(8.dp),
              border = BorderStroke(1.dp, statusColor.copy(alpha = 0.4f))
            ) {
              Text(
                text = evaluation.ratingLabel.uppercase(),
                color = statusColor,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.6.sp,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
              )
            }

            Text(
              text = deviceInfo.deviceDisplayName,
              color = Zinc400,
              fontSize = 11.sp,
              fontWeight = FontWeight.Medium,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
          }

          Spacer(modifier = Modifier.height(10.dp))

          Text(
            text = evaluation.summaryText,
            color = CinemaWhite,
            fontSize = 13.sp,
            lineHeight = 18.sp
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      PerformanceEstimateCard(estimate = evaluation.performanceEstimate)

      Spacer(modifier = Modifier.height(20.dp))

      // Hardware Diagnostic Checks
      Text(
        text = "HARDWARE VERIFICATION",
        color = Zinc400,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.2.sp
      )

      Spacer(modifier = Modifier.height(10.dp))

      Column(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(16.dp))
          .background(Zinc900)
          .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
          .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
      ) {
        evaluation.hardwareChecks.forEach { check ->
          AndroidHardwareCheckRow(check)
        }
      }

      Spacer(modifier = Modifier.height(20.dp))

      // Device Specs Card
      Text(
        text = "DETECTED DEVICE PROFILE",
        color = Zinc400,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.2.sp
      )

      Spacer(modifier = Modifier.height(10.dp))

      Column(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(16.dp))
          .background(Zinc900)
          .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
          .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        PcSpecRowItem(label = "Device", value = deviceInfo.deviceDisplayName)
        PcSpecRowItem(label = "OS Version", value = "Android ${deviceInfo.androidRelease} (API ${deviceInfo.sdkInt})")
        PcSpecRowItem(label = "Processor", value = "${deviceInfo.cpuCores} Cores (${deviceInfo.cpuArchitecture})")
        PcSpecRowItem(label = "Total Memory", value = "%.1f GB (%.1f GB available)".format(deviceInfo.ramTotalGb, deviceInfo.ramAvailableGb))
        PcSpecRowItem(label = "Storage", value = "%.1f GB free of %.1f GB".format(deviceInfo.storageFreeGb, deviceInfo.storageTotalGb))
        PcSpecRowItem(label = "Graphics Engine", value = "OpenGL ES ${deviceInfo.openGlEsVersion}${if (deviceInfo.vulkanSupported) ", Vulkan" else ""}")
        if (!deviceInfo.displayResolution.isNullOrBlank()) {
          PcSpecRowItem(label = "Display", value = deviceInfo.displayResolution)
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Disclaimer
      Surface(
        color = Zinc900.copy(alpha = 0.5f),
        shape = RoundedCornerShape(10.dp),
        border = BorderStroke(1.dp, CinematicBorderSubtle.copy(alpha = 0.5f)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier.padding(12.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Icon(
            imageVector = Icons.Outlined.Info,
            contentDescription = null,
            tint = Zinc500,
            modifier = Modifier.size(16.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "Heuristic estimate based on device hardware and published specifications. Real-world gaming performance depends on background apps, thermal throttling, and resolution.",
            color = Zinc500,
            fontSize = 11.sp,
            lineHeight = 15.sp
          )
        }
      }
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LinuxCompatibilityBottomSheet(
  gameTitle: String,
  pcRequirements: com.example.domain.model.PcRequirements?,
  isNativeLinux: Boolean,
  onDismiss: () -> Unit
) {
  val evaluation = remember(pcRequirements) {
    com.example.domain.engine.DeviceCompatibilityEngine.evaluateLinux(pcRequirements = pcRequirements)
  }
  val scrollState = rememberScrollState()

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color(0xFF0D0E12),
    contentColor = CinemaWhite,
    shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(scrollState)
        .padding(horizontal = 24.dp)
        .padding(bottom = 32.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          com.example.util.LinuxChipWithThemedBorder(
            height = 28.dp,
            fontSize = 11.sp,
            textPaddingHorizontal = 6.dp,
            textPaddingVertical = 2.dp
          )
          Spacer(modifier = Modifier.width(12.dp))
          Column {
            Text(
              text = "LINUX COMPATIBILITY CHECK",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              letterSpacing = 0.5.sp,
              color = CinemaWhite
            )
            Text(
              text = gameTitle,
              style = MaterialTheme.typography.bodySmall,
              color = Zinc400,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
          }
        }
        IconButton(onClick = onDismiss) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close",
            tint = Zinc400
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      val statusColor = when (evaluation.rating) {
        com.example.domain.model.CompatibilityRating.EXCELLENT -> Color(0xFF00E676)
        com.example.domain.model.CompatibilityRating.GOOD -> Color(0xFF3DDC84)
        com.example.domain.model.CompatibilityRating.PLAYABLE -> Color(0xFFFFB300)
        com.example.domain.model.CompatibilityRating.LOW -> Color(0xFFFF9100)
        com.example.domain.model.CompatibilityRating.UNSUPPORTED -> Color(0xFFFF3D00)
        com.example.domain.model.CompatibilityRating.UNCERTAIN -> Color(0xFF9E9E9E)
      }

      Surface(
        color = Zinc900,
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.5.dp, statusColor.copy(alpha = 0.6f)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(16.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              color = statusColor.copy(alpha = 0.15f),
              shape = RoundedCornerShape(8.dp),
              border = BorderStroke(1.dp, statusColor.copy(alpha = 0.4f))
            ) {
              Text(
                text = evaluation.ratingLabel.uppercase(),
                color = statusColor,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.6.sp,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
              )
            }

            Text(
              text = "Linux / SteamOS Platform",
              color = Zinc400,
              fontSize = 11.sp,
              fontWeight = FontWeight.Medium
            )
          }

          Spacer(modifier = Modifier.height(10.dp))

          Text(
            text = evaluation.summaryText,
            color = CinemaWhite,
            fontSize = 13.sp,
            lineHeight = 18.sp
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      PerformanceEstimateCard(estimate = evaluation.performanceEstimate)

      Spacer(modifier = Modifier.height(20.dp))

      Text(
        text = "HARDWARE VERIFICATION",
        color = Zinc400,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.2.sp
      )

      Spacer(modifier = Modifier.height(10.dp))

      Column(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(16.dp))
          .background(Zinc900)
          .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
          .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
      ) {
        evaluation.hardwareChecks.forEach { check ->
          AndroidHardwareCheckRow(check)
        }
      }
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IosCompatibilityBottomSheet(
  gameTitle: String,
  pcRequirements: com.example.domain.model.PcRequirements?,
  isNativeIos: Boolean,
  onDismiss: () -> Unit
) {
  val evaluation = remember(pcRequirements) {
    com.example.domain.engine.DeviceCompatibilityEngine.evaluateIos(pcRequirements = pcRequirements)
  }
  val scrollState = rememberScrollState()

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = Color(0xFF0D0E12),
    contentColor = CinemaWhite,
    shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .verticalScroll(scrollState)
        .padding(horizontal = 24.dp)
        .padding(bottom = 32.dp)
        .navigationBarsPadding()
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          com.example.util.IosChipWithThemedBorder(
            height = 28.dp,
            fontSize = 11.sp,
            textPaddingHorizontal = 6.dp,
            textPaddingVertical = 2.dp
          )
          Spacer(modifier = Modifier.width(12.dp))
          Column {
            Text(
              text = "iOS COMPATIBILITY CHECK",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold,
              letterSpacing = 0.5.sp,
              color = CinemaWhite
            )
            Text(
              text = gameTitle,
              style = MaterialTheme.typography.bodySmall,
              color = Zinc400,
              maxLines = 1,
              overflow = TextOverflow.Ellipsis
            )
          }
        }
        IconButton(onClick = onDismiss) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close",
            tint = Zinc400
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      val statusColor = when (evaluation.rating) {
        com.example.domain.model.CompatibilityRating.EXCELLENT -> Color(0xFF00E676)
        com.example.domain.model.CompatibilityRating.GOOD -> Color(0xFF3DDC84)
        com.example.domain.model.CompatibilityRating.PLAYABLE -> Color(0xFFFFB300)
        com.example.domain.model.CompatibilityRating.LOW -> Color(0xFFFF9100)
        com.example.domain.model.CompatibilityRating.UNSUPPORTED -> Color(0xFFFF3D00)
        com.example.domain.model.CompatibilityRating.UNCERTAIN -> Color(0xFF9E9E9E)
      }

      Surface(
        color = Zinc900,
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.5.dp, statusColor.copy(alpha = 0.6f)),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(16.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              color = statusColor.copy(alpha = 0.15f),
              shape = RoundedCornerShape(8.dp),
              border = BorderStroke(1.dp, statusColor.copy(alpha = 0.4f))
            ) {
              Text(
                text = evaluation.ratingLabel.uppercase(),
                color = statusColor,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.6.sp,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
              )
            }

            Text(
              text = "iOS / iPadOS Platform",
              color = Zinc400,
              fontSize = 11.sp,
              fontWeight = FontWeight.Medium
            )
          }

          Spacer(modifier = Modifier.height(10.dp))

          Text(
            text = evaluation.summaryText,
            color = CinemaWhite,
            fontSize = 13.sp,
            lineHeight = 18.sp
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      PerformanceEstimateCard(estimate = evaluation.performanceEstimate)

      Spacer(modifier = Modifier.height(20.dp))

      Text(
        text = "HARDWARE VERIFICATION",
        color = Zinc400,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.2.sp
      )

      Spacer(modifier = Modifier.height(10.dp))

      Column(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(16.dp))
          .background(Zinc900)
          .border(1.dp, CinematicBorderSubtle, RoundedCornerShape(16.dp))
          .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
      ) {
        evaluation.hardwareChecks.forEach { check ->
          AndroidHardwareCheckRow(check)
        }
      }
    }
  }
}

@Composable
private fun AndroidHardwareCheckRow(check: com.example.domain.model.HardwareCheckItem) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically
  ) {
    Column(modifier = Modifier.weight(1f)) {
      Text(
        text = check.title,
        color = CinemaWhite,
        fontSize = 13.sp,
        fontWeight = FontWeight.SemiBold
      )
      Spacer(modifier = Modifier.height(2.dp))
      Text(
        text = "Your device: ${check.detectedValue}",
        color = Zinc400,
        fontSize = 11.sp
      )
      Text(
        text = "Target requirement: ${check.requiredValue}",
        color = Zinc500,
        fontSize = 10.sp
      )
    }

    Spacer(modifier = Modifier.width(12.dp))

    val (badgeText, badgeColor) = when {
      check.isPass && !check.isWarning -> "PASS" to Color(0xFF00E676)
      check.isPass && check.isWarning -> "ADEQUATE" to Color(0xFFFFB300)
      else -> "CAUTION" to Color(0xFFFF5722)
    }

    Surface(
      color = badgeColor.copy(alpha = 0.15f),
      shape = RoundedCornerShape(6.dp),
      border = BorderStroke(1.dp, badgeColor.copy(alpha = 0.4f))
    ) {
      Text(
        text = badgeText,
        color = badgeColor,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 0.5.sp,
        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
      )
    }
  }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun GameDevelopersAndPublishersSection(
  developers: List<com.example.domain.model.GameCompany>,
  publishers: List<com.example.domain.model.GameCompany>,
  onCompanyClick: (com.example.domain.model.GameCompany) -> Unit
) {
  Column(
    modifier = Modifier
      .fillMaxWidth()
      .padding(horizontal = 20.dp)
  ) {
    if (developers.isNotEmpty()) {
      Text(
        text = "DEVELOPERS",
        color = Zinc400,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.2.sp
      )
      Spacer(modifier = Modifier.height(8.dp))
      FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        developers.forEach { dev ->
          Surface(
            color = Zinc900,
            shape = RoundedCornerShape(50.dp),
            border = BorderStroke(1.dp, CinematicBorderSubtle),
            modifier = Modifier.clickable { onCompanyClick(dev) }
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
              Icon(
                imageVector = Icons.Rounded.SportsEsports,
                contentDescription = null,
                tint = CinemaWhite,
                modifier = Modifier.size(13.dp)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = dev.name,
                color = CinemaWhite,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
              )
            }
          }
        }
      }
      Spacer(modifier = Modifier.height(16.dp))
    }

    if (publishers.isNotEmpty()) {
      Text(
        text = "PUBLISHERS",
        color = Zinc400,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.2.sp
      )
      Spacer(modifier = Modifier.height(8.dp))
      FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        publishers.forEach { pub ->
          Surface(
            color = Zinc900,
            shape = RoundedCornerShape(50.dp),
            border = BorderStroke(1.dp, CinematicBorderSubtle),
            modifier = Modifier.clickable { onCompanyClick(pub) }
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
              Icon(
                imageVector = Icons.Default.Business,
                contentDescription = null,
                tint = CinemaWhite,
                modifier = Modifier.size(13.dp)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = pub.name,
                color = CinemaWhite,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
              )
            }
          }
        }
      }
    }
  }
}
