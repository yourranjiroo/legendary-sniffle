const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "flux2",
    aliases: ["fluximg", "fluxv2"],
    version: "3.0",
    author: "nexo_here",
    countDown: 10,
    role: 0,
    shortDescription: "Generate AI image using Flux v2 API",
    longDescription: "Generate image from text prompt using BetaDash Flux v2",
    category: "AI-IMAGE",
    guide: {
      en: "{pn} <prompt>"
    }
  },

  langs: {
    en: {
      loading: "⏰ Generating image with Flux v2...",
      error: "❌ Failed to generate image. Please try again later."
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("⚠️ Please provide a prompt!");

    message.reply(getLang("loading"));

    try {
      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/fluxv2?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(apiUrl);

      const imageUrl = res.data.imageUrl;
      if (!imageUrl) throw new Error("No image URL found in API response");

      const imgStream = await getStreamFromURL(imageUrl);

      return message.reply({
        body: `🖼️ Prompt: ${prompt}`,
        attachment: imgStream
      });

    } catch (err) {
      console.error("Flux v2 API Error:", err.message || err);
      return message.reply(getLang("error"));
    }
  }
};