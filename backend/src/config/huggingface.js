import { InferenceClient } from "@huggingface/inference";

const HF_TOKEN = process.env.HF_TOKEN;

export const client = new InferenceClient(HF_TOKEN);