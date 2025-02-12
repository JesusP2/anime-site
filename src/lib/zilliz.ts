import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import { ZILLIZ_ENDPOINT, ZILLIZ_TOKEN } from "astro:env/server";

export const client = new MilvusClient({
  address: ZILLIZ_ENDPOINT,
  token: ZILLIZ_TOKEN,
});
