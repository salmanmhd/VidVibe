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
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
