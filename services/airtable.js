import Airtable from "airtable";

export const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" });