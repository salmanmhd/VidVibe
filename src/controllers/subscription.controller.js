import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId || !isValidObjectId(channelId)) {
    return res.status(400).json(
      new ApiResponse(400, null, {
        error: "channelId is missing or malformed",
      })
    );
  }

  if (channelId === req.user?._id) {
    return res.status(400).json(
      new ApiResponse(400, null, {
        error: "You cannot subscribe to yourself",
      })
    );
  }

  try {
    const isSubscribed = await Subscription.findOne({
      subscriber: req.user?._id,
      channel: channelId,
    });

    if (!isSubscribed) {
      const subscribed = await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, "channel subscribed", subscribed));
    }

    await isSubscribed.deleteOne();

    return res.status(200).json(new ApiResponse(200, "channel unsubscribed"));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "unable to toggle subscription", {
        error: error.message,
      })
    );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log("🟡inside get subscribers");

  if (!channelId || !isValidObjectId(channelId)) {
    return res.status(400).json(
      new ApiResponse(400, null, {
        error: "channelId is missing or malformed",
      })
    );
  }

  try {
    const aggregateQuery = [
      {
        $group: {
          _id: "$channel",
          userIds: { $addToSet: "$subscriber" },
        },
      },
      {
        $match: {
          _id: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userIds",
          foreignField: "_id",
          as: "subscribers",
        },
      },
      {
        $project: {
          subscribers: {
            $map: {
              input: "$subscribers",
              as: "user",
              in: {
                _id: "$$user._id",
                username: "$$user.username",
                email: "$$user.email",
                fullName: "$$user.fullName",
                avatar: "$$user.avatar",
              },
            },
          },
        },
      },
    ];

    const subscribers = await Subscription.aggregate(aggregateQuery);
    if (!subscribers) {
      return res.status(500).json(
        new ApiResponse(500, "unable to get subscribers", {
          error: "unable to get subscribers",
        })
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "subscribers fetched successfully", subscribers)
      );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "unable to get subscribers", {
        error: error.message,
      })
    );
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    return res.status(400).json(
      new ApiResponse(400, null, {
        error: "subscriberId is missing or malformed",
      })
    );
  }

  try {
    const aggregateQuery = [
      {
        $group: {
          _id: "$subscriber",
          channels: {
            $addToSet: "$channel",
          },
        },
      },
      {
        $match: {
          _id: new mongoose.Types.ObjectId(subscriberId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channels",
          foreignField: "_id",
          as: "subscribedTo",
        },
      },
      {
        $project: {
          subscribedTo: {
            $map: {
              input: "$subscribedTo",
              as: "user",
              in: {
                _id: "$$user._id",
                channelName: "$$user.username",
                email: "$$user.email",
                fullName: "$$user.fullName",
                avatar: "$$user.avatar",
                coverImage: "$$user.coverImage",
              },
            },
          },
        },
      },
    ];

    const subscribedChannels = await Subscription.aggregate(aggregateQuery);

    if (!subscribedChannels) {
      return res.status(500).json(
        new ApiResponse(500, "unable to get subscribed channels", {
          error: "unable to get subscribed channels",
        })
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "subscribed channels fetched successfully",
          subscribedChannels
        )
      );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "unable to get subscribed channels", {
        error: error.message,
      })
    );
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
