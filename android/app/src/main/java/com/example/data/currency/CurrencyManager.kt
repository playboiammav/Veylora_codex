package com.example.data.currency

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale

data class CurrencyInfo(
  val code: String,
  val name: String,
  val symbol: String,
  val rateToUsd: Double,
  val flag: String = ""
)

object CurrencyManager {

  private const val PREFS_NAME = "veylora_currency_prefs"
  private const val KEY_CURRENCY_CODE = "selected_currency_code"
  private const val KEY_COUNTRY_NAME = "selected_country_name"

  val SUPPORTED_CURRENCIES = listOf(
    CurrencyInfo("USD", "US Dollar", "$", 1.0, "🇺🇸"),
    CurrencyInfo("EGP", "Egyptian Pound", "EGP ", 48.50, "🇪🇬"),
    CurrencyInfo("SAR", "Saudi Riyal", "SAR ", 3.75, "🇸🇦"),
    CurrencyInfo("AED", "UAE Dirham", "AED ", 3.67, "🇦🇪"),
    CurrencyInfo("EUR", "Euro", "€", 0.92, "🇪🇺"),
    CurrencyInfo("GBP", "British Pound", "£", 0.79, "🇬🇧"),
    CurrencyInfo("KWD", "Kuwaiti Dinar", "KWD ", 0.31, "🇰🇼"),
    CurrencyInfo("QAR", "Qatari Riyal", "QAR ", 3.64, "🇶🇦"),
    CurrencyInfo("BHD", "Bahraini Dinar", "BHD ", 0.38, "🇧🇭"),
    CurrencyInfo("OMR", "Omani Rial", "OMR ", 0.385, "🇴🇲"),
    CurrencyInfo("JPY", "Japanese Yen", "¥", 155.0, "🇯🇵"),
    CurrencyInfo("CAD", "Canadian Dollar", "CA$", 1.37, "🇨🇦"),
    CurrencyInfo("AUD", "Australian Dollar", "AU$", 1.52, "🇦🇺"),
    CurrencyInfo("BRL", "Brazilian Real", "R$", 5.40, "🇧🇷"),
    CurrencyInfo("KRW", "South Korean Won", "₩", 1370.0, "🇰🇷"),
    CurrencyInfo("MAD", "Moroccan Dirham", "MAD ", 9.90, "🇲🇦"),
    CurrencyInfo("DZD", "Algerian Dinar", "DZD ", 134.0, "🇩🇿"),
    CurrencyInfo("INR", "Indian Rupee", "₹", 83.5, "🇮🇳")
  )

  private val COUNTRY_TO_CURRENCY = mapOf(
    "Egypt" to "EGP",
    "Saudi Arabia" to "SAR",
    "United Arab Emirates" to "AED",
    "United States" to "USD",
    "United Kingdom" to "GBP",
    "France" to "EUR",
    "Germany" to "EUR",
    "Italy" to "EUR",
    "Spain" to "EUR",
    "Netherlands" to "EUR",
    "Kuwait" to "KWD",
    "Qatar" to "QAR",
    "Bahrain" to "BHD",
    "Oman" to "OMR",
    "Japan" to "JPY",
    "South Korea" to "KRW",
    "Canada" to "CAD",
    "Australia" to "AUD",
    "Brazil" to "BRL",
    "Morocco" to "MAD",
    "Algeria" to "DZD",
    "India" to "INR"
  )

  private var prefs: SharedPreferences? = null

  private val _currentCurrency = MutableStateFlow(SUPPORTED_CURRENCIES.first())
  val currentCurrency: StateFlow<CurrencyInfo> = _currentCurrency.asStateFlow()

  fun init(context: Context) {
    if (prefs != null) return
    val p = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs = p

    val savedCode = p.getString(KEY_CURRENCY_CODE, null)
    if (savedCode != null) {
      val found = SUPPORTED_CURRENCIES.find { it.code.equals(savedCode, ignoreCase = true) }
      if (found != null) {
        _currentCurrency.value = found
        return
      }
    }

    // If not saved, detect from system locale or default to USD
    val detectedCountry = try {
      val loc = Locale.getDefault().displayCountry
      if (loc.isNotBlank()) loc else "United States"
    } catch (_: Exception) {
      "United States"
    }
    setCurrencyByCountry(detectedCountry)
  }

  fun setCurrency(currencyCode: String) {
    val found = SUPPORTED_CURRENCIES.find { it.code.equals(currencyCode, ignoreCase = true) }
      ?: SUPPORTED_CURRENCIES.first()
    _currentCurrency.value = found
    prefs?.edit()?.putString(KEY_CURRENCY_CODE, found.code)?.apply()
  }

  fun setCurrencyByCountry(countryName: String) {
    prefs?.edit()?.putString(KEY_COUNTRY_NAME, countryName)?.apply()
    val currencyCode = COUNTRY_TO_CURRENCY[countryName]
      ?: COUNTRY_TO_CURRENCY.entries.find { it.key.contains(countryName, ignoreCase = true) }?.value
      ?: "USD"
    setCurrency(currencyCode)
  }

  fun getSavedCountry(): String {
    return prefs?.getString(KEY_COUNTRY_NAME, "United States") ?: "United States"
  }

  fun formatPrice(priceUsd: Double): String {
    val curr = _currentCurrency.value
    val converted = priceUsd * curr.rateToUsd
    return if (curr.code == "USD" || curr.code == "EUR" || curr.code == "GBP" || curr.code == "CAD" || curr.code == "AUD") {
      "${curr.symbol}${String.format(Locale.US, "%.2f", converted)}"
    } else if (curr.code == "JPY" || curr.code == "KRW") {
      "${curr.symbol}${String.format(Locale.US, "%,.0f", converted)}"
    } else {
      "${curr.symbol}${String.format(Locale.US, "%.2f", converted)} ${curr.code}"
    }
  }

  fun formatPrice(priceUsdString: String?): String {
    if (priceUsdString.isNullOrBlank()) return "N/A"
    val parsed = priceUsdString.toDoubleOrNull() ?: return "$$priceUsdString"
    return formatPrice(parsed)
  }
}
