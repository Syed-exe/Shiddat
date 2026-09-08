package com.shiddat.music.data.db;

import android.content.Context;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import com.shiddat.music.data.db.dao.DownloadDao;
import com.shiddat.music.data.db.dao.OutboxDao;
import com.shiddat.music.data.db.dao.PlaylistDao;
import com.shiddat.music.data.db.dao.TrackDao;
import com.shiddat.music.data.db.entity.DownloadEntity;
import com.shiddat.music.data.db.entity.OutboxEntity;
import com.shiddat.music.data.db.entity.PlaylistEntity;
import com.shiddat.music.data.db.entity.PlaylistTrackCrossRef;
import com.shiddat.music.data.db.entity.TrackEntity;

@Database(
    entities = {
        TrackEntity.class,
        DownloadEntity.class,
        PlaylistEntity.class,
        PlaylistTrackCrossRef.class,
        OutboxEntity.class
    },
    version = 3,
    exportSchema = false
)
public abstract class ShiddatDatabase extends RoomDatabase {
    private static final String DATABASE_NAME = "shiddat_native.db";
    private static volatile ShiddatDatabase INSTANCE;

    public abstract TrackDao trackDao();
    public abstract DownloadDao downloadDao();
    public abstract PlaylistDao playlistDao();
    public abstract OutboxDao outboxDao();

    public static ShiddatDatabase getInstance(Context context) {
        if (INSTANCE == null) {
            synchronized (ShiddatDatabase.class) {
                if (INSTANCE == null) {
                    INSTANCE = Room.databaseBuilder(
                        context.getApplicationContext(),
                        ShiddatDatabase.class,
                        DATABASE_NAME
                    )
                    .fallbackToDestructiveMigration()
                    .allowMainThreadQueries()
                    .build();
                }
            }
        }
        return INSTANCE;
    }
}
