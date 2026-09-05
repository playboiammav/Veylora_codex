package com.example.di

import android.content.Context
import com.example.data.local.CinemaHubDatabase
import com.example.data.preferences.UserPreferencesRepository
import com.example.data.preferences.userDataStore
import com.example.data.remote.CheapSharkApiService
import com.example.data.remote.NetworkModule
import com.example.data.remote.VeyloraBackendApiService
import com.example.data.repository.CheapSharkRepository
import com.example.data.repository.DealsRepository
import com.example.data.repository.GameRepository
import com.example.data.repository.MovieRepository
import com.example.data.update.DevUpdateManager

interface AppContainer {
  val veyloraBackendApiService: VeyloraBackendApiService
  val cheapSharkApiService: CheapSharkApiService
  val database: CinemaHubDatabase
  val movieRepository: MovieRepository
  val gameRepository: GameRepository
  val cheapSharkRepository: CheapSharkRepository
  val dealsRepository: DealsRepository
  val userPreferencesRepository: UserPreferencesRepository
  val devUpdateManager: DevUpdateManager
}

class DefaultAppContainer(private val context: Context) : AppContainer {

  override val veyloraBackendApiService: VeyloraBackendApiService by lazy {
    NetworkModule.createVeyloraBackendApiService()
  }

  override val cheapSharkApiService: CheapSharkApiService by lazy {
    NetworkModule.createCheapSharkApiService()
  }

  override val database: CinemaHubDatabase by lazy {
    CinemaHubDatabase.getDatabase(context)
  }

  override val movieRepository: MovieRepository by lazy {
    MovieRepository(
      backendApiService = veyloraBackendApiService,
      movieDao = database.movieDao(),
      userRatingDao = database.userRatingDao()
    )
  }

  override val gameRepository: GameRepository by lazy {
    GameRepository(
      backendApiService = veyloraBackendApiService
    )
  }

  override val cheapSharkRepository: CheapSharkRepository by lazy {
    CheapSharkRepository(
      apiService = cheapSharkApiService
    )
  }

  override val dealsRepository: DealsRepository by lazy {
    cheapSharkRepository
  }

  override val userPreferencesRepository: UserPreferencesRepository by lazy {
    UserPreferencesRepository(
      dataStore = context.userDataStore
    )
  }

  override val devUpdateManager: DevUpdateManager by lazy {
    DevUpdateManager(context.applicationContext)
  }
}

