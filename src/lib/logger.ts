import { Logger, AxiomJSTransport, ConsoleTransport } from "@axiomhq/logging";
import { Axiom } from "@axiomhq/js";
import { AXIOM_DATASET, AXIOM_TOKEN } from "astro:env/server";

const axiom = new Axiom({
  token: AXIOM_TOKEN,
});

export const logger = new Logger({
  transports: [
    new AxiomJSTransport({ axiom, dataset: AXIOM_DATASET }),
    new ConsoleTransport(),
  ],
});
