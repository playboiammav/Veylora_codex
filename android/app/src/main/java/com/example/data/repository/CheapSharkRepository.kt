package com.example.data.repository

import com.example.data.remote.CheapSharkApiService
import com.example.data.remote.model.GameDeal
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.IOException

class CheapSharkRepository(
  private val apiService: CheapSharkApiService
) {

  suspend fun getDeals(
    storeId: String = "1",
    onSale: Int = 1
  ): Result<List<GameDeal>> = withContext(Dispatchers.IO) {
    try {
      val response = apiService.getDeals(
        storeID = storeId,
        onSale = onSale
      )
      if (response.isSuccessful) {
        val deals = response.body().orEmpty()
        Result.success(deals)
      } else {
        Result.failure(Exception("Failed to fetch deals: HTTP ${response.code()} ${response.message()}"))
      }
    } catch (e: IOException) {
      Result.failure(Exception("Network error: Please check your internet connection.", e))
    } catch (e: Exception) {
      Result.failure(Exception(e.localizedMessage ?: "Unexpected error fetching deals", e))
    }
  }
}

typealias DealsRepository = CheapSharkRepository

