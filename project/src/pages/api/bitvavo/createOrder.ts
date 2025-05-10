import type { NextApiRequest, NextApiResponse } from "next";
import { createOrder, BitvavoOrderPayload, BitvavoOrderResponse } from "@/lib/bitvavo";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BitvavoOrderResponse | { error: string; details?: unknown }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await createOrder(req.body as BitvavoOrderPayload);
    res.status(200).json(result);
  } catch (error) {
    console.error("Bitvavo API-fout:", error);
    res.status(500).json({ error: "Bitvavo API error", details: error });
  }
}