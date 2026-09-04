package com.example

import android.app.Application
import coil.ImageLoader
import coil.ImageLoaderFactory
import coil.decode.SvgDecoder
import com.example.di.AppContainer
import com.example.di.DefaultAppContainer

class CinemaHubApp : Application(), ImageLoaderFactory {

  lateinit var container: AppContainer

  override fun onCreate() {
    super.onCreate()
    com.example.data.currency.CurrencyManager.init(this)
    container = DefaultAppContainer(this)
  }

  override fun newImageLoader(): ImageLoader {
    return ImageLoader.Builder(this)
      .components {
        add(SvgDecoder.Factory())
      }
      .crossfade(true)
      .build()
  }
}

