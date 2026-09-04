package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface UserRatingDao {

  @Query("SELECT rating FROM user_ratings WHERE contentKey = :contentKey LIMIT 1")
  fun getUserRating(contentKey: String): Flow<Float?>

  @Query("SELECT * FROM user_ratings")
  fun getAllUserRatings(): Flow<List<UserRatingEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun upsertUserRating(rating: UserRatingEntity)

  @Query("DELETE FROM user_ratings WHERE contentKey = :contentKey")
  suspend fun deleteUserRating(contentKey: String)
}
