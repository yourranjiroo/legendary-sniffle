const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "flux3",
    aliases: ["fluxv3"],
    version: "1.0",
    author: "nexo_here",
    countDown: 10,
    role: 0,
    shortDescription: "Generate AI image using FluxAWS API",
    longDescription: "Use prompt and ratio to generate stunning AI images using fluxaws",
    category: "AI-IMAGE",
    guide: {
      en: "{pn} <prompt> | <ratio>\nExample: {pn} a cat with glasses | 1.2"
    }
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").split("|");
    const query = input[0]?.trim();
    const ration = input[1]?.trim() || 1; // Default ratio

    if (!query) {
      return api.sendMessage(
        "❌ | Please provide a prompt to generate image.\nExample:\n.flux A dragon on Mars | 1.5",
        event.threadID,
        event.messageID
      );
    }

    const waiting = await api.sendMessage("⚙️ | Generating image, please wait...", event.threadID);

    try {
      const response = await axios({
        method: "GET",
        url: "https://www.arch2devs.ct.ws/api/fluxaws",
        responseType: "arraybuffer",
        params: {
          query,
          ration
        }
      });

      const filePath = __dirname + `/cache/flux_${event.senderID}.png`;
      fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

      api.sendMessage({
        body: `🧠 Prompt: ${query}\n📐 Ratio: ${ration}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), waiting.messageID);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ | Failed to generate image. Please try again later.", event.threadID, waiting.messageID);
    }
  }
};