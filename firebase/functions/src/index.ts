import * as functions from "firebase-functions";
import { adminDb } from "./firebaseAdmin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const fetchResults: any = async (id: string) => {
  const api_key = process.env.BRIGHTDATA_API_KEY;
  try {
    const response = await fetch(
      `https://api.brightdata.com/dca/dataset?id=${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${api_key}`,
        },
      }
    );

    console.log(`THIS IS A RESPONSE`, response);

    const data = await response.json();
    console.log(data.status);
    if (data.status === "building" || data.status === "collecting") {
      console.log("NOT COMPLETE YET, TRYING AGAIN...");
      return fetchResults(id);
    }

    return data;
  } catch (err) {
    console.log(`error occured`);
    console.error(err);
  }
};

export const onScraperComplete = functions.https.onRequest(
  async (request, response) => {
    console.log("SCRAPE COMPLETE >>> : ", request.body);

    const { success, id, finished } = request.body;
    if (!success) {
      await adminDb.collection("searches").doc(id).set(
        {
          status: "error",
          updatedAt: finished,
        },
        {
          merge: true,
        }
      );
    }

    const data = await fetchResults(id);
    console.log(`DATA ->`, data);
    await adminDb.collection("searches").doc(id).set(
      {
        status: "complete",
        updatedAt: finished,
        results: data,
      },
      {
        merge: true,
      }
    );

    console.log("<><><><><><>< FULL CIRCLE ><><><><><><>");
    response.send("Scraping function finished!");
  }
);
