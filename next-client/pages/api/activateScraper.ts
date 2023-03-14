import * as admin from "firebase-admin";
import { adminDb } from "@/firebaseAdmin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("Submitting...");

    const { search }: { search: string } = req.body;

    console.log("SEARCH IS >>", search);

    const response = await fetch(
      `https://api.brightdata.com/dca/trigger?collector=c_lf4z0lzy18ufdyncwp&queue_next=1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.BRIGHTDATA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ search }),
      }
    );

    const data = await response.json();
    console.log("DATA IS >>", data);

    const {
      collection_id,
      start_eta,
    }: { collection_id: string; start_eta: string } = data;

    await adminDb.collection("searches").doc(collection_id).set({
      search,
      start_eta,
      status: "pending",
      updatedAt: start_eta,
    });

    return res.status(200).json({ collection_id, start_eta });
  } catch (error) {
    console.log("ERROR IS >>>", error);

    return res.status(500).json(error);
  }
}
