package com.example.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

val Context.userDataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

class UserPreferencesRepository(
  private val dataStore: DataStore<Preferences>
) {

  private object PreferenceKeys {
    val SELECTED_CURRENCY_CODE = stringPreferencesKey("selected_currency_code")
    val SELECTED_COUNTRY_NAME = stringPreferencesKey("selected_country_name")
  }

  val currencyCodeFlow: Flow<String> = dataStore.data
    .catch { exception ->
      if (exception is IOException) {
        emit(emptyPreferences())
      } else {
        throw exception
      }
    }
    .map { preferences ->
      preferences[PreferenceKeys.SELECTED_CURRENCY_CODE] ?: "USD"
    }

  val countryNameFlow: Flow<String> = dataStore.data
    .catch { exception ->
      if (exception is IOException) {
        emit(emptyPreferences())
      } else {
        throw exception
      }
    }
    .map { preferences ->
      preferences[PreferenceKeys.SELECTED_COUNTRY_NAME] ?: "United States"
    }

  suspend fun saveCurrencyCode(currencyCode: String) {
    dataStore.edit { preferences ->
      preferences[PreferenceKeys.SELECTED_CURRENCY_CODE] = currencyCode
    }
  }

  suspend fun saveCountryName(countryName: String) {
    dataStore.edit { preferences ->
      preferences[PreferenceKeys.SELECTED_COUNTRY_NAME] = countryName
    }
  }

  suspend fun setCountryAndMapCurrency(countryName: String, currencyCode: String) {
    dataStore.edit { preferences ->
      preferences[PreferenceKeys.SELECTED_COUNTRY_NAME] = countryName
      preferences[PreferenceKeys.SELECTED_CURRENCY_CODE] = currencyCode
    }
  }
}
