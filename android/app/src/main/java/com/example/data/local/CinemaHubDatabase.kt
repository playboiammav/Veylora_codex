package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
  entities = [MovieEntity::class, UserRatingEntity::class],
  version = 2,
  exportSchema = false
)
abstract class CinemaHubDatabase : RoomDatabase() {

  abstract fun movieDao(): MovieDao
  abstract fun userRatingDao(): UserRatingDao

  companion object {
    @Volatile
    private var INSTANCE: CinemaHubDatabase? = null

    fun getDatabase(context: Context): CinemaHubDatabase {
      return INSTANCE ?: synchronized(this) {
        val instance = Room.databaseBuilder(
          context.applicationContext,
          CinemaHubDatabase::class.java,
          "cinema_hub.db"
        )
          .fallbackToDestructiveMigration()
          .build()
        INSTANCE = instance
        instance
      }
    }
  }
}
