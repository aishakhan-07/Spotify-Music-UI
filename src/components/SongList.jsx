import React, { useState, useEffect } from "react";

const SongList = ({ songs, searchTerm }) => {
  const [durations, setDurations] = useState({}); // Store durations keyed by song ID

  useEffect(() => {
    const calculateDurations = async () => {
      const durationMap = {};

      for (const song of songs || []) {
        if (song.url) {
          const audio = new Audio(song.url);
          await new Promise((resolve) => {
            audio.addEventListener("loadedmetadata", () => {
              const totalSeconds = Math.floor(audio.duration);
              const minutes = Math.floor(totalSeconds / 60);
              const seconds = totalSeconds % 60;
              durationMap[song.id] = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
              resolve();
            });
            audio.addEventListener("error", () => {
              durationMap[song.id] = "Unknown"; // Handle inaccessible audio
              resolve();
            });
          });
        }
      }

      setDurations(durationMap);
    };

    calculateDurations();
  }, [songs]);

  // Filter songs based on the search term
  const filteredSongs = (songs || []).filter((song) => {
    const title = song.title || "";
    const artist = song.artist || "";
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (filteredSongs.length === 0) {
    return <div className="text-center text-gray-500">No songs found.</div>;
  }

  return (
    <div className="song-list">
      {filteredSongs.map((song) => (
        <div key={song.id} className="song-item p-4 bg-gray-800 rounded-md mb-4">
          <div className="flex items-center space-x-4">
            {/* Song Cover */}
            <img
              src={song.cover}
              alt={song.title}
              className="w-16 h-16 rounded-md object-cover"
            />

            {/* Song Details */}
            <div>
              <h3 className="text-lg font-semibold text-white">{song.title}</h3>
              <p className="text-sm text-gray-400">{song.artist}</p>
              <p className="text-sm text-gray-400">
                {durations[song.id] || "Loading..."}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SongList;
