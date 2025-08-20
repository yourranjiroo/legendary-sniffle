const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["remini"],
    version: "1.2",
    author: "nexo_here",
    countDown: 5,
    role: 0,
    shortDescription: "Upscale image to 4K",
    longDescription: "Upscale an image using smfahim.xyz",
    category: "image",
    guide: {
      en: "{pn} [url] or reply to an image"
    },
    usePrefix: true
  },

  onStart: async function ({ api, event, args }) {
    let url = null;

    // ✅ If user replied to an image
    if (event.messageReply?.attachments?.[0]?.type === "photo") {
      url = event.messageReply.attachments[0].url;
    }

    // ✅ Or used direct image URL
    if (!url && args[0]?.startsWith("http")) {
      url = args[0];
    }

    // ❌ If no valid image source
    if (!url) {
      return api.sendMessage("❌ Reply to an image or provide a direct image URL.", event.threadID, event.messageID);
    }

    try {
      api.setMessageReaction("🔄", event.messageID, () => {}, true);

      const res = await axios.get(`https://smfahim.xyz/4k?url=${encodeURIComponent(url)}`);
      if (!res.data?.status || !res.data?.image) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("⚠️ Upscaling failed. Try another image.", event.threadID, event.messageID);
      }

      const img = await axios.get(res.data.image, { responseType: "arraybuffer" });
      const imgPath = path.join(__dirname, "cache", `${event.senderID}_4k.jpg`);
      fs.writeFileSync(imgPath, Buffer.from(img.data, "binary"));

      api.sendMessage(
        { attachment: fs.createReadStream(imgPath) },
        event.threadID,
        () => {
          fs.unlinkSync(imgPath);
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        },
        event.messageID
      );

    } catch (err) {
      console.error("[4k] Error:", err.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("❌ Error occurred while processing image.", event.threadID, event.messageID);
    }
  }
};