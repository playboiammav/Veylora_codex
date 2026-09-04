package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface MovieDao {

  @Query("SELECT * FROM movies WHERE category = :category ORDER BY savedAt ASC")
  fun getMoviesByCategory(category: String): Flow<List<MovieEntity>>

  @Query("SELECT * FROM movies WHERE isFavorite = 1 ORDER BY savedAt DESC")
  fun getFavoriteMovies(): Flow<List<MovieEntity>>

  @Query("SELECT id FROM movies WHERE isFavorite = 1")
  fun getFavoriteMovieIds(): Flow<List<Long>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun upsertMovies(movies: List<MovieEntity>)

  @Query("UPDATE movies SET isFavorite = :isFavorite WHERE id = :movieId")
  suspend fun setFavorite(movieId: Long, isFavorite: Boolean)

  @Query("SELECT isFavorite FROM movies WHERE id = :movieId LIMIT 1")
  suspend fun isFavorite(movieId: Long): Boolean?

  @Query("DELETE FROM movies WHERE category = :category AND isFavorite = 0")
  suspend fun clearNonFavoriteCategoryMovies(category: String)
}
