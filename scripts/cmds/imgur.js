const axios = require("axios");
const xyz = "aryan";

module.exports = {
  config: {
    name: "imgur",
    version: "0.0.1",
    author: "nexo_here",
    countDown: 0,
    role: 0,
    shortDescription: "Upload an image to Imgur",
    longDescription: "Upload any image to Imgur and receive a direct link.",
    category: "utility",
    guide: "{pn} reply to an image, video, or provide a URL"
  },

  onStart: async function ({ api, event, args }) {
    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      let imageUrl = "";

      if (event.messageReply && event.messageReply.attachments.length > 0) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (args.length > 0) {
        imageUrl = args.join(" ");
      }

      if (!imageUrl) {
        api.setMessageReaction("", event.messageID, () => {}, true); 
        return api.sendMessage(
          "❌ Please reply to an image, video, or provide a URL!",
          event.threadID,
          event.messageID
        );
      }

      const response = await axios.get(
        `https://${xyz}-xy-z.vercel.app/imgur?url=${encodeURIComponent(imageUrl)}`
      );

      if (response.data && response.data.success && response.data.link) {
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        return api.sendMessage(
          `${response.data.link}`,
          event.threadID,
          event.messageID
        );
      } else {
        api.setMessageReaction("", event.messageID, () => {}, true);
        return api.sendMessage(
          "❌ Failed to upload the image.",
          event.threadID,
          event.messageID
        );
      }
    } catch (error) {
      console.error(error);
      api.setMessageReaction("", event.messageID, () => {}, true);
      return api.sendMessage(
        "⚠️ An error occurred while uploading the image.",
        event.threadID,
        event.messageID
      );
    }
  }
};
