package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_ratings")
data class UserRatingEntity(
  @PrimaryKey val contentKey: String,
  val rating: Float,
  val ratedAt: Long = System.currentTimeMillis()
)
