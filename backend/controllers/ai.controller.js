import * as ai from "../services/gemini.service.js";

export const getResult = async (req, res) => {
  try {
    const { prompt } = req.query;
    const result = await ai.generateResult(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
