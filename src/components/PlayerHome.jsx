import React, { useState, useEffect, useRef } from "react";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaVolumeUp,
  FaVolumeMute,
  FaSpotify,
} from "react-icons/fa";
import ReactPlayer from "react-player";
import axios from "axios";

const bg = [
  {
    id: 1,
    gradient: "bg-gradient-to-br from-[rgba(120,74,20,0.1)] to-[rgba(74,44,20,0.1)]",
  },
  {
    id: 2,
    gradient: "bg-gradient-to-br from-[rgba(40,39,122,0.1)] to-[rgba(30,28,76,0.1)]",
  },
  {
    id: 3,
    gradient: "bg-gradient-to-br from-[rgba(157,52,99,0.1)] to-[rgba(91,37,71,0.1)]",
  },
  {
    id: 4,
    gradient: "bg-gradient-to-br from-[rgba(40,129,133,0.1)] to-[rgba(28,95,97,0.1)]",
  },
  {
    id: 7,
    gradient: "bg-gradient-to-br from-[rgba(105,70,30,0.1)] to-[rgba(65,43,24,0.1)]",
  },
  {
    id: 8,
    gradient: "bg-gradient-to-br from-[rgba(105,88,30,0.1)] to-[rgba(65,52,25,0.1)]",
  },
  {
    id: 9,
    gradient: "bg-gradient-to-br from-[rgba(153,20,60,0.1)] to-[rgba(83,20,44,0.1)]",
  },
  {
    id: 10,
    gradient: "bg-gradient-to-br from-[rgba(56,42,184,0.1)] to-[rgba(38,31,113,0.1)]",
  },
];

const PlayerHome = ({ song }) => {
  const [songs, setSongs] = useState([]);
  const [durations, setDurations] = useState({});
  const [selectedSongIndex, setSelectedSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false); // Mute state
  const [searchTerm, setSearchTerm] = useState("");
  const [section, setSection] = useState("forYou");
  const [progress, setProgress] = useState(0);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(
          "https://cms.samespace.com/items/songs"
        );
        const fetchedSongs = response.data.data.map((song) => ({
          id: song.id,
          title: song.name,
          artist: song.artist,
          cover: `https://cms.samespace.com/assets/${song.cover}`,
          url: song.url,
          top_track: song.top_track,
        }));
        setSongs(fetchedSongs);
        calculateDurations(fetchedSongs);
      } catch (err) {
        console.error("Failed to load songs", err);
      }
    };

    fetchSongs();
  }, []);

  const calculateDurations = async (fetchedSongs) => {
    const durationMap = {};

    for (const song of fetchedSongs) {
      if (song.url) {
        const audio = new Audio(song.url);
        await new Promise((resolve) => {
          audio.addEventListener("loadedmetadata", () => {
            const totalSeconds = Math.floor(audio.duration);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            durationMap[song.id] = `${minutes}:${
              seconds < 10 ? "0" : ""
            }${seconds}`;
            resolve();
          });
          audio.addEventListener("error", () => {
            durationMap[song.id] = "Unknown";
            resolve();
          });
        });
      }
    }

    setDurations(durationMap);
  };

  const handleSongSelect = (index) => {
    setSelectedSongIndex(index);
    setIsPlaying(true);
  };

  const handleTogglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const nextIndex = (selectedSongIndex + 1) % songs.length;
    setSelectedSongIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    const prevIndex = (selectedSongIndex - 1 + songs.length) % songs.length;
    setSelectedSongIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSectionChange = (section) => {
    setSection(section);
    setSearchTerm("");
  };

  const handleProgress = (state) => {
    setProgress(state.played * 100);
  };

  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    const duration = playerRef.current.getDuration();
    const newTime = (newProgress / 100) * duration;
    playerRef.current.seekTo(newTime);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const filteredSongs = songs.filter((song) => {
    if (section === "topTracks" && !song.top_track) return false;
    return song.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Apply the gradient dynamically based on the selected song
  const currentSong = songs[selectedSongIndex];
  const currentGradient =
    currentSong && bg.find((gradient) => gradient.id === currentSong.id)
      ? bg.find((gradient) => gradient.id === currentSong.id).gradient
      : "bg-gradient-to-br from-gray-800 to-gray-900";

  return (
    <div className={`flex h-screen ${currentGradient}`}>
      {/* Sidebar */}
      <div className="text-white p-6 flex space-x-2 w-1/4">
        <FaSpotify size={32} />
        <h1 className="text-2xl font-bold">Spotify</h1>
      </div>

      {/* Song List */}
      <div className="text-white p-6 w-1/4 flex flex-col">
        <div className="mb-0">
          <button
            className={`px-4 py-2 mr-2 rounded ${
              section === "forYou"
                ? "bg-transparent text-white font-bold"
                : "bg-transparent text-gray-400"
            } hover:text-white focus:outline-none`}
            onClick={() => handleSectionChange("forYou")}
          >
            For You
          </button>
          <button
            className={`px-4 py-2 rounded ${
              section === "topTracks"
                ? "bg-transparent text-white font-bold"
                : "bg-transparent text-gray-400"
            } hover:text-white focus:outline-none`}
            onClick={() => handleSectionChange("topTracks")}
          >
            Top Tracks
          </button>
        </div>
        <input
          type="text"
          placeholder="Search Songs..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        />
        <h2 className="text-xl font-bold mb-4">All Songs</h2>
        <div className="space-y-0">
          {filteredSongs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800 rounded"
              onClick={() => handleSongSelect(index)}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-12 h-12 rounded"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">{song.title}</span>
                  <span className="text-sm text-gray-400">{song.artist}</span>
                </div>
              </div>
              <span className="text-sm text-gray-400">
                {durations[song.id] || "Loading..."}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Player Section */}
      <div className="text-white p-6 w-1/2 flex flex-col items-center justify-center space-y-4 relative">
        {songs.length > 0 && (
          <>
            <h3 className="text-xl font-bold">
              {songs[selectedSongIndex]?.title}
            </h3>
            <p className="text-gray-400">{songs[selectedSongIndex]?.artist}</p>

            <img
              src={songs[selectedSongIndex]?.cover}
              alt={songs[selectedSongIndex]?.title}
              className="w-96 h-96 object-cover rounded-lg"
            />

            <div className="flex justify-center items-center mt-6 space-x-4">
              <div className="flex items-center gap-x-3 px-28">
                <FaStepBackward
                  className="cursor-pointer text-white"
                  size={25}
                  onClick={handlePrevious}
                />
                <div
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-full cursor-pointer"
                  onClick={handleTogglePlayPause}
                >
                  {isPlaying ? (
                    <FaPause className="text-gray-800" size={15} />
                  ) : (
                    <FaPlay className="text-gray-800" size={15} />
                  )}
                </div>
                <FaStepForward
                  className="cursor-pointer text-white"
                  size={25}
                  onClick={handleNext}
                />
              </div>
              <div
                className="cursor-pointer text-white"
                onClick={toggleMute}
              >
                {isMuted ? <FaVolumeMute size={25} /> : <FaVolumeUp size={25} />}
              </div>
            </div>

            <div className="w-full mt-4 flex justify-center">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-96 h-1 bg-white rounded cursor-pointer"
              />
            </div>

            <ReactPlayer
              ref={playerRef}
              url={songs[selectedSongIndex]?.url}
              playing={isPlaying}
              volume={volume}
              muted={isMuted} // Control mute state
              onEnded={handleNext}
              onProgress={handleProgress}
              width="0"
              height="0"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerHome;
