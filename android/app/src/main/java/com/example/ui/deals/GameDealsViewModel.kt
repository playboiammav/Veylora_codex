package com.example.ui.deals

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.example.CinemaHubApp
import com.example.data.remote.model.GameDeal
import com.example.data.repository.CheapSharkRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface DealsUiState {
  data object Loading : DealsUiState
  data class Success(val deals: List<GameDeal>, val currentFilter: String = "Savings") : DealsUiState
  data class Error(val message: String) : DealsUiState
  data object Empty : DealsUiState
}

class GameDealsViewModel(
  private val repository: CheapSharkRepository
) : ViewModel() {

  private val _uiState = MutableStateFlow<DealsUiState>(DealsUiState.Loading)
  val uiState: StateFlow<DealsUiState> = _uiState.asStateFlow()

  private var activeStoreId: String = "1"
  private var activeOnSale: Int = 1

  init {
    fetchDeals()
  }

  fun fetchDeals(storeId: String = activeStoreId, onSale: Int = activeOnSale) {
    activeStoreId = storeId
    activeOnSale = onSale
    _uiState.value = DealsUiState.Loading

    viewModelScope.launch {
      repository.getDeals(
        storeId = storeId,
        onSale = onSale
      ).fold(
        onSuccess = { deals ->
          if (deals.isEmpty()) {
            _uiState.value = DealsUiState.Empty
          } else {
            _uiState.value = DealsUiState.Success(deals, currentFilter = storeId)
          }
        },
        onFailure = { error ->
          _uiState.value = DealsUiState.Error(
            error.localizedMessage ?: "Unable to connect to game deals service. Please check your internet connection."
          )
        }
      )
    }
  }

  fun retry() {
    fetchDeals(activeStoreId, activeOnSale)
  }

  companion object {
    val Factory: ViewModelProvider.Factory = viewModelFactory {
      initializer {
        val application = (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as CinemaHubApp)
        GameDealsViewModel(application.container.cheapSharkRepository)
      }
    }
  }
}

typealias DealsViewModel = GameDealsViewModel
