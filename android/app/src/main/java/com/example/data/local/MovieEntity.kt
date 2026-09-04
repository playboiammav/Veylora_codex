package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.domain.model.Movie

@Entity(tableName = "movies")
data class MovieEntity(
  @PrimaryKey val id: Long,
  val title: String,
  val overview: String,
  val posterPath: String?,
  val backdropPath: String?,
  val releaseDate: String?,
  val voteAverage: Double,
  val voteCount: Int,
  val category: String,
  val isFavorite: Boolean = false,
  val savedAt: Long = System.currentTimeMillis()
) {
  fun toDomain(): Movie {
    val year = releaseDate?.takeIf { it.length >= 4 }?.substring(0, 4) ?: "Unknown"
    val poster = posterPath?.let { "https://image.tmdb.org/t/p/w342$it" }
    val backdrop = backdropPath?.let { "https://image.tmdb.org/t/p/w1280$it" }

    return Movie(
      id = id,
      title = title,
      overview = overview,
      posterUrl = poster,
      backdropUrl = backdrop,
      releaseDate = releaseDate,
      releaseYear = year,
      voteAverage = voteAverage,
      voteCount = voteCount,
      isFavorite = isFavorite,
      posterPath = posterPath,
      backdropPath = backdropPath
    )
  }
}
