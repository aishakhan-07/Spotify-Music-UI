import React, { useState, useEffect } from "react";

const SongItem = ({ song, onSongSelect }) => {
  const [duration, setDuration] = useState("Loading...");

  useEffect(() => {
    const audio = new Audio(song.url);

    const handleLoadedMetadata = () => {
      const totalSeconds = Math.floor(audio.duration);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setDuration(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
    };

    const handleError = () => {
      setDuration("Unknown");
    };

    // Attach event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);

    return () => {
      // Cleanup event listeners to avoid memory leaks
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
    };
  }, [song.url]);

  return (
    <div
      className="flex items-center py-2 hover:bg-gray-800 cursor-pointer"
      onClick={() => onSongSelect(song)}
    >
      {/* Song Cover */}
      <img
        src={song.cover}
        alt={song.title}
        className="w-12 h-12 rounded-lg object-cover"
      />
      {/* Song Details */}
      <div className="ml-4 flex-1">
        <h3 className="text-lg font-medium">{song.title}</h3>
        <p className="text-gray-400">{song.artist}</p>
        {/* Duration */}
        <p className="text-gray-400">{duration}</p>
      </div>
    </div>
  );
};

export default SongItem;
