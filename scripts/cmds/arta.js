const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "arta",
    aliases: [],
    version: "1.0",
    author: "nexo_here",
    countDown: 10,
    role: 0,
    shortDescription: "Generate image using ARTA AI",
    longDescription: "Generate beautiful images with prompt and optional model using ARTA API",
    category: "AI-IMAGE",
    guide: {
      en: "{pn} <prompt> | <model (optional)>\nExample: {pn} A cyberpunk city | graffiti"
    }
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").split("|");
    const prompt = input[0]?.trim();
    const model = input[1]?.trim() || "Flux"; // default model

    if (!prompt) {
      return api.sendMessage(
        "❌ | Please provide a prompt.\nExample:\n.arta A dragon flying over Tokyo | fantasy_art",
        event.threadID,
        event.messageID
      );
    }

    const wait = await api.sendMessage("⏳ | Generating your image...", event.threadID);

    try {
      const response = await axios({
        method: "GET",
        url: "https://www.arch2devs.ct.ws/api/arta",
        responseType: "arraybuffer",
        params: {
          prompt,
          model, // e.g. graffiti, anime_tattoo, Flux
          aspectRatio: "1:1",
          n: 1,
          guidanceScale: 7,
          numInferenceSteps: 30,
          negativePrompt: "blurry, deformed hands, ugly"
        }
      });

      const path = __dirname + `/cache/arta_${event.senderID}.png`;
      fs.writeFileSync(path, Buffer.from(response.data, "binary"));

      api.sendMessage({
        body: `🎨 | Prompt: ${prompt}\n🧠 | Model: ${model}`,
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path), wait.messageID);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ | Failed to generate image. Please try again later.", event.threadID, wait.messageID);
    }
  }
};
