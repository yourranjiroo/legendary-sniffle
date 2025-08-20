const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "hgen",
    version: "1.0",
    author: "Rifat | nxo_here",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate NSFW images using prompt" },
    longDescription: { en: "Generates NSFW images using your prompt via HGen API" },
    category: "nsfw",
    guide: { en: "{p}hgen [prompt]" }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("❌ | Please provide a prompt to generate the NSFW image.");

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_hgen.jpg`);
    const wait = await message.reply(`🔞 Generating NSFW image for: "${prompt}"...\nPlease wait...`);

    try {
      const res = await axios.get(`https://hgen.onrender.com/rl?prompt=${encodeURIComponent(prompt)}`, {
        responseType: "arraybuffer"
      });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      await message.reply({
        body: `✅ | NSFW image generated for: "${prompt}"`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("HGEN Error:", err);
      message.reply("❌ | Failed to generate NSFW image. Try again later or use a different prompt.");
    } finally {
      await fs.remove(imgPath);
      api.unsendMessage(wait.messageID);
    }
  }
};