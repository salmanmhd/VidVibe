import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateInput } from "../utils/validateInputs.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description = "" } = req.body;

  if (!name) {
    return res.status(400).json(
      new ApiResponse(400, "Name is required", {
        error: "Name is missing, please proivde name to create playlist",
      })
    );
  }

  try {
    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while creating playlist", {
          error: "unable to write playlist to db",
        })
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Playlist created successfully", playlist));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Something went wrong while creating playlist", {
        error: error.message,
      })
    );
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId || !isValidObjectId(userId)) {
    return res.status(400).json(
      new ApiResponse(400, "userId is missing or malformed", {
        error: "userId is missing or malformed",
      })
    );
  }

  try {
    const playlist = await Playlist.find({ owner: userId }).select(
      "_id name description videos"
    );

    if (!playlist) {
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while fetching playlist", {
          error: "unable to write to db",
        })
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Playlist fetched successfully", playlist));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Something went wrong while fetching playlist", {
        error: error.message,
      })
    );
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId || !isValidObjectId(playlistId)) {
    return res.status(400).json(
      new ApiResponse(400, "playlistId is missing or malformed", {
        error: "playlistId is missing or malformed",
      })
    );
  }

  try {
    const playlist = await Playlist.findById(playlistId).select(
      "_id name description videos"
    );

    if (!playlist) {
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while fetching playlist", {
          error: "unable to write to db",
        })
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Playlist fetched successfully", playlist));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Something went wrong while fetching playlist", {
        error: error.message,
      })
    );
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const requiredFields = { playlistId, videoId };
  const missingFields = validateInput(requiredFields);

  if (missingFields.length > 0) {
    return res.status(400).json(
      new ApiResponse(400, `Missing required fields`, {
        error: `missing required fields: ${missingFields.join(", ")}`,
      })
    );
  }

  try {
    const addVideo = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
      },
      { $addToSet: { videos: videoId } },
      {
        new: true,
      }
    ).select("_id name description videos");

    if (!addVideo) {
      return res.status(500).json(
        new ApiResponse(500, `Unable to add videos`, {
          error: `unable to update playlist`,
        })
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, `Video added to playlist successfully`, addVideo)
      );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(
        500,
        `Something went wrong while adding video to playlist`,
        {
          error: error.message,
        }
      )
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const requiredFields = { playlistId, videoId };
  const missingFields = validateInput(requiredFields);

  if (missingFields.length > 0) {
    return res.status(400).json(
      new ApiResponse(400, `Missing required fields`, {
        error: `missing required fields: ${missingFields.join(", ")}`,
      })
    );
  }

  try {
    const removeVideo = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
        videos: videoId,
      },
      { $pull: { videos: videoId } },
      {
        new: true,
      }
    ).select("_id name description videos");

    if (!removeVideo) {
      return res.status(500).json(
        new ApiResponse(500, `Unable to remove videos`, {
          error: `video not found in playlist or unable to communicat with db`,
        })
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `Video removed from playlist successfully`,
          removeVideo
        )
      );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(
        500,
        "something went wrong while removing video from playlist",
        {
          error: error.message,
        }
      )
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    return res
      .status(400)
      .json(new ApiResponse(400, `playlistId is missing or invalid`));
  }

  try {
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletedPlaylist) {
      return res.status(500).json(
        new ApiResponse(500, `Something went wrong while deleting playlist`, {
          error: `unable to write to db`,
        })
      );
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, `Playlist deleted successfully`, deletedPlaylist)
      );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Something went wrong while deleting playlist", {
        error: error.message,
      })
    );
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description = "" } = req.body;

  const requiredFields = { playlistId, name };
  const missingFields = validateInput(requiredFields);

  if (missingFields.length > 0) {
    return res.status(400).json(
      new ApiResponse(400, `Missing required fields`, {
        error: `missing required fields: ${missingFields.join(", ")}`,
      })
    );
  }

  try {
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
      },
      { name, description },
      {
        new: true,
      }
    ).select("_id name description videos");

    if (!updatedPlaylist) {
      return res.status(500).json(
        new ApiResponse(500, `Something went wrong while updating playlist`, {
          error: `unable to write playlist to db`,
        })
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, `Playlist updated successfully`, updatedPlaylist)
      );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Something went wrong while updating playlist", {
        error: error.message,
      })
    );
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
